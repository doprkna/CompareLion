export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthedUser } from '@/lib/server/auth';
import { updateWalletWithLock } from '@/lib/utils/walletTransactions';
import { z } from 'zod';

const PurchaseSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const { id: userId } = getAuthedUser(req);
    const body = await req.json();
    
    // Validate input
    const validationResult = PurchaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase data' },
        { status: 400 }
      );
    }

    const { productId, quantity } = validationResult.data;

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: true,
      },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { success: false, error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Get the price for the default currency (assuming USD)
    const price = product.prices.find(p => p.currency === 'usd');
    if (!price) {
      return NextResponse.json(
        { success: false, error: 'Product pricing not available' },
        { status: 400 }
      );
    }

    const totalAmount = price.amountMinor * quantity;

    // Check if user already has this product (for non-stackable items)
    if (!product.stackable) {
      const existingEntitlement = await prisma.entitlement.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingEntitlement) {
        return NextResponse.json(
          { success: false, error: 'You already own this product' },
          { status: 400 }
        );
      }
    }

    // Update wallet with lock to prevent race conditions
    const walletUpdate = await updateWalletWithLock({
      userId,
      tenantId: 'default',
      fundsDelta: -totalAmount,
      refType: 'purchase',
      refId: `purchase_${Date.now()}`,
      note: `Purchase: ${product.title} (${quantity}x)`,
    });

    if (!walletUpdate.success) {
      return NextResponse.json(
        { success: false, error: walletUpdate.error || 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Create purchase record and entitlement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId,
          tenantId: 'default',
          productId,
          quantity,
          totalMinor: totalAmount,
          status: 'SUCCEEDED',
        },
      });

      // Create entitlement(s)
      const entitlements = [];
      for (let i = 0; i < quantity; i++) {
        const entitlement = await tx.entitlement.create({
          data: {
            userId,
            tenantId: 'default',
            productId,
            meta: {
              purchaseId: purchase.id,
              quantity: quantity,
              purchasedAt: new Date().toISOString(),
            },
          },
        });
        entitlements.push(entitlement);
      }

      return { purchase, entitlements };
    });

    return NextResponse.json({
      success: true,
      purchase: {
        id: result.purchase.id,
        productId: result.purchase.productId,
        quantity: result.purchase.quantity,
        totalAmount,
        status: result.purchase.status,
        createdAt: result.purchase.createdAt.toISOString(),
      },
      entitlements: result.entitlements.map(e => ({
        id: e.id,
        productId: e.productId,
        createdAt: e.createdAt.toISOString(),
      })),
      wallet: {
        funds: walletUpdate.newBalance.funds,
        diamonds: walletUpdate.newBalance.diamonds,
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Purchase failed' },
      { status: 500 }
    );
  }
}
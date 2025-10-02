export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_APP_URL } from '@/lib/config';
import { prisma } from '@/lib/db';
import { getAuthedUser } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const { id: userId } = getAuthedUser(req);
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }
    // Fetch product and price
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { prices: true } });
    if (!product || product.kind !== 'CURRENCY_PACK') {
      return NextResponse.json({ success: false, error: 'Invalid product' }, { status: 400 });
    }
    const price = product.prices[0];
    if (!price?.stripePriceId) {
      return NextResponse.json({ success: false, error: 'Product not available for Stripe' }, { status: 400 });
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userId, // For simplicity; adjust as needed
      line_items: [{ price: price.stripePriceId, quantity: 1 }],
      success_url: `${NEXT_PUBLIC_APP_URL}/shop?success=true`,
      cancel_url: `${NEXT_PUBLIC_APP_URL}/shop?canceled=true`,
      metadata: { userId, productId },
    });
    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}

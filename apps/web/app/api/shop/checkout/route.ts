export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }
    // TODO: integrate with Stripe to create a real Checkout Session
    const dummyUrl = `https://stripe.com/checkout/session?product=${encodeURIComponent(productId)}`;
    return NextResponse.json({ success: true, url: dummyUrl });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}

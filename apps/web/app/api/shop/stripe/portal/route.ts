export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // TODO: create Stripe customer portal session
    const url = 'https://stripe.com/customer-portal';
    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error('Portal error:', err);
    return NextResponse.json({ success: false, error: 'Portal creation failed' }, { status: 500 });
  }
}

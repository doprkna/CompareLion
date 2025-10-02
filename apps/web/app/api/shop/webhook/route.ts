export const runtime = 'nodejs';

import { buffer } from 'micro';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/config';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 400 });
  }

  // TODO: handle event types (checkout.session.completed, customer.subscription.*)
  console.log('Received Stripe event:', event.type);

  return NextResponse.json({ success: true });
}

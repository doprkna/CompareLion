export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
// Reuse shop checkout placeholder
import { POST as shopCheckout } from '../../../shop/checkout/route';

export { shopCheckout as POST };

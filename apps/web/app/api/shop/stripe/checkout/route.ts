export const runtime = 'nodejs';

// Reuse shop checkout placeholder
import { POST as shopCheckout } from "@/app/api/shop/checkout/route";

export { shopCheckout as POST };

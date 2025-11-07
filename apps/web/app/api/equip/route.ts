export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { getAuthedUser } from '@/lib/server/auth';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, forbiddenError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const { productId } = await req.json();
  const { id: userId } = getAuthedUser(req);
  
  if (!productId) {
    return validationError('Missing productId');
  }
  
  // Verify entitlement exists
  const ent = await prisma.entitlement.findUnique({ where: { userId_productId: { userId, productId } } });
  if (!ent) {
    return forbiddenError('Not entitled');
  }
  
  // Determine category from payload
  const product = await prisma.product.findUnique({ where: { id: productId } });
  const category = (product?.payload as any).category;
  if (!category) {
    return validationError('Cannot equip this product');
  }
  
  // Upsert UserProfile
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      equippedAvatarId: category === 'avatar' ? productId : undefined,
      equippedBackgroundId: category === 'background' ? productId : undefined,
      equippedSkinId: category === 'ui_skin' ? productId : undefined,
    },
    create: {
      userId,
      equippedAvatarId: category === 'avatar' ? productId : null,
      equippedBackgroundId: category === 'background' ? productId : null,
      equippedSkinId: category === 'ui_skin' ? productId : null,
    },
  });
  
  return successResponse({ profile });
});

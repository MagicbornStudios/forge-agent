import type { TaskHandler } from 'payload';

export const activatePromotion: TaskHandler = async ({ input, req }) => {
  const promotionId = (input as { promotionId: number }).promotionId;
  const doc = await req.payload.findByID({
    collection: 'promotions',
    id: promotionId,
  });
  if (!doc) throw new Error(`Promotion ${promotionId} not found`);
  await req.payload.update({
    collection: 'promotions',
    id: promotionId,
    data: { active: true },
  });
  return { output: { updated: true } };
};

import type { TaskHandler } from 'payload';

type PromotionTaskIO = { input: { promotionId: number }; output: { updated: boolean } };

export const activatePromotion: TaskHandler<PromotionTaskIO> = async ({ input, req }) => {
  const promotionId = input.promotionId;
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

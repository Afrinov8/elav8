import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { sales, inventoryItems } from "../schema";

export const salesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(1).max(200),
        amount: z.coerce.number().min(0),
        itemId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [sale] = await db
        .insert(sales)
        .values({
          businessId: ctx.session.businessId,
          itemId: input.itemId ?? null,
          description: input.description,
          amount: input.amount.toFixed(2),
        })
        .returning();

      if (input.itemId) {
        const item = await db.query.inventoryItems.findFirst({
          where: and(eq(inventoryItems.id, input.itemId), eq(inventoryItems.businessId, ctx.session.businessId)),
        });
        if (item && item.stockQty > 0) {
          await db
            .update(inventoryItems)
            .set({ stockQty: item.stockQty - 1, updatedAt: new Date() })
            .where(eq(inventoryItems.id, input.itemId));
        }
      }

      return sale;
    }),
});

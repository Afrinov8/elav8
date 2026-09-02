import { z } from "zod";
import { and, eq, asc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { inventoryItems } from "../schema";

export const inventoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await db.query.inventoryItems.findMany({
      where: eq(inventoryItems.businessId, ctx.session.businessId),
      orderBy: asc(inventoryItems.name),
    });
    return items;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        sellingPrice: z.coerce.number().min(0),
        costPrice: z.coerce.number().min(0),
        stockQty: z.coerce.number().int().min(0).default(0),
        lowStockThreshold: z.coerce.number().int().min(0).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [item] = await db
        .insert(inventoryItems)
        .values({
          businessId: ctx.session.businessId,
          name: input.name,
          sellingPrice: input.sellingPrice.toFixed(2),
          costPrice: input.costPrice.toFixed(2),
          stockQty: input.stockQty,
          lowStockThreshold: input.lowStockThreshold,
        })
        .returning();
      return item;
    }),

  reorder: protectedProcedure
    .input(z.object({ id: z.number(), quantity: z.number().int().positive().default(10) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.inventoryItems.findFirst({
        where: and(eq(inventoryItems.id, input.id), eq(inventoryItems.businessId, ctx.session.businessId)),
      });
      if (!existing) throw new Error("Item not found");
      const [item] = await db
        .update(inventoryItems)
        .set({ stockQty: existing.stockQty + input.quantity, updatedAt: new Date() })
        .where(eq(inventoryItems.id, input.id))
        .returning();
      return item;
    }),

  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db
      .delete(inventoryItems)
      .where(and(eq(inventoryItems.id, input.id), eq(inventoryItems.businessId, ctx.session.businessId)));
    return { ok: true };
  }),
});

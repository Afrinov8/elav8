import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { invoices } from "../schema";

export const invoicesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.query.invoices.findMany({
      where: eq(invoices.businessId, ctx.session.businessId),
      orderBy: desc(invoices.createdAt),
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1).max(200),
        customerPhone: z.string().max(32).optional(),
        amount: z.coerce.number().min(0),
        dueInDays: z.number().int().min(0).default(7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [invoice] = await db
        .insert(invoices)
        .values({
          businessId: ctx.session.businessId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          amount: input.amount.toFixed(2),
          status: "sent",
          dueDate: new Date(Date.now() + input.dueInDays * 24 * 60 * 60 * 1000),
        })
        .returning();
      return invoice;
    }),

  markPaid: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const [invoice] = await db
      .update(invoices)
      .set({ status: "paid" })
      .where(and(eq(invoices.id, input.id), eq(invoices.businessId, ctx.session.businessId)))
      .returning();
    return invoice;
  }),
});

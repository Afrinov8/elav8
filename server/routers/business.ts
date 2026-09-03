import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { businesses, users, consents } from "../schema";

export const businessRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const business = await db.query.businesses.findFirst({ where: eq(businesses.id, ctx.session.businessId) });
    const owner = await db.query.users.findFirst({ where: eq(users.id, ctx.session.userId) });
    return { business, owner: owner ? { fullName: owner.fullName, phone: owner.phone, email: owner.email } : null };
  }),

  updatePrivacy: protectedProcedure
    .input(z.object({ smsConsent: z.boolean().optional(), dataSharing: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .update(consents)
        .set({ ...(input.smsConsent !== undefined && { smsConsent: input.smsConsent }), ...(input.dataSharing !== undefined && { dataSharing: input.dataSharing }) })
        .where(eq(consents.userId, ctx.session.userId))
        .returning();
      return row;
    }),

  getPrivacy: protectedProcedure.query(async ({ ctx }) => {
    const row = await db.query.consents.findFirst({ where: eq(consents.userId, ctx.session.userId) });
    return row ?? { eula: true, acknowledgement: true, smsConsent: true, dataSharing: false };
  }),
});

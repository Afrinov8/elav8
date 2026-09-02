import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../db";
import { businesses, users, consents, inventoryItems, sales, invoices } from "../schema";
import { hashPassword, verifyPassword, signSessionToken } from "../auth";
import { TRPCError } from "@trpc/server";

const industries = [
  "Personal Care & Beauty",
  "Automotive & Repair",
  "Food, Beverage & Hospitality",
  "Construction & Trades",
  "Transport & Logistics",
  "Retail & Trading",
  "Home & Domestic Services",
  "Events & Entertainment",
  "Professional Services",
  "Other",
] as const;

const signupInput = z.object({
  businessName: z.string().min(2).max(200),
  industry: z.enum(industries),
  moduleChoice: z.enum(["stock", "jobs", "both"]),
  fullName: z.string().min(2).max(200),
  phone: z.string().min(6).max(32),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6).max(128),
  registered: z.boolean().default(false),
  registrationNumber: z.string().max(100).optional(),
  physicalAddress: z.string().max(400).optional(),
  addressSameAsPhysical: z.boolean().default(true),
  businessAddress: z.string().max(400).optional(),
  website: z.string().max(300).optional(),
  dateOfBirth: z.string().max(32).optional(),
  consents: z.object({
    eula: z.boolean(),
    acknowledgement: z.boolean(),
    smsConsent: z.boolean(),
    dataSharing: z.boolean(),
  }),
});

async function seedDemoData(businessId: number, moduleChoice: string) {
  if (moduleChoice === "jobs") {
    await db.insert(invoices).values([
      {
        businessId,
        customerName: "Thabo Nkosi",
        customerPhone: "+27 82 000 0000",
        amount: "450.00",
        status: "overdue",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        businessId,
        customerName: "Lindiwe Dube",
        customerPhone: "+27 83 111 1111",
        amount: "820.00",
        status: "sent",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ]);
    return;
  }

  const [item1, item2, item3] = await db
    .insert(inventoryItems)
    .values([
      { businessId, name: "Signature product", sellingPrice: "120.00", costPrice: "70.00", stockQty: 18, lowStockThreshold: 5 },
      { businessId, name: "Best seller", sellingPrice: "65.00", costPrice: "40.00", stockQty: 4, lowStockThreshold: 5 },
      { businessId, name: "Everyday essential", sellingPrice: "35.00", costPrice: "20.00", stockQty: 22, lowStockThreshold: 6 },
    ])
    .returning();

  const today = new Date();
  const salesRows = [
    { businessId, itemId: item1.id, description: item1.name, amount: "120.00", offsetDays: 0 },
    { businessId, itemId: item2.id, description: item2.name, amount: "65.00", offsetDays: 1 },
    { businessId, itemId: item1.id, description: item1.name, amount: "240.00", offsetDays: 2 },
    { businessId, itemId: item3.id, description: item3.name, amount: "35.00", offsetDays: 3 },
    { businessId, itemId: item1.id, description: item1.name, amount: "120.00", offsetDays: 8 },
    { businessId, itemId: item2.id, description: item2.name, amount: "130.00", offsetDays: 9 },
  ];
  await db.insert(sales).values(
    salesRows.map((row) => ({
      businessId: row.businessId,
      itemId: row.itemId,
      description: row.description,
      amount: row.amount,
      createdAt: new Date(today.getTime() - row.offsetDays * 24 * 60 * 60 * 1000),
    })),
  );

  if (moduleChoice === "both") {
    await db.insert(invoices).values([
      {
        businessId,
        customerName: "Thabo Nkosi",
        customerPhone: "+27 82 000 0000",
        amount: "450.00",
        status: "overdue",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);
  }
}

export const authRouter = router({
  industries: publicProcedure.query(() => industries),

  signup: publicProcedure.input(signupInput).mutation(async ({ input }) => {
    const existing = await db.query.users.findFirst({
      where: or(eq(users.phone, input.phone), input.email ? eq(users.email, input.email) : undefined),
    });
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "An account with this phone or email already exists." });
    }

    const [business] = await db
      .insert(businesses)
      .values({
        name: input.businessName,
        industry: input.industry,
        registered: input.registered,
        registrationNumber: input.registrationNumber,
        addressSameAsPhysical: input.addressSameAsPhysical,
        businessAddress: input.businessAddress,
        moduleChoice: input.moduleChoice,
      })
      .returning();

    const passwordHash = await hashPassword(input.password);
    const [user] = await db
      .insert(users)
      .values({
        businessId: business.id,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        passwordHash,
        dateOfBirth: input.dateOfBirth,
        physicalAddress: input.physicalAddress,
        website: input.website,
      })
      .returning();

    await db.insert(consents).values({
      userId: user.id,
      eula: input.consents.eula,
      acknowledgement: input.consents.acknowledgement,
      smsConsent: input.consents.smsConsent,
      dataSharing: input.consents.dataSharing,
    });

    await seedDemoData(business.id, input.moduleChoice);

    const token = await signSessionToken({ userId: user.id, businessId: business.id });
    return { token, user: { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email }, business };
  }),

  login: publicProcedure
    .input(z.object({ identifier: z.string().min(3), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const identifier = input.identifier.trim();
      const user = await db.query.users.findFirst({
        where: or(eq(users.phone, identifier), eq(users.email, identifier)),
      });
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "We couldn't find that account." });
      }
      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "That password doesn't match." });
      }
      const business = await db.query.businesses.findFirst({ where: eq(businesses.id, user.businessId) });
      const token = await signSessionToken({ userId: user.id, businessId: user.businessId });
      return { token, user: { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email }, business };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.session.userId) });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    const business = await db.query.businesses.findFirst({ where: eq(businesses.id, ctx.session.businessId) });
    return { user: { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email }, business };
  }),
});

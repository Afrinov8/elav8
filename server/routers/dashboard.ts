import { and, eq, gte, lt, lte, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { sales, inventoryItems, invoices } from "../schema";
import { addDays, dayKey, startOfWeek } from "../dates";

export const dashboardRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const businessId = ctx.session.businessId;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const nextWeekStart = addDays(weekStart, 7);
    const prevWeekStart = addDays(weekStart, -7);

    const [thisWeekRows, lastWeekRows, sparklineRows] = await Promise.all([
      db
        .select({ amount: sales.amount })
        .from(sales)
        .where(and(eq(sales.businessId, businessId), gte(sales.createdAt, weekStart), lt(sales.createdAt, nextWeekStart))),
      db
        .select({ amount: sales.amount })
        .from(sales)
        .where(and(eq(sales.businessId, businessId), gte(sales.createdAt, prevWeekStart), lt(sales.createdAt, weekStart))),
      db
        .select({ amount: sales.amount, createdAt: sales.createdAt })
        .from(sales)
        .where(and(eq(sales.businessId, businessId), gte(sales.createdAt, addDays(now, -6)))),
    ]);

    const sum = (rows: { amount: string }[]) => rows.reduce((acc, r) => acc + Number(r.amount), 0);
    const thisWeekTotal = sum(thisWeekRows);
    const lastWeekTotal = sum(lastWeekRows);
    const delta = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : thisWeekTotal > 0 ? 100 : 0;

    const buckets = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      buckets.set(dayKey(addDays(now, -i)), 0);
    }
    for (const row of sparklineRows) {
      const key = dayKey(new Date(row.createdAt));
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
    }
    const sparkline = Array.from(buckets.values());

    const items = await db.query.inventoryItems.findMany({ where: eq(inventoryItems.businessId, businessId) });
    const lowStock = items
      .filter((item) => item.stockQty <= item.lowStockThreshold)
      .sort((a, b) => a.stockQty - b.stockQty);

    const overdueInvoices = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), sql`${invoices.status} != 'paid'`, lte(invoices.dueDate, now)));

    const suggestion = overdueInvoices[0]
      ? {
          customerName: overdueInvoices[0].customerName,
          invoiceId: overdueInvoices[0].id,
          amount: overdueInvoices[0].amount,
          draft: `Hi ${overdueInvoices[0].customerName.split(" ")[0]}, just a friendly reminder that your invoice of R${Number(overdueInvoices[0].amount).toFixed(2)} is now overdue. Let me know if you'd like to arrange payment. Thank you!`,
        }
      : null;

    return {
      revenue: {
        thisWeek: thisWeekTotal,
        lastWeek: lastWeekTotal,
        deltaPct: Math.round(delta * 10) / 10,
        sparkline,
      },
      lowStock: lowStock.slice(0, 5).map((i) => ({ id: i.id, name: i.name, stockQty: i.stockQty, lowStockThreshold: i.lowStockThreshold })),
      lowStockCount: lowStock.length,
      overdueCount: overdueInvoices.length,
      suggestion,
    };
  }),
});

import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { businessRouter } from "./routers/business";
import { inventoryRouter } from "./routers/inventory";
import { salesRouter } from "./routers/sales";
import { invoicesRouter } from "./routers/invoices";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = router({
  auth: authRouter,
  business: businessRouter,
  inventory: inventoryRouter,
  sales: salesRouter,
  invoices: invoicesRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

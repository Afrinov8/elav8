// Vercel serverless entrypoint. Vercel routes any /api/* request to this
// catch-all function; the Express app inside handles /api/health and
// /api/trpc/* itself using the original request path.
import { app } from "../server/app";

export default app;

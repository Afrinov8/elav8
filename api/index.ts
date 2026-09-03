// Vercel serverless entrypoint. vercel.json rewrites every /api/* request
// here explicitly (see "rewrites") so nested paths like /api/trpc/auth.signup
// are guaranteed to reach this function — Vercel's automatic catch-all file
// routing ([...path].ts) was observed to only match single-segment paths in
// this project, silently 404ing anything nested. The Express app inside
// handles /api/health and /api/trpc/* itself using the original request path.
import { app } from "../server/app";

export default app;

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifySessionToken } from "./auth";

export async function createContext({ req }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const session = token ? await verifySessionToken(token) : null;

  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

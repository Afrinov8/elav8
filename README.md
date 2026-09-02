# Elav8 — Business Command Center

Mobile-first Business OS for South African informal-business owners, built
with Expo Router, tRPC, Drizzle, and Neon Postgres. See `design.md`-derived
briefs for the full product/UI spec (not checked in here — ask in the repo
if you need the source docs).

Stage 1 of this build ships: a stylized skyline splash, login, a lightweight
signup, and the three Command Center dashboards (Home, Inventory, Profile)
wired to a real Postgres backend. The full multi-step onboarding flow
(identity verification, OTP, vetting) is Stage 2.

## Stack

- Expo SDK 54 (Expo Router, NativeWind, Reanimated, Gesture Handler, SVG)
- Express + tRPC v11 API (`server/`)
- Drizzle ORM against Neon serverless Postgres (`server/schema.ts`)
- JWT session auth (`jose` + `bcryptjs`) — simple phone/email + password

## Setup

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL (from your Neon project) and JWT_SECRET (openssl rand -hex 32)
npm run db:generate   # generate SQL from server/schema.ts if you change it
npm run db:push       # interactive: applies schema to your Neon database
```

## Running

This app is two processes: the Expo/Metro dev server and the API server.

```bash
npm run dev       # API on :3000 + Metro on :8081, for web/simulator use
npm run tunnel     # API on :3000 + `expo start --tunnel`, for testing on a
                   # physical phone via Expo Go — see note below
```

### Testing on your phone with Expo Go

`expo start --tunnel` only tunnels the Metro bundler (port 8081). Your phone
also needs to reach the API server on port 3000. Two options:

1. **Same Wi-Fi network** (simplest): run `npm run dev` (no `--tunnel`) and
   scan the QR code — the app auto-derives the API URL from the Metro dev
   server's LAN address (see `constants/api.ts`).
2. **Different network / remote machine**: tunnel port 3000 too (e.g.
   `npx ngrok http 3000`) and set `EXPO_PUBLIC_API_URL` in `.env` to that
   public URL before running `npm run tunnel`.

> Note: this repo was scaffolded in a sandboxed cloud session where outbound
> ngrok connections are blocked by the sandbox's network policy, so the live
> tunnel could not be demoed from that session. Both `npm run dev` (same
> Wi-Fi) and `npm run tunnel` (with `EXPO_PUBLIC_API_URL` set) work normally
> on a regular machine.

## Project layout

```
app/(auth)/        login, welcome, signup — unauthenticated routes
app/(tabs)/         Home (Command Center), Inventory, Profile
components/ui/      design-system primitives (Button, LedgerInput, Toggle, …)
server/             Express + tRPC API, Drizzle schema, Neon connection
constants/theme.ts  brand color/type tokens (see design.md)
```

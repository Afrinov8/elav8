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

### Testing on the same device (e.g. Termux on Android)

If Metro and the API server run on the *same* device as Expo Go, skip
tunneling entirely:

```bash
pkg install -y nodejs-lts git   # Termux only
git clone https://github.com/Afrinov8/elav8 && cd elav8
git checkout claude/elav8-neon-mvp
npm install
cp .env.example .env   # fill in DATABASE_URL / JWT_SECRET
npm run phone           # API on :3000 + `expo start --localhost`
```

Open Expo Go, choose "Enter URL manually," and enter the `exp://` URL the
CLI prints (something like `exp://127.0.0.1:8081`). The app derives the API
URL from the same host automatically (`constants/api.ts`).

Note: `npm run lint` and `npm test` pull in devDependencies with native
addons (`lightningcss`, `rollup`, an eslint resolver) that may not have
prebuilt Android/Termux binaries — that's fine, neither is needed to run the
app itself, only for linting/testing.

## Deploying the web app (Vercel)

One Vercel project serves both halves of the product:

- **Frontend** — `npm run build` runs `expo export --platform web`, writing a
  static site to `dist/`. Expo Router emits one HTML file per route, so deep
  links work without a SPA fallback.
- **API** — `api/index.ts` is the serverless entrypoint; it re-exports the
  same Express app as `server/app.ts`. The standalone listener in
  `server/index.ts` is a local-dev/Termux concern only and never runs in
  production.

`vercel.json` wires that together: `framework: null`, `buildCommand: npm run
build`, `outputDirectory: dist`, plus a rewrite sending every `/api/*`
request to the `api/` function so nested tRPC paths like
`/api/trpc/auth.login` resolve.

The deployed frontend calls the API on its own origin — `constants/api.ts`
returns a relative base for production web builds — so no API hostname is
baked into the bundle and CORS stays out of the way.

```bash
npm run build   # same build Vercel runs; output lands in dist/
```

To deploy:

1. vercel.com → New Project → import `Afrinov8/elav8`
2. Framework preset: **Other** (already forced via `vercel.json`)
3. Add environment variables `DATABASE_URL` (your Neon connection string)
   and `JWT_SECRET` (`openssl rand -hex 32`, different from your local one
   is fine)
4. Deploy → you'll get a URL like `https://elav8.vercel.app`; verify both
   halves:
   ```bash
   curl https://elav8.vercel.app/api/health   # {"ok":true,...}
   curl -I https://elav8.vercel.app/login     # 200
   ```

## Building a real installable APK (EAS)

For an app that works without Termux running and without Expo Go, build a
standalone APK via EAS. This needs two things only you can set up (your
accounts, not something this repo can do for you):

1. **A permanent, public home for the API.** The dev server above only
   works while your machine is running it — an installed APK can't reach
   `localhost`. Deploy the Vercel project as described in *Deploying the web
   app* above, then put its URL (`https://elav8.vercel.app`) in `eas.json`'s
   `preview`/`production` profiles — replacing `EXPO_PUBLIC_API_URL`'s
   placeholder — and push. Native builds can't derive the API host the way
   the web build can, so this variable is required there.

2. **An Expo account**, since EAS builds run under your account, not this
   repo's:
   ```bash
   npm install -g eas-cli
   eas login
   eas init                              # creates the project, links it
   eas build --platform android --profile preview
   ```
   This runs on Expo's build servers (not your device — fine under Termux),
   and finishes with a download link/QR code for a real `.apk` you can
   sideload directly, no Expo Go required.

## Project layout

```
app/(auth)/        login, welcome, signup — unauthenticated routes
app/(tabs)/         Home (Command Center), Inventory, Profile
components/ui/      design-system primitives (Button, LedgerInput, Toggle, …)
server/app.ts       Express app (platform-agnostic — used by both server/index.ts and api/)
server/index.ts     local/Termux dev entrypoint (listens on :3000) — never
                    started in production
api/index.ts        Vercel serverless entrypoint (same Express app; vercel.json
                    rewrites all of /api/* here so nested tRPC paths resolve)
constants/api.ts    resolves the API base URL (relative on deployed web,
                    EXPO_PUBLIC_API_URL on native)
constants/theme.ts  brand color/type tokens (see design.md)
vercel.json         static frontend (dist/) + api/ function deploy config
```

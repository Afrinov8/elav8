import dotenv from "dotenv";

// Load the base .env first, then layer .env.local on top (where key-managed
// values like DATABASE_URL / JWT_SECRET live). Must be imported first in the
// module graph so env vars exist before db/config modules read them.
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

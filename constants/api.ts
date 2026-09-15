import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolves the API base URL for the tRPC client.
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_URL — set this for native builds (an installed APK has
 *     no origin to resolve against) and for physical-device testing via a
 *     tunnel/ngrok URL.
 *  2. Deployed web builds — the static frontend and the `api/` serverless
 *     functions are served from the same origin, so a relative base works and
 *     no hostname has to be baked into the bundle. This is the production
 *     path: `expo export --platform web` sets NODE_ENV=production.
 *  3. Metro dev server host — works for web/simulator/emulator on the same
 *     machine, where Metro is on :8081 and the API is on :3000.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (Platform.OS === "web" && process.env.NODE_ENV === "production") {
    return "";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

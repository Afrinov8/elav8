import Constants from "expo-constants";

/**
 * Resolves the API base URL for the tRPC client.
 *
 * Priority: EXPO_PUBLIC_API_URL env var (set this to your tunnel/ngrok URL
 * when testing on a physical device via Expo Go) > derived from the Metro
 * dev server host (works for simulators/emulators on the same machine).
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

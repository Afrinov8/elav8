import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "elav8_session_token";

type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

// SecureStore is not available on web; fall back to localStorage there.
const webStorage: Storage = {
  async getItem(key) {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  },
  async setItem(key, value) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  },
  async removeItem(key) {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
};

const secureStorage: Storage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const storage = Platform.OS === "web" ? webStorage : secureStorage;

export async function getSessionToken(): Promise<string | null> {
  try {
    return (await storage.getItem(TOKEN_KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  await storage.setItem(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await storage.removeItem(TOKEN_KEY);
}

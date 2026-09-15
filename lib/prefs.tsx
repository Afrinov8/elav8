import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccessibilityInfo } from "react-native";

/**
 * Prototype view state from design.md's supporting state list:
 * `reducedMotion` and `hapticEnabled` persist across sessions so the
 * accessibility contract survives a reload.
 */
type Preferences = {
  reducedMotion: boolean;
  hapticEnabled: boolean;
};

const STORAGE_KEY = "elav8.preferences.v1";

const defaults: Preferences = { reducedMotion: false, hapticEnabled: true };

type PrefsContextValue = {
  prefs: Preferences;
  ready: boolean;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: Partial<Preferences> = {};
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw) as Partial<Preferences>;
      } catch {
        // unreadable storage falls back to defaults
      }
      let systemReducedMotion = false;
      try {
        systemReducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
      } catch {
        // platform without the API (web safari) — default to motion enabled
      }
      if (cancelled) return;
      setPrefs({
        reducedMotion: stored.reducedMotion ?? systemReducedMotion,
        hapticEnabled: stored.hapticEnabled ?? defaults.hapticEnabled,
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPref = useCallback<PrefsContextValue["setPref"]>((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ prefs, ready, setPref }), [prefs, ready, setPref]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}

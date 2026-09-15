import { useMemo } from "react";
import * as Haptics from "expo-haptics";

import { usePrefs } from "@/lib/prefs";

/**
 * The haptics map from design.md. Every call is a no-op when the user has
 * switched haptics off, and never throws on platforms without a taptic engine
 * (web, older Android).
 */
export type HapticsApi = {
  /** Segment change. */
  selection: () => void;
  /** OTP digit entered. */
  light: () => void;
  /** Validation error. */
  rigid: () => void;
  /** Reorder confirmed. */
  soft: () => void;
  /** Verification success. */
  success: () => void;
};

export function useHaptics(): HapticsApi {
  const { prefs } = usePrefs();
  const enabled = prefs.hapticEnabled;

  return useMemo<HapticsApi>(() => {
    const fire = (run: () => void) => {
      if (!enabled) return;
      try {
        run();
      } catch {
        // no haptic engine — silent by design (no sound, ever)
      }
    };
    return {
      selection: () => fire(() => Haptics.selectionAsync()),
      light: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
      rigid: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)),
      soft: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
      success: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
    };
  }, [enabled]);
}

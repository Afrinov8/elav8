import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

import { SkylineBand } from "@/components/skyline";
import { motion, palette, type } from "@/constants/theme";

/**
 * Skyline Splash — Deep Ledger base, three-plane skyline in the lower third,
 * Elav8 wordmark centred with a 2dp Ochre loading hairline beneath it.
 * Held for 900ms; if the app is still loading after 1200ms the hairline
 * breathes between 40% and 100% opacity.
 */
export function SkylineSplash({ hint }: { hint?: string }) {
  const { height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const breath = useSharedValue(1);

  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const duration = reducedMotion ? motion.reduced : motion.splashHold;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [progress, reducedMotion]);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), motion.splashSlowLoad);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!slow || reducedMotion) return;
    breath.value = withRepeat(withTiming(0.4, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [slow, breath, reducedMotion]);

  const barStyle = useAnimatedStyle(() => ({ width: 96 * progress.value }));
  const markStyle = useAnimatedStyle(() => ({ opacity: breath.value }));

  const skylineHeight = Math.min(height * 0.46, 320);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.skyline, { height: skylineHeight }]} pointerEvents="none">
        <SkylineBand />
      </View>

      <Animated.View style={[styles.mark, markStyle]}>
        <Text style={styles.wordmark}>Elav8</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, barStyle]} />
        </View>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </Animated.View>
    </View>
  );
}

/**
 * Shows the splash exactly once per app session, until the session has
 * resolved *and* the 900ms hold has elapsed. Both the (auth) and (tabs)
 * layouts use it, so the mark never flashes twice.
 */
let splashConsumed = false;

export function useSplashGate(ready: boolean): boolean {
  const [elapsed, setElapsed] = useState(false);
  const [done, setDone] = useState(splashConsumed);

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), motion.splashHold);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (done) return;
    if (ready && elapsed) {
      splashConsumed = true;
      setDone(true);
    }
  }, [ready, elapsed, done]);

  return !done;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.deepLedger, justifyContent: "center" },
  skyline: { position: "absolute", left: 0, right: 0, bottom: 0 },
  mark: { alignItems: "center", gap: 24 },
  wordmark: { ...type.wordmark, color: palette.paper },
  track: { width: 96, height: 2, borderRadius: 999, backgroundColor: "rgba(247,241,231,0.14)", overflow: "hidden" },
  fill: { height: 2, backgroundColor: palette.ochre },
  hint: { ...type.helper, color: "rgba(247,241,231,0.5)", marginTop: 4 },
});

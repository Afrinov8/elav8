import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { motion, onDark, palette, ramp, type } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Aperture Ring — circular progress. 3dp stroke, hairline track, numerals
 * centred in the editorial serif. Used for verification status, pending
 * approval and the day's takings gauge.
 */
export function ApertureRing({
  progress,
  size = 160,
  color = palette.teal,
  glow,
  label,
  caption,
  tone = "deep",
  sweep = true,
}: {
  /** 0 – 1 */
  progress: number;
  size?: number;
  color?: string;
  /** Rings that need a soft halo (design.md → dark-surface accents). */
  glow?: string;
  label?: string;
  caption?: string;
  tone?: "paper" | "deep";
  sweep?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const stroke = 3;
  const radius = size / 2 - stroke * 2;
  const circumference = 2 * Math.PI * radius;

  const animated = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    animated.value =
      reducedMotion || !sweep
        ? clamped
        : withTiming(clamped, { duration: motion.ringSweep, easing: Easing.out(Easing.cubic) });
  }, [progress, animated, reducedMotion, sweep]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  const deep = tone === "deep";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={deep ? onDark.hairlineStrong : palette.sandLine}
          strokeWidth={1}
          fill={glow ? glow : "none"}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={deep ? onDark.hairlineStrong : palette.sandLine}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {label ? (
        <Text style={[styles.label, deep && styles.labelDeep, { color: deep ? onDark.text : palette.ink }]}>{label}</Text>
      ) : null}
      {caption ? (
        <Text style={[styles.caption, { color: deep ? onDark.textMuted : palette.mutedInk }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.hero, fontSize: 34, lineHeight: 38 },
  labelDeep: { color: onDark.text },
  caption: { ...type.sectionLabel, fontSize: 10, lineHeight: 13, marginTop: 2 },
});

/** Convenience halo token for rings sitting on Deep Ledger. */
export const ringHalo = { ochre: ramp.ochre[900], teal: onDark.tealGlow } as const;

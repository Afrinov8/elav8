import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { motion, onDark, palette, radius, type as typeScale } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

export type Petal = {
  id: string;
  label: string;
  glyph: string;
  tone?: "ochre" | "teal" | "burgundy" | "moss";
};

const PETAL_SIZE = 72;
const LABEL_WIDTH = 92;

/**
 * Petal Constellation — radial quick actions around a central Ochre core.
 * Unselected petals sit at the Paper Sunken equivalent on dark; the selected
 * petal fills with Ochre glow. Micro-labels orbit at the outer edge.
 */
export function PetalConstellation({
  petals,
  selectedId,
  onSelect,
}: {
  petals: Petal[];
  selectedId?: string | null;
  onSelect: (petal: Petal) => void;
}) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 320);
  const center = size / 2;
  const orbit = center - PETAL_SIZE / 2 - 14;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 24);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.coreGlow, { width: 108, height: 108, borderRadius: 54, left: center - 54, top: center - 54 }]} />
      <View style={[styles.core, { left: center - 30, top: center - 30 }]}>
        <Text style={styles.coreGlyph}>＋</Text>
      </View>

      {petals.map((petal, index) => {
        const angle = (index / petals.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * orbit - PETAL_SIZE / 2;
        const y = center + Math.sin(angle) * orbit - PETAL_SIZE / 2;
        return (
          <PetalNode
            key={petal.id}
            petal={petal}
            index={index}
            x={x}
            y={y}
            mounted={mounted}
            selected={petal.id === selectedId}
            onPress={onSelect}
          />
        );
      })}
    </View>
  );
}

function PetalNode({
  petal,
  index,
  x,
  y,
  mounted,
  selected,
  onPress,
}: {
  petal: Petal;
  index: number;
  x: number;
  y: number;
  mounted: boolean;
  selected: boolean;
  onPress: (petal: Petal) => void;
}) {
  const reducedMotion = useReducedMotion();
  const haptics = useHaptics();
  const progress = useSharedValue(0);

  useEffect(() => {
    const duration = reducedMotion ? motion.reduced : motion.enter.duration;
    const delay = reducedMotion || !mounted ? 0 : index * motion.petalStagger;
    progress.value = mounted
      ? withDelay(delay, withTiming(1, { duration, easing: Easing.bezier(0.16, 1, 0.3, 1) }))
      : 0;
  }, [mounted, index, progress, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: (reducedMotion ? 1 : 0.92) + (1 - (reducedMotion ? 1 : 0.92)) * progress.value }],
  }));

  const accent = { ochre: palette.ochre, teal: palette.teal, burgundy: palette.burgundy, moss: palette.moss }[petal.tone ?? "ochre"];

  return (
    <Animated.View style={[styles.petalWrap, { left: x, top: y }, style]}>
      <Pressable
        onPress={() => {
          haptics.light();
          onPress(petal);
        }}
        style={({ pressed }) => [
          styles.petal,
          selected && { backgroundColor: onDark.ochreGlow, borderColor: palette.ochre },
          pressed && styles.petalPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={petal.label}
        accessibilityState={{ selected }}
      >
        <Text style={[styles.glyph, { color: selected ? palette.ochre : accent }]}>{petal.glyph}</Text>
      </Pressable>
      <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={2}>
        {petal.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: "center" },
  coreGlow: { position: "absolute", backgroundColor: onDark.ochreGlow, borderRadius: 999 },
  core: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.ochre,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.35)",
  },
  coreGlyph: { color: palette.paperRaised, fontSize: 24, lineHeight: 28 },
  petalWrap: { position: "absolute", width: PETAL_SIZE, alignItems: "center" },
  petal: {
    width: PETAL_SIZE,
    height: PETAL_SIZE,
    borderRadius: radius.pill,
    backgroundColor: palette.deepSunken,
    borderWidth: 1,
    borderColor: onDark.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  petalPressed: { transform: [{ scale: 0.96 }] },
  glyph: { fontSize: 22, lineHeight: 26 },
  label: {
    ...typeScale.sectionLabel,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.2,
    color: onDark.textFaint,
    textAlign: "center",
    width: LABEL_WIDTH,
    marginTop: 8,
  },
  labelActive: { color: onDark.text },
});

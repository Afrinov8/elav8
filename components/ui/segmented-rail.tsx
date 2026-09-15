import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";

import { control, depth, onDark, palette, radius, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

/**
 * Segmented Rail — pill segmented control. The track is a Ledger Well and the
 * selected segment is a Raised Card with a 1px light edge that slides on a
 * 240ms spring.
 */
export function SegmentedRail<T extends string>({
  options,
  value,
  onChange,
  tone = "paper",
  compact = false,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  tone?: "paper" | "deep";
  compact?: boolean;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const reducedMotion = useReducedMotion();
  const haptics = useHaptics();
  const offset = useSharedValue(0);

  const index = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const inset = 3;
  const segmentWidth = trackWidth > 0 ? (trackWidth - inset * 2) / options.length : 0;

  useEffect(() => {
    const target = index * segmentWidth;
    if (reducedMotion) {
      offset.value = target;
    } else {
      offset.value = withSpring(target, { damping: 20, stiffness: 220, mass: 0.7 });
    }
  }, [index, segmentWidth, offset, reducedMotion]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);
  const deep = tone === "deep";

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.track,
        deep ? depth.wellDeep : depth.wellPaper,
        compact && styles.trackCompact,
        { height: compact ? 40 : control.rail },
      ]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            deep ? styles.thumbDeep : styles.thumbPaper,
            { width: segmentWidth, left: inset },
            thumbStyle,
          ]}
          pointerEvents="none"
        />
      ) : null}

      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (option.value === value) return;
              haptics.selection();
              onChange(option.value);
            }}
            style={[styles.segment, { height: (compact ? 40 : control.rail) - inset * 2 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                compact && styles.labelCompact,
                { color: deep ? (active ? palette.paper : onDark.textMuted) : active ? palette.ink : palette.mutedInk },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.pill,
    padding: 3,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  trackCompact: { alignSelf: "flex-start" },
  thumb: { position: "absolute", top: 3, bottom: 3, borderRadius: radius.pill },
  thumbPaper: {
    backgroundColor: palette.paperRaised,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.55)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(36,33,29,0.06)",
  },
  thumbDeep: {
    backgroundColor: palette.deepRaised,
    borderTopWidth: 1,
    borderTopColor: onDark.lightEdge,
    borderBottomWidth: 1,
    borderBottomColor: onDark.hairline,
  },
  segment: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, borderRadius: radius.pill },
  label: { ...type.button, textAlign: "center" },
  labelCompact: { fontSize: 13 },
});

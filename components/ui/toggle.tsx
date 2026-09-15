import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { motion, palette } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

export function Toggle({
  value,
  onValueChange,
  disabled = false,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const haptics = useHaptics();

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? palette.teal : palette.sandLine, { duration: motion.fadeThrough }),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 22 : 2, { duration: motion.fadeThrough }) }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptics.selection();
        onValueChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={12}
      style={disabled ? styles.disabled : undefined}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 48, height: 28, borderRadius: 999, justifyContent: "center", padding: 2 },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.paperRaised, position: "absolute" },
  disabled: { opacity: 0.4 },
});

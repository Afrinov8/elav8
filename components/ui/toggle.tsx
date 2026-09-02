import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { palette } from "@/constants/theme";

export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? palette.teal : palette.sandLine, { duration: 200 }),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 20 : 2, { duration: 200 }) }],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 24, borderRadius: 12, justifyContent: "center", padding: 2 },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.white, position: "absolute" },
});

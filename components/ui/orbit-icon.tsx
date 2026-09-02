import { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { palette } from "@/constants/theme";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/**
 * The "Thinking" mark — a minimal orbiting-node glyph, not a brain/robot.
 * Three dots (ochre / teal / burgundy) rotate slowly around a hairline ring.
 */
export function OrbitIcon({ size = 24, spinning = true }: { size?: number; spinning?: boolean }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [spinning, rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const r = size / 2;
  const orbitR = r - 3;

  return (
    <AnimatedSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
      <Circle cx={r} cy={r} r={orbitR} stroke={palette.teal} strokeWidth={1} strokeOpacity={0.4} fill="none" />
      <Circle cx={r} cy={r - orbitR} r={2.5} fill={palette.ochre} />
      <Circle cx={r - orbitR * 0.87} cy={r + orbitR * 0.5} r={2.5} fill={palette.teal} />
      <Circle cx={r + orbitR * 0.87} cy={r + orbitR * 0.5} r={2.5} fill={palette.burgundy} />
    </AnimatedSvg>
  );
}

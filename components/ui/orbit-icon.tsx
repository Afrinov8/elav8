import { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { onDark, palette, ramp } from "@/constants/theme";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/**
 * The "thinking" mark — a minimal orbiting-node glyph, not a brain or a robot.
 * Three nodes (ochre / teal / burgundy) slowly circle a hairline ring.
 */
export function OrbitIcon({
  size = 24,
  spinning = true,
  tone = "deep",
}: {
  size?: number;
  spinning?: boolean;
  tone?: "paper" | "deep";
}) {
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const ring = tone === "deep" ? onDark.hairlineStrong : palette.sandLine;

  useEffect(() => {
    if (spinning && !reducedMotion) {
      rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [spinning, rotation, reducedMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const r = size / 2;
  const orbitR = r - 3;

  return (
    <AnimatedSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
      <Circle cx={r} cy={r} r={orbitR} stroke={ring} strokeWidth={1} fill="none" />
      <Circle cx={r} cy={r - orbitR} r={2.5} fill={palette.ochre} />
      <Circle cx={r - orbitR * 0.87} cy={r + orbitR * 0.5} r={2.5} fill={ramp.teal[300]} />
      <Circle cx={r + orbitR * 0.87} cy={r + orbitR * 0.5} r={2.5} fill={ramp.burgundy[300]} />
    </AnimatedSvg>
  );
}

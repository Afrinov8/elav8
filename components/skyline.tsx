import Svg, { Line, Path, Rect } from "react-native-svg";

import { onDark, palette, ramp } from "@/constants/theme";

/**
 * Stylised three-plane portrait skyline (design.md → "Splash screen direction").
 * Not a photograph, not a vector cliché: restrained Johannesburg density,
 * Cape Town mountain geometry, Durban coastal haze — never a named skyline,
 * never a flag, never more than three tones.
 *
 * Plane 1 (background) Sand 500 @ 25% · Plane 2 (midground) Ochre 700 @ 40% ·
 * Plane 3 (foreground) Deep Sunken with a hairline top edge, because the base
 * surface is already Deep Ledger.
 */

const MID_RISE: [number, number, number][] = [
  [0, 30, 168],
  [32, 24, 150],
  [58, 34, 176],
  [94, 22, 158],
  [118, 30, 186],
  [150, 26, 164],
  [178, 32, 172],
  [212, 24, 152],
  [238, 30, 180],
  [270, 26, 160],
  [298, 34, 174],
  [334, 22, 156],
  [358, 32, 182],
];

const TOWERS: [number, number, number][] = [
  [10, 46, 150],
  [60, 30, 118],
  [94, 24, 166],
  [122, 58, 132],
  [184, 36, 96],
  [224, 26, 152],
  [254, 50, 124],
  [308, 38, 146],
  [350, 46, 110],
];

/** Bottom-anchored skyline band used behind the splash mark. */
export function SkylineBand({ height = 260, width = 390 }: { height?: number; width?: number }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax slice">
      <Path
        d="M0 150 L38 108 L74 132 L118 82 L150 118 L196 74 L232 112 L268 92 L306 126 L344 100 L390 140 L390 260 L0 260 Z"
        fill={ramp.sand[500]}
        opacity={0.25}
      />
      {MID_RISE.map(([x, w, top]) => (
        <Rect key={`mid-${x}`} x={x} y={top} width={w} height={260 - top} fill={ramp.ochre[700]} opacity={0.4} />
      ))}
      {TOWERS.map(([x, w, top]) => (
        <Rect key={`near-${x}`} x={x} y={top} width={w} height={260 - top} fill={palette.deepSunken} />
      ))}
      {TOWERS.map(([x, w, top]) => (
        <Line
          key={`edge-${x}`}
          x1={x}
          x2={x + w}
          y1={top}
          y2={top}
          stroke={onDark.hairline}
          strokeWidth={1}
        />
      ))}
    </Svg>
  );
}

/**
 * Compact two-plane spaza/mid-rise silhouette that bleeds off the right edge
 * (design.md → "Welcome").
 */
export function SpazaSilhouette({ width = 240, height = 150 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 150" preserveAspectRatio="xMidYMax slice">
      <Path d="M0 92 L34 60 L70 84 L108 52 L146 78 L186 58 L240 88 L240 150 L0 150 Z" fill={ramp.sand[500]} opacity={0.55} />
      <Rect x={-6} y={92} width={96} height={58} fill={ramp.ochre[700]} opacity={0.4} />
      <Rect x={92} y={72} width={54} height={78} fill={ramp.ochre[700]} opacity={0.4} />
      <Rect x={150} y={100} width={44} height={50} fill={ramp.ochre[700]} opacity={0.4} />
      <Rect x={-6} y={92} width={96} height={4} fill={ramp.ochre[300]} opacity={0.5} />
      <Rect x={92} y={72} width={54} height={4} fill={ramp.ochre[300]} opacity={0.5} />
    </Svg>
  );
}

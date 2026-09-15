import Svg, { Circle, Polyline } from "react-native-svg";

import { onDark } from "@/constants/theme";

/**
 * 7-day hairline sparkline — a single 1.5dp stroke sits under the hero
 * numeral. No fill, no gradient, no grid.
 */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = onDark.sparkline,
  strokeWidth = 1.5,
  dot = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  dot?: boolean;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const pad = 4;

  const pointAt = (value: number, index: number) => ({
    x: index * step,
    y: height - pad - ((value - min) / range) * (height - pad * 2),
  });

  const points = data.map((value, index) => {
    const { x, y } = pointAt(value, index);
    return `${x},${y}`;
  }).join(" ");

  const last = pointAt(data[data.length - 1], data.length - 1);

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot ? <Circle cx={last.x} cy={last.y} r={2.5} fill={color} /> : null}
    </Svg>
  );
}

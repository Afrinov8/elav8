import Svg, { Polyline, Circle } from "react-native-svg";

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "#FFFDF9",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 6) - 3}`)
    .join(" ");
  const lastX = (data.length - 1) * step;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 6) - 3;

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <Circle cx={lastX} cy={lastY} r={3} fill={color} />
    </Svg>
  );
}

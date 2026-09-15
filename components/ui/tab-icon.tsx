import Svg, { Circle, Path, Rect } from "react-native-svg";

export type TabIconName = "command" | "inventory" | "money" | "profile";

/**
 * Quiet Tab Bar icons — 20dp, 1.5dp stroke, no fills.
 */
export function TabIcon({ name, color, size = 20 }: { name: TabIconName; color: string; size?: number }) {
  const common = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {name === "command" ? (
        <>
          <Circle cx={10} cy={10} r={7} {...common} />
          <Circle cx={10} cy={10} r={2.25} {...common} />
        </>
      ) : null}

      {name === "inventory" ? (
        <>
          <Path d="M10 2.6 17 6.4v7.2L10 17.4 3 13.6V6.4z" {...common} />
          <Path d="M3 6.4 10 10.2l7-3.8M10 10.2v7.2" {...common} />
        </>
      ) : null}

      {name === "money" ? (
        <>
          <Rect x={2.5} y={5} width={15} height={10} rx={2.4} {...common} />
          <Circle cx={10} cy={10} r={2.4} {...common} />
        </>
      ) : null}

      {name === "profile" ? (
        <>
          <Circle cx={10} cy={7} r={3.2} {...common} />
          <Path d="M4 17c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2" {...common} />
        </>
      ) : null}
    </Svg>
  );
}

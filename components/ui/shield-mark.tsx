import Svg, { Path } from "react-native-svg";

import { onDark, ramp } from "@/constants/theme";

/**
 * Pending-approval mark — a bronze shield built from three planes with a
 * hairline edge. No parchment, no gavel, no scales.
 */
export function ShieldMark({ size = 128 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.08} viewBox="0 0 120 130">
      <Path
        d="M60 4 L110 24 V66 C110 95 88 116 60 126 C32 116 10 95 10 66 V24 Z"
        fill={ramp.ochre[700]}
        opacity={0.45}
        transform="translate(0 3)"
      />
      <Path
        d="M60 4 L110 24 V66 C110 95 88 116 60 126 C32 116 10 95 10 66 V24 Z"
        fill={ramp.ochre[500]}
        stroke={onDark.hairline}
        strokeWidth={1}
      />
      <Path d="M60 4 L110 24 L60 44 L10 24 Z" fill={ramp.ochre[300]} opacity={0.55} />
      <Path d="M60 4 L110 24 V40 L60 60 L10 40 V24 Z" fill={ramp.ochre[700]} opacity={0.25} />
    </Svg>
  );
}

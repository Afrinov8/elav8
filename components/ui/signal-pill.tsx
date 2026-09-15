import { StyleSheet, Text, View } from "react-native";

import { onDark, palette, radius, ramp, type } from "@/constants/theme";

type Tone = "ochre" | "teal" | "burgundy" | "moss" | "sand";

/**
 * Signal Pill — 28dp status chip. Tonal fill at ramp 100 with text at ramp 700.
 * On Deep Ledger surfaces the ramp inverts (900 fill / 300 text) so the chip
 * keeps the same contrast relationship.
 */
export function SignalPill({
  label,
  tone = "ochre",
  onDark: isOnDark = false,
}: {
  label: string;
  tone?: Tone;
  onDark?: boolean;
}) {
  const family = ramp[tone];
  const background = isOnDark ? `${family[900]}` : family[100];
  const color = isOnDark ? family[300] : family[700];

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: background, borderColor: isOnDark ? onDark.hairline : "transparent" },
      ]}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: tone === "sand" && !isOnDark ? palette.mutedInk : color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 28,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: { ...type.helper, fontSize: 12, lineHeight: 16 },
});

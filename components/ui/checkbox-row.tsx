import { Pressable, StyleSheet, Text, View } from "react-native";

import { onDark, onLight, palette, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

/**
 * A Raised Card carrying a 20dp checkbox. Required and optional consents look
 * identical until checked — no colour-only signalling.
 */
export function CheckboxRow({
  label,
  helper,
  value,
  onValueChange,
  required = false,
  tone = "paper",
}: {
  label: string;
  helper?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  required?: boolean;
  tone?: "paper" | "deep";
}) {
  const deep = tone === "deep";
  const haptics = useHaptics();

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onValueChange(!value);
      }}
      style={({ pressed }) => [
        styles.card,
        deep
          ? { backgroundColor: palette.deepRaised, borderColor: onDark.hairline }
          : { backgroundColor: palette.paperRaised, borderColor: onLight.hairline },
        pressed && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel={required ? `${label}, required` : label}
    >
      <View style={[styles.box, deep && styles.boxDeep, value && styles.boxOn]}>
        {value ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, deep && styles.labelDeep]}>{label}</Text>
        {helper ? <Text style={[styles.helper, deep && styles.helperDeep]}>{helper}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    minHeight: 64,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 1,
  },
  pressed: { transform: [{ scale: 0.99 }] },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.sandLine,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxDeep: { borderColor: onDark.hairlineStrong },
  boxOn: { backgroundColor: palette.teal, borderColor: palette.teal },
  check: { color: palette.paperRaised, fontSize: 12, lineHeight: 14, fontWeight: "600" },
  copy: { flex: 1, gap: 4 },
  label: { ...type.body, color: palette.ink },
  labelDeep: { color: onDark.text },
  helper: { ...type.helper, color: palette.mutedInk },
  helperDeep: { color: onDark.textMuted },
});

import { Pressable, StyleSheet, Text } from "react-native";

import { control, onDark, palette, pressFeedback, radius, type } from "@/constants/theme";

/** Ghost Action — 48dp text button, no fill, hairline only on press. */
export function GhostAction({
  label,
  onPress,
  tone = "teal",
  align = "center",
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  tone?: "teal" | "muted";
  align?: "center" | "start";
  disabled?: boolean;
}) {
  const color = tone === "muted" ? palette.mutedInk : palette.teal;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { justifyContent: align === "center" ? "center" : "flex-start" },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: control.secondary,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pressed: { borderColor: onDark.hairlineStrong, transform: [{ scale: pressFeedback.scale }] },
  disabled: { opacity: 0.4 },
  label: { ...type.button },
});

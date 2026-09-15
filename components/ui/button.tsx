import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { control, palette, pressFeedback, radius, type } from "@/constants/theme";

type Tone = "ochre" | "teal" | "burgundy" | "ink";
type Variant = "primary" | "secondary" | "ghost";

const toneColor: Record<Tone, string> = {
  ochre: palette.ochre,
  teal: palette.teal,
  burgundy: palette.burgundy,
  ink: palette.ink,
};

/**
 * Primary action — 52dp pill, tonal fill.
 * Secondary action — 48dp pill, hairline border, tonal label.
 * Ghost Action — 48dp text button, no fill, Teal label, hairline only when pressed.
 */
export function Button({
  label,
  onPress,
  tone = "ochre",
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  ...rest
}: {
  label: string;
  onPress?: () => void;
  tone?: Tone;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
} & Omit<PressableProps, "onPress" | "children">) {
  const color = toneColor[tone];
  const isGhost = variant === "ghost";
  const isPrimary = variant === "primary";
  const labelColor = isPrimary ? palette.paperRaised : isGhost ? palette.teal : color;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isGhost && styles.ghost,
        !isPrimary && !isGhost && { borderColor: color },
        pressed && !disabled && styles.pressed,
        pressed && isGhost && styles.ghostPressed,
        disabled && styles.disabled,
        style as object,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    alignSelf: "stretch",
  },
  primary: { minHeight: control.primary, borderRadius: radius.pill, backgroundColor: palette.ochre },
  secondary: { minHeight: control.secondary, borderRadius: radius.pill, borderWidth: 1, backgroundColor: "transparent" },
  ghost: { minHeight: control.secondary, borderRadius: radius.pill, backgroundColor: "transparent" },
  pressed: { transform: [{ scale: pressFeedback.scale }], opacity: 0.92 },
  ghostPressed: { backgroundColor: "rgba(23,108,106,0.06)" },
  disabled: { opacity: 0.4 },
  label: { ...type.button },
});

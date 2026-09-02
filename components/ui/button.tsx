import { ActivityIndicator, Pressable, Text, StyleSheet, type PressableProps } from "react-native";
import { palette } from "@/constants/theme";

type Tone = "ochre" | "teal" | "burgundy" | "ink";
type Variant = "primary" | "secondary" | "ghost";

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
  const toneColor = { ochre: palette.ochre, teal: palette.teal, burgundy: palette.burgundy, ink: palette.ink }[tone];
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? { backgroundColor: toneColor } : styles.secondaryBase,
        variant === "secondary" && { borderColor: toneColor },
        variant === "ghost" && styles.ghostBase,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style as object,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.white : toneColor} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary ? { color: palette.white } : { color: toneColor },
            variant === "ghost" && { color: palette.mutedInk },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryBase: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  ghostBase: {
    backgroundColor: "transparent",
    minHeight: 40,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 14,
  },
});

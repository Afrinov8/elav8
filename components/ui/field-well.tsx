import { forwardRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";

import { control, depth, onDark, onLight, palette, radius, type } from "@/constants/theme";

/**
 * Field Well — 56dp input. The label sits above the well, never inside it.
 * Focus raises the well to a 1.5px Ochre border with a 3dp Ochre glow at 16%,
 * the only place in the interface where a glow is permitted.
 */
export const FieldWell = forwardRef<TextInput, {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  multiline?: boolean;
  tone?: "paper" | "deep";
  optional?: boolean;
}>(function FieldWell(
  {
    label,
    value,
    onChangeText,
    placeholder,
    helper,
    error,
    keyboardType = "default",
    secureTextEntry = false,
    autoCapitalize = "sentences",
    multiline = false,
    tone = "paper",
    optional = false,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const deep = tone === "deep";
  const message = error ?? helper;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, deep && styles.labelDeep]}>{label}</Text>
        {optional ? <Text style={[styles.optional, deep && styles.optionalDeep]}>Optional</Text> : null}
      </View>

      <View
        style={[
          styles.well,
          deep ? depth.wellDeep : depth.wellPaper,
          multiline && styles.wellMultiline,
          focused && styles.wellFocused,
          !!error && styles.wellError,
        ]}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={deep ? onDark.textFaint : palette.mutedInk}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, deep && styles.inputDeep, multiline && styles.inputMultiline]}
          accessibilityLabel={label}
        />
      </View>

      {message ? (
        <View style={styles.messageRow}>
          {error ? <Text style={styles.errorIcon}>!</Text> : null}
          <Text style={[error ? styles.error : styles.helper, deep && !error && styles.helperDeep]}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  label: { ...type.sectionLabel, color: palette.mutedInk },
  labelDeep: { color: onDark.textMuted },
  optional: { ...type.helper, fontSize: 11, lineHeight: 14, color: palette.mutedInk },
  optionalDeep: { color: onDark.textFaint },
  well: {
    minHeight: control.field,
    borderRadius: radius.well,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  wellMultiline: { minHeight: 96, paddingVertical: 12 },
  wellFocused: {
    borderWidth: 1.5,
    borderColor: palette.ochre,
    ...Platform.select({
      web: { boxShadow: `0 0 0 3px ${onLight.focus}` },
      default: { shadowColor: palette.ochre, shadowOpacity: 0.16, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } },
    }),
  },
  wellError: { borderWidth: 1.5, borderColor: palette.burgundy },
  input: { ...type.body, color: palette.ink, paddingVertical: 0 },
  inputDeep: { color: onDark.text },
  inputMultiline: { minHeight: 72, textAlignVertical: "top" },
  messageRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  errorIcon: {
    ...type.helper,
    fontSize: 11,
    lineHeight: 17,
    color: palette.burgundy,
    fontWeight: "700",
  },
  helper: { ...type.helper, color: palette.mutedInk },
  helperDeep: { color: onDark.textMuted },
  error: { ...type.helper, color: palette.burgundy },
});

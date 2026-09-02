import { useState } from "react";
import { Text, TextInput, View, StyleSheet, type KeyboardTypeOptions } from "react-native";
import { palette } from "@/constants/theme";

export function LedgerInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "sentences",
  error,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.mutedInk}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7, marginBottom: 14 },
  label: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: palette.ink },
  input: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: palette.sandLine,
    color: palette.ink,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 16,
    paddingHorizontal: 2,
  },
  inputFocused: { borderBottomColor: palette.ochre, borderBottomWidth: 2 },
  inputError: { borderBottomColor: palette.burgundy },
  error: { color: palette.burgundy, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular" },
});

import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { depth, onDark, palette, radius, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

/**
 * Four Ledger Well OTP boxes set in Spline Sans Mono. A single transparent
 * input backs all four wells so mobile keyboards auto-advance correctly.
 */
export function OtpWell({
  value,
  onChange,
  length = 4,
  tone = "deep",
  autoFocus = false,
  label = "Verification code",
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  tone?: "paper" | "deep";
  autoFocus?: boolean;
  label?: string;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const haptics = useHaptics();
  const previous = useRef(value.length);
  const deep = tone === "deep";

  useEffect(() => {
    if (value.length > previous.current) haptics.light();
    previous.current = value.length;
  }, [value, haptics]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={styles.root}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value.length} of ${length} digits entered`}
    >
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(next) => onChange(next.replace(/[^0-9]/g, "").slice(0, length))}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        maxLength={length}
        caretHidden
        textContentType="oneTimeCode"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
      />
      <View style={styles.row} pointerEvents="none">
        {digits.map((digit, index) => {
          const isNext = focused && index === value.length;
          return (
            <View
              key={index}
              style={[
                styles.well,
                deep ? depth.wellDeep : depth.wellPaper,
                digit ? styles.wellFilled : null,
                isNext ? styles.wellActive : null,
              ]}
            >
              <Text style={[styles.digit, deep && styles.digitDeep]}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { justifyContent: "center" },
  hiddenInput: { position: "absolute", left: 0, right: 0, height: 64, opacity: 0.02, color: "transparent" },
  row: { flexDirection: "row", gap: 12, justifyContent: "center" },
  well: { flex: 1, maxWidth: 68, height: 64, borderRadius: radius.well, alignItems: "center", justifyContent: "center" },
  wellFilled: { borderColor: onDark.hairlineStrong },
  wellActive: { borderWidth: 1.5, borderColor: palette.ochre },
  digit: { ...type.data, fontSize: 24, lineHeight: 28, color: palette.ink },
  digitDeep: { color: palette.paper },
});

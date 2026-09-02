import { Pressable, Text, View, StyleSheet } from "react-native";
import { palette } from "@/constants/theme";

export function CheckboxRow({
  label,
  helper,
  value,
  onValueChange,
}: {
  label: string;
  helper?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.row} accessibilityRole="checkbox" accessibilityState={{ checked: value }}>
      <View style={[styles.box, value && styles.boxOn]}>{value ? <Text style={styles.check}>✓</Text> : null}</View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 44, paddingVertical: 6 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.sandLine,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxOn: { backgroundColor: palette.teal, borderColor: palette.teal },
  check: { color: palette.white, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" },
  copy: { flex: 1 },
  label: { color: palette.ink, fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  helper: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, marginTop: 2 },
});

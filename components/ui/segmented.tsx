import { Pressable, Text, View, StyleSheet } from "react-native";
import { palette, radius } from "@/constants/theme";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", borderWidth: 1, borderColor: palette.sandLine, borderRadius: radius.md, padding: 3, gap: 3 },
  item: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 6, paddingHorizontal: 4 },
  itemActive: { backgroundColor: palette.ochre },
  text: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_500Medium", fontSize: 12, textAlign: "center" },
  textActive: { color: palette.white },
});

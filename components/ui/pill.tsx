import { Text, View, StyleSheet } from "react-native";
import { palette, radius } from "@/constants/theme";

export function Pill({ label, tone = "ochre" }: { label: string; tone?: "ochre" | "teal" | "neutral" }) {
  const bg = tone === "teal" ? "#DCEAE9" : tone === "neutral" ? palette.paper : "#EFDEBD";
  const fg = tone === "teal" ? palette.teal : tone === "neutral" ? palette.mutedInk : palette.ochreDeep;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  text: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 12 },
});

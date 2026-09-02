import { Text, View, StyleSheet } from "react-native";
import { palette } from "@/constants/theme";

export function ScreenHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 20 },
  eyebrow: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, letterSpacing: 1.8, color: palette.teal },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 24, lineHeight: 30, color: palette.ink },
  subtitle: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 15, lineHeight: 21, color: palette.mutedInk },
});

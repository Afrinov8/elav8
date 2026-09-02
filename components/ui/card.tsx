import { View, StyleSheet, type ViewProps } from "react-native";
import { palette, radius } from "@/constants/theme";

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.sandLine,
    borderRadius: radius.lg,
    padding: 16,
  },
});

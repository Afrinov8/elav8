import { StyleSheet, View, type ViewProps } from "react-native";

import { depth, radius } from "@/constants/theme";

/**
 * Depth level 1 — Raised Card. Earns its lift from a 1px top light edge and a
 * hairline border, never a shadow (design.md → depth and surface system).
 */
export function RaisedCard({
  tone = "paper",
  style,
  ...rest
}: ViewProps & { tone?: "paper" | "deep" }) {
  return <View style={[tone === "deep" ? styles.deep : styles.paper, style]} {...rest} />;
}

const styles = StyleSheet.create({
  paper: { ...depth.cardPaper, borderRadius: radius.card, padding: 20 },
  deep: { ...depth.cardDeep, borderRadius: radius.card, padding: 20 },
});

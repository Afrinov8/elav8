import { StyleSheet, Text, View } from "react-native";

import { onDark, palette, type } from "@/constants/theme";

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  tone = "paper",
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "paper" | "deep";
  align?: "start" | "center";
}) {
  const deep = tone === "deep";
  return (
    <View style={[styles.wrap, align === "center" && styles.centered]}>
      {eyebrow ? <Text style={[styles.eyebrow, deep && styles.eyebrowDeep]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, deep && styles.titleDeep, align === "center" && styles.textCenter]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, deep && styles.subtitleDeep, align === "center" && styles.textCenter]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 24 },
  centered: { alignItems: "center" },
  textCenter: { textAlign: "center" },
  eyebrow: { ...type.sectionLabel, color: palette.mutedInk },
  eyebrowDeep: { color: onDark.textMuted },
  title: { ...type.title, color: palette.ink },
  titleDeep: { color: onDark.text },
  subtitle: { ...type.body, color: palette.mutedInk },
  subtitleDeep: { color: onDark.textMuted },
});

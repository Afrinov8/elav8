import { Pressable, StyleSheet, Text, View } from "react-native";

import { layout, onDark, palette, pressFeedback, type } from "@/constants/theme";

/**
 * Hairline Ledger Row — item name left; selling price in tabular mono with the
 * cost price beneath. Low-stock rows carry a 3dp accent bar flush to the left
 * edge. The separator is a hairline that stops 24dp from the right edge.
 */
export function LedgerRow({
  name,
  priceLabel,
  costLabel,
  meta,
  accent = "none",
  last = false,
  tone = "paper",
  onPress,
}: {
  name: string;
  priceLabel: string;
  costLabel?: string;
  meta?: string;
  accent?: "none" | "ochre" | "burgundy" | "teal";
  last?: boolean;
  tone?: "paper" | "deep";
  onPress?: () => void;
}) {
  const accentColor =
    accent === "ochre"
      ? palette.ochre
      : accent === "burgundy"
        ? palette.burgundy
        : accent === "teal"
          ? palette.teal
          : undefined;
  const deep = tone === "deep";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${name}, ${priceLabel}${costLabel ? `, cost ${costLabel}` : ""}`}
    >
      <View style={styles.body}>
        {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
        <View style={styles.copy}>
          <Text style={[styles.name, deep && styles.nameDeep]} numberOfLines={1}>
            {name}
          </Text>
          {meta ? <Text style={[styles.meta, deep && styles.metaDeep]}>{meta}</Text> : null}
        </View>
        <View style={styles.numbers}>
          <Text style={[styles.price, deep && styles.priceDeep]}>{priceLabel}</Text>
          {costLabel ? <Text style={[styles.cost, deep && styles.metaDeep]}>{costLabel}</Text> : null}
        </View>
      </View>
      {!last ? (
        <View
          style={[
            styles.separator,
            { backgroundColor: deep ? onDark.hairline : palette.sandLine },
            accentColor ? { marginLeft: layout.separatorInset + 3 } : null,
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, justifyContent: "center" },
  pressed: { transform: [{ scale: pressFeedback.scale }] },
  body: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: layout.rowInset },
  accent: { position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  copy: { flex: 1, gap: 2 },
  name: { ...type.body, color: palette.ink },
  nameDeep: { color: onDark.text },
  meta: { ...type.helper, fontSize: 12, lineHeight: 16, color: palette.mutedInk },
  metaDeep: { color: onDark.textMuted },
  numbers: { alignItems: "flex-end", gap: 2 },
  price: { ...type.data, color: palette.ink },
  priceDeep: { color: onDark.text },
  cost: { ...type.dataSmall, color: palette.mutedInk },
  separator: { height: 1, marginRight: layout.separatorInset },
});

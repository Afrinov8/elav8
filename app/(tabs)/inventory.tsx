import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ActionSheet } from "@/components/ui/action-sheet";
import { LedgerInput } from "@/components/ui/ledger-input";
import { Button } from "@/components/ui/button";
import { palette, radius } from "@/constants/theme";
import { trpc } from "@/lib/trpc";

type Filter = "all" | "low";

export default function InventoryScreen() {
  const utils = trpc.useUtils();
  const items = trpc.inventory.list.useQuery();
  const reorder = trpc.inventory.reorder.useMutation({ onSuccess: () => utils.inventory.list.invalidate() });
  const createItem = trpc.inventory.create.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      setAddOpen(false);
      setName("");
      setSelling("");
      setCost("");
      setStock("");
    },
  });

  const [filter, setFilter] = useState<Filter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [selling, setSelling] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  const filtered = useMemo(() => {
    const data = items.data ?? [];
    if (filter === "low") return data.filter((i) => i.stockQty <= i.lowStockThreshold);
    return data;
  }, [items.data, filter]);

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScreenHeader eyebrow="YOUR LIST" title="Stock & prices" subtitle="A clear view of what moves through your business." />

      <View style={styles.filters}>
        {(["all", "low"] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filter, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : "Low stock"}
            </Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setAddOpen(true)}>
          <Text style={styles.addLink}>＋ Add item</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={items.isFetching}
        onRefresh={() => items.refetch()}
        ListEmptyComponent={
          !items.isLoading ? <Text style={styles.empty}>No items yet. Add your first product above.</Text> : null
        }
        renderItem={({ item }) => {
          const low = item.stockQty <= item.lowStockThreshold;
          return (
            <Swipeable
              renderRightActions={() => (
                <Pressable
                  onPress={() => reorder.mutate({ id: item.id, quantity: 10 })}
                  style={styles.swipeReorder}
                >
                  <Text style={styles.swipeReorderText}>Reorder</Text>
                </Pressable>
              )}
            >
              <View style={[styles.row, low && styles.lowRow]}>
                <View style={styles.rowCopy}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>
                    R{Number(item.sellingPrice).toFixed(2)} · {item.stockQty} in stock
                  </Text>
                </View>
                {low ? (
                  <Pressable onPress={() => reorder.mutate({ id: item.id, quantity: 10 })} style={styles.chip}>
                    <Text style={styles.chipText}>Low · Reorder</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.healthy}>Healthy</Text>
                )}
              </View>
            </Swipeable>
          );
        }}
        ListFooterComponent={<Text style={styles.footer}>Swipe an item left to reorder when stock is low.</Text>}
      />

      <ActionSheet visible={addOpen} title="Add an item" onClose={() => setAddOpen(false)}>
        <LedgerInput label="Item name" placeholder="e.g. Shampoo 500ml" value={name} onChangeText={setName} />
        <LedgerInput label="Selling price (R)" placeholder="0.00" value={selling} onChangeText={setSelling} keyboardType="decimal-pad" />
        <LedgerInput label="Cost price (R)" placeholder="0.00" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
        <LedgerInput label="Starting stock" placeholder="0" value={stock} onChangeText={setStock} keyboardType="number-pad" />
        <Button
          label="Save item"
          tone="teal"
          onPress={() =>
            createItem.mutate({
              name,
              sellingPrice: Number(selling) || 0,
              costPrice: Number(cost) || 0,
              stockQty: Number(stock) || 0,
            })
          }
          loading={createItem.isPending}
          disabled={!name.trim() || !selling || !cost}
        />
      </ActionSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  filter: { borderWidth: 1, borderColor: palette.sandLine, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  filterActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  filterText: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_500Medium", fontSize: 12 },
  filterTextActive: { color: palette.white },
  addLink: { color: palette.teal, fontFamily: "SpaceGrotesk_500Medium", fontSize: 13 },
  list: { gap: 10, paddingBottom: 24 },
  empty: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 13, textAlign: "center", marginTop: 24 },
  row: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: palette.sandLine,
    backgroundColor: palette.card,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  lowRow: { borderLeftWidth: 3, borderLeftColor: palette.ochre },
  rowCopy: { flex: 1, gap: 4 },
  name: { color: palette.ink, fontFamily: "SpaceGrotesk_500Medium", fontSize: 15 },
  detail: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12 },
  chip: { backgroundColor: "#F4E5CD", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { color: palette.ochreDeep, fontFamily: "SpaceGrotesk_500Medium", fontSize: 11 },
  healthy: { color: palette.moss, fontFamily: "SpaceGrotesk_500Medium", fontSize: 12 },
  swipeReorder: { backgroundColor: palette.teal, justifyContent: "center", alignItems: "center", width: 88, borderRadius: radius.md, marginLeft: 8 },
  swipeReorderText: { color: palette.white, fontFamily: "SpaceGrotesk_700Bold", fontSize: 12 },
  footer: { color: palette.mutedInk, textAlign: "center", fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, marginTop: 14 },
});

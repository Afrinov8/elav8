import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { FieldWell } from "@/components/ui/field-well";
import { FrostedTray } from "@/components/ui/frosted-tray";
import { GhostAction } from "@/components/ui/ghost-action";
import { LedgerRow } from "@/components/ui/ledger-row";
import { RaisedCard } from "@/components/ui/raised-card";
import { SegmentedRail } from "@/components/ui/segmented-rail";
import { ScreenHeader } from "@/components/ui/screen-header";
import { formatCurrency, layout, onLight, palette, radius, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

type Filter = "all" | "low";
type TrackedItem = { id: number; name: string; stockQty: number; sellingPrice: string; costPrice: string };

export default function InventoryScreen() {
  const utils = trpc.useUtils();
  const haptics = useHaptics();
  const items = trpc.inventory.list.useQuery();
  const reorder = trpc.inventory.reorder.useMutation({ onSuccess: () => utils.inventory.list.invalidate() });
  const createItem = trpc.inventory.create.useMutation({ onSuccess: () => utils.inventory.list.invalidate() });

  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [pendingReorder, setPendingReorder] = useState<TrackedItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [headers, setHeaders] = useState({ name: "Item", selling: "Selling price", cost: "Cost price" });

  const [name, setName] = useState("");
  const [selling, setSelling] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3600);
    return () => clearTimeout(timer);
  }, [message]);

  const data = items.data ?? [];
  const filtered = useMemo(
    () => (filter === "low" ? data.filter((item) => item.stockQty <= item.lowStockThreshold) : data),
    [data, filter],
  );

  const confirmReorder = async () => {
    if (!pendingReorder) return;
    const item = pendingReorder;
    setPendingReorder(null);
    await reorder.mutateAsync({ id: item.id, quantity: 10 });
    haptics.soft();
    setMessage(`${item.name} — 10 units added.`);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        eyebrow="Inventory"
        title="Stock & prices"
        subtitle="What moves through your business, and what needs topping up."
      />

      <View style={styles.filters}>
        <View style={styles.rail}>
          <SegmentedRail
            compact
            value={filter}
            onChange={setFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Low stock", value: "low" },
            ]}
          />
        </View>
        <GhostAction label="Customize" onPress={() => setCustomizeOpen(true)} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={items.isFetching}
        onRefresh={() => items.refetch()}
        ListEmptyComponent={
          items.isLoading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing on the shelf yet.</Text>
              <Text style={styles.emptyBody}>
                Add what you sell and Elav8 starts watching your margins and your low-stock line.
              </Text>
              <GhostAction label="Add your first item" onPress={() => setAddOpen(true)} />
            </View>
          )
        }
        renderItem={({ item, index }) => {
          const low = item.stockQty <= item.lowStockThreshold;
          return (
            <Swipeable
              overshootRight={false}
              renderRightActions={() => (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setPendingReorder(item);
                  }}
                  style={styles.swipeAction}
                  accessibilityLabel={`Reorder ${item.name}`}
                >
                  <Text style={styles.swipeActionText}>Reorder</Text>
                </Pressable>
              )}
            >
              <LedgerRow
                name={item.name}
                priceLabel={formatCurrency(item.sellingPrice)}
                costLabel={`cost ${formatCurrency(item.costPrice)}`}
                meta={`${item.stockQty} in stock`}
                accent={low ? "ochre" : "none"}
                last={index === filtered.length - 1}
                onPress={() => {
                  haptics.light();
                  setPendingReorder(item);
                }}
              />
            </Swipeable>
          );
        }}
      />

      {message ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.toast}>
          <RaisedCard style={styles.toastCard}>
            <Text style={styles.toastText}>{message}</Text>
          </RaisedCard>
        </Animated.View>
      ) : null}

      <View style={styles.footer}>
        <Button label="Add item" onPress={() => setAddOpen(true)} />
      </View>

      <FrostedTray
        visible={pendingReorder !== null}
        title={pendingReorder ? `Reorder ${pendingReorder.name}` : "Reorder"}
        subtitle="Adds ten units to the stock count in Elav8. No supplier order is placed for you."
        onClose={() => setPendingReorder(null)}
        actions={
          <>
            <Button label="Reorder 10 units" tone="teal" loading={reorder.isPending} onPress={confirmReorder} />
            <GhostAction label="Not now" onPress={() => setPendingReorder(null)} />
          </>
        }
      >
        {pendingReorder ? (
          <LedgerRow
            name={pendingReorder.name}
            priceLabel={formatCurrency(pendingReorder.sellingPrice)}
            costLabel={`cost ${formatCurrency(pendingReorder.costPrice)}`}
            meta={`${pendingReorder.stockQty} in stock now`}
            last
          />
        ) : null}
      </FrostedTray>

      <FrostedTray
        visible={addOpen}
        title="Add an item"
        subtitle="Selling and cost prices power your margin line."
        onClose={() => setAddOpen(false)}
        actions={
          <Button
            label="Save item"
            tone="teal"
            loading={createItem.isPending}
            disabled={!name.trim() || !selling || !cost}
            onPress={async () => {
              await createItem.mutateAsync({
                name: name.trim(),
                sellingPrice: Number(selling) || 0,
                costPrice: Number(cost) || 0,
                stockQty: Number(stock) || 0,
              });
              haptics.soft();
              setName("");
              setSelling("");
              setCost("");
              setStock("");
              setAddOpen(false);
              setMessage("Item added to your stock list.");
            }}
          />
        }
      >
        <FieldWell label={headers.name} placeholder="Brown bread" value={name} onChangeText={setName} />
        <FieldWell
          label={headers.selling}
          placeholder="0,00"
          value={selling}
          onChangeText={setSelling}
          keyboardType="decimal-pad"
        />
        <FieldWell label={headers.cost} placeholder="0,00" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
        <FieldWell
          label="Starting stock"
          placeholder="0"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
          optional
        />
      </FrostedTray>

      <FrostedTray
        visible={customizeOpen}
        title="Customize columns"
        subtitle="Rename the labels you see. Nothing else changes."
        onClose={() => setCustomizeOpen(false)}
        actions={<Button label="Save labels" onPress={() => setCustomizeOpen(false)} />}
      >
        <FieldWell label="Item label" value={headers.name} onChangeText={(value) => setHeaders((h) => ({ ...h, name: value }))} />
        <FieldWell
          label="Selling price label"
          value={headers.selling}
          onChangeText={(value) => setHeaders((h) => ({ ...h, selling: value }))}
        />
        <FieldWell
          label="Cost price label"
          value={headers.cost}
          onChangeText={(value) => setHeaders((h) => ({ ...h, cost: value }))}
        />
      </FrostedTray>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  rail: { flexShrink: 1 },
  list: { paddingBottom: layout.base * 2 },
  empty: { gap: 10, paddingTop: layout.base * 4, alignItems: "center" },
  emptyTitle: { ...type.title, fontSize: 20, lineHeight: 26, color: palette.ink, textAlign: "center" },
  emptyBody: { ...type.body, color: palette.mutedInk, textAlign: "center", maxWidth: 320 },
  swipeAction: {
    width: 96,
    backgroundColor: palette.teal,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.card,
    marginLeft: 8,
  },
  swipeActionText: { ...type.button, color: palette.paperRaised },
  toast: { position: "absolute", left: layout.screen, right: layout.screen, bottom: 96 },
  toastCard: { padding: 16, borderColor: onLight.hairline },
  toastText: { ...type.helper, color: palette.ink },
  footer: {
    paddingTop: 12,
    paddingBottom: layout.safeBottom,
    borderTopWidth: 1,
    borderTopColor: onLight.hairlineSoft,
  },
});

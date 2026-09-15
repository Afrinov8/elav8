import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
import { SignalPill } from "@/components/ui/signal-pill";
import { fontFamily, formatCurrency, layout, onLight, palette, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

type Filter = "all" | "unpaid" | "paid";
type Invoice = {
  id: number;
  customerName: string;
  amount: string;
  status: "pending" | "sent" | "paid" | "overdue";
  dueDate: Date | string | null;
};

const STATUS_LABEL: Record<Invoice["status"], string> = {
  pending: "Pending",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

export default function MoneyScreen() {
  const utils = trpc.useUtils();
  const haptics = useHaptics();
  const invoices = trpc.invoices.list.useQuery();
  const markPaid = trpc.invoices.markPaid.useMutation({ onSuccess: () => utils.invoices.list.invalidate() });
  const createInvoice = trpc.invoices.create.useMutation({ onSuccess: () => utils.invoices.list.invalidate() });

  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3600);
    return () => clearTimeout(timer);
  }, [message]);

  const data = (invoices.data ?? []) as Invoice[];

  const summary = useMemo(() => {
    const outstanding = data.filter((invoice) => invoice.status !== "paid");
    return {
      outstandingTotal: outstanding.reduce((total, invoice) => total + Number(invoice.amount), 0),
      outstandingCount: outstanding.length,
      overdueCount: outstanding.filter((invoice) => invoice.status === "overdue").length,
      paidCount: data.length - outstanding.length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === "unpaid") return data.filter((invoice) => invoice.status !== "paid");
    if (filter === "paid") return data.filter((invoice) => invoice.status === "paid");
    return data;
  }, [data, filter]);

  const dueLabel = (invoice: Invoice) => {
    if (!invoice.dueDate) return STATUS_LABEL[invoice.status];
    const due = new Date(invoice.dueDate);
    const days = Math.round((due.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    const when = days === 0 ? "due today" : days > 0 ? `due in ${days} days` : `${Math.abs(days)} days late`;
    return `${when} · ${new Date(due).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`;
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Money" title="Who still owes you." subtitle="Invoices, due dates, and what has landed." />

      <RaisedCard style={styles.summary}>
        <Text style={styles.summaryLabel}>OUTSTANDING</Text>
        <Text style={styles.summaryValue}>{formatCurrency(summary.outstandingTotal)}</Text>
        <View style={styles.summaryRow}>
          <SignalPill label={`${summary.outstandingCount} open`} tone="ochre" />
          <SignalPill label={`${summary.overdueCount} overdue`} tone="burgundy" />
          <SignalPill label={`${summary.paidCount} paid`} tone="moss" />
        </View>
      </RaisedCard>

      <View style={styles.filterRow}>
        <SegmentedRail
          compact
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Unpaid", value: "unpaid" },
            { label: "Paid", value: "paid" },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(invoice) => String(invoice.id)}
        contentContainerStyle={styles.list}
        refreshing={invoices.isFetching}
        onRefresh={() => invoices.refetch()}
        ListEmptyComponent={
          invoices.isLoading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No invoices yet.</Text>
              <Text style={styles.emptyBody}>
                Record what you&apos;re owed and Elav8 keeps an eye on the due dates for you.
              </Text>
              <GhostAction label="Record your first invoice" onPress={() => setAddOpen(true)} />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <LedgerRow
            name={item.customerName}
            priceLabel={formatCurrency(item.amount)}
            meta={dueLabel(item)}
            accent={item.status === "paid" ? "teal" : item.status === "overdue" ? "burgundy" : "none"}
            last={index === filtered.length - 1}
            onPress={() => {
              haptics.light();
              setSelected(item);
            }}
          />
        )}
      />

      {message ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.toast}>
          <RaisedCard style={styles.toastCard}>
            <Text style={styles.toastText}>{message}</Text>
          </RaisedCard>
        </Animated.View>
      ) : null}

      <View style={styles.footer}>
        <Button label="Send an invoice" tone="burgundy" onPress={() => setAddOpen(true)} />
      </View>

      <FrostedTray
        visible={selected !== null}
        title={selected?.customerName ?? "Invoice"}
        subtitle={
          selected?.status === "paid"
            ? "This one is settled."
            : "Mark it paid once the money lands. No reminder is sent automatically."
        }
        onClose={() => setSelected(null)}
        actions={
          selected && selected.status !== "paid" ? (
            <>
              <Button
                label="Mark as paid"
                tone="teal"
                loading={markPaid.isPending}
                onPress={async () => {
                  const invoice = selected;
                  setSelected(null);
                  await markPaid.mutateAsync({ id: invoice.id });
                  haptics.success();
                  setMessage(`${invoice.customerName} settled.`);
                }}
              />
              <GhostAction label="Close" onPress={() => setSelected(null)} />
            </>
          ) : (
            <GhostAction label="Close" onPress={() => setSelected(null)} />
          )
        }
      >
        {selected ? (
          <>
            <Text style={styles.trayAmount}>{formatCurrency(selected.amount)}</Text>
            <Text style={styles.trayMeta}>
              {STATUS_LABEL[selected.status]} · {dueLabel(selected)}
            </Text>
          </>
        ) : null}
      </FrostedTray>

      <FrostedTray
        visible={addOpen}
        title="Send an invoice"
        subtitle="Recorded in Elav8 with a seven-day due date. No message is sent from here yet."
        onClose={() => setAddOpen(false)}
        actions={
          <Button
            label="Record invoice"
            tone="burgundy"
            loading={createInvoice.isPending}
            disabled={!customerName.trim() || !amount}
            onPress={async () => {
              await createInvoice.mutateAsync({
                customerName: customerName.trim(),
                amount: Number(amount) || 0,
                dueInDays: 7,
              });
              haptics.soft();
              setCustomerName("");
              setAmount("");
              setAddOpen(false);
              setMessage("Invoice recorded, due in seven days.");
            }}
          />
        }
      >
        <FieldWell label="Customer name" placeholder="Thabo Nkosi" value={customerName} onChangeText={setCustomerName} />
        <FieldWell label="Amount" placeholder="0,00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      </FrostedTray>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 8, marginBottom: layout.gutter },
  summaryLabel: { ...type.sectionLabel, color: palette.mutedInk },
  summaryValue: { ...type.hero, fontSize: 34, lineHeight: 38, color: palette.ink },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  filterRow: { marginBottom: 16 },
  list: { paddingBottom: layout.base * 2 },
  empty: { gap: 10, paddingTop: layout.base * 4, alignItems: "center" },
  emptyTitle: { ...type.title, fontSize: 20, lineHeight: 26, color: palette.ink, textAlign: "center" },
  emptyBody: { ...type.body, color: palette.mutedInk, textAlign: "center", maxWidth: 320 },
  trayAmount: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 38, color: palette.ink },
  trayMeta: { ...type.helper, color: palette.mutedInk },
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

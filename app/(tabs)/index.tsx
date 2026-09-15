import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { FieldWell } from "@/components/ui/field-well";
import { FrostedTray } from "@/components/ui/frosted-tray";
import { GhostAction } from "@/components/ui/ghost-action";
import { OrbitIcon } from "@/components/ui/orbit-icon";
import { PetalConstellation, type Petal } from "@/components/ui/petal-constellation";
import { RaisedCard } from "@/components/ui/raised-card";
import { SignalPill } from "@/components/ui/signal-pill";
import { Sparkline } from "@/components/ui/sparkline";
import { formatCurrency, layout, onDark, palette, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

const PETALS: Petal[] = [
  { id: "sale", label: "Add Sale", glyph: "＋", tone: "ochre" },
  { id: "stock", label: "Add Stock", glyph: "▦", tone: "teal" },
  { id: "invoice", label: "Send Invoice", glyph: "↗", tone: "burgundy" },
  { id: "draft", label: "Draft WhatsApp", glyph: "✎", tone: "moss" },
];

const EXAMPLE_DRAFT =
  "Hi Thabo, just a friendly reminder that your invoice of R 450,00 is now overdue. Let me know if you'd like to arrange payment. Thank you!";

export default function CommandCenterScreen() {
  const { business, user } = useSession();
  const { width } = useWindowDimensions();
  const utils = trpc.useUtils();
  const haptics = useHaptics();

  const summary = trpc.dashboard.summary.useQuery();
  const createSale = trpc.sales.create.useMutation({ onSuccess: () => utils.dashboard.summary.invalidate() });
  const createInvoice = trpc.invoices.create.useMutation({ onSuccess: () => utils.dashboard.summary.invalidate() });

  const [selectedPetal, setSelectedPetal] = useState<string | null>(null);
  const [tray, setTray] = useState<"sale" | "invoice" | "draft" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [saleDesc, setSaleDesc] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3600);
    return () => clearTimeout(timer);
  }, [message]);

  const data = summary.data;
  const delta = data?.revenue.deltaPct ?? 0;
  const firstName = user?.fullName?.split(" ")[0];
  const isWeekend = [0, 6].includes(new Date().getDay());
  const draft = data?.suggestion?.draft ?? EXAMPLE_DRAFT;

  const sparkline = useMemo(() => data?.revenue.sparkline ?? [0, 0, 0, 0, 0, 0, 0], [data?.revenue.sparkline]);

  const onPetal = (petal: Petal) => {
    setSelectedPetal(petal.id);
    if (petal.id === "stock") {
      router.push("/(tabs)/inventory");
      setMessage("Head to Inventory to add stock.");
      return;
    }
    setTray(petal.id as "sale" | "invoice" | "draft");
  };

  return (
    <ScreenContainer tone="deep">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={summary.isFetching} onRefresh={() => summary.refetch()} tintColor={palette.ochre} />
        }
      >
        <View style={styles.topBar}>
          <Text style={styles.business} numberOfLines={1}>
            {business?.name ?? "Your business"}
          </Text>
          <SignalPill label={isWeekend ? "Weekend Free" : "Trial active"} tone={isWeekend ? "moss" : "ochre"} onDark />
        </View>
        <Text style={styles.greeting}>Good day{firstName ? `, ${firstName}` : ""}.</Text>

        <RaisedCard tone="deep" style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <Text style={styles.eyebrow}>THIS WEEK</Text>
          <Text style={styles.heroValue}>{formatCurrency(data?.revenue.thisWeek ?? 0)}</Text>
          <Text style={styles.heroSub}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}% from last week
          </Text>
          <View style={styles.sparkline}>
            <Sparkline data={sparkline} width={Math.min(width - layout.screen * 2 - 40, 300)} height={34} />
          </View>
          <Text style={styles.heroCaption}>Your takings, last seven days.</Text>
        </RaisedCard>

        <PetalConstellation petals={PETALS} selectedId={selectedPetal} onSelect={onPetal} />

        <View style={styles.opsRow}>
          <RaisedCard tone="deep" style={styles.opsCard}>
            <Text style={styles.opsValue}>{data?.lowStockCount ?? 0}</Text>
            <Text style={styles.opsLabel}>Low stock items</Text>
          </RaisedCard>
          <RaisedCard tone="deep" style={styles.opsCard}>
            <Text style={[styles.opsValue, { color: onDark.text }]}>{data?.overdueCount ?? 0}</Text>
            <Text style={styles.opsLabel}>Overdue invoices</Text>
          </RaisedCard>
        </View>

        <RaisedCard tone="deep" style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <OrbitIcon size={20} spinning={summary.isFetching} />
            <Text style={styles.eyebrow}>THINKING</Text>
          </View>
          {data?.suggestion ? (
            <>
              <Text style={styles.aiText}>
                Draft a payment reminder for {data.suggestion.customerName.split(" ")[0]}?
              </Text>
              <Text style={styles.aiNote}>
                Elav8 writes the message; you decide whether to send it. Nothing leaves the app on its own.
              </Text>
              <Button
                label="Draft WhatsApp"
                variant="secondary"
                tone="teal"
                onPress={() => {
                  setSelectedPetal("draft");
                  setTray("draft");
                }}
              />
            </>
          ) : (
            <>
              <Text style={styles.aiText}>No overdue reminders right now — nice work.</Text>
              <Text style={styles.aiNote}>When an invoice runs late, the draft will show up here.</Text>
            </>
          )}
        </RaisedCard>

        <Text style={styles.footerNote}>Elav8 is a growth tool, not a surveillance tool.</Text>
      </ScrollView>

      {message ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.toast}>
          <RaisedCard tone="deep" style={styles.toastCard}>
            <Text style={styles.toastText}>{message}</Text>
          </RaisedCard>
        </Animated.View>
      ) : null}

      <FrostedTray
        tone="deep"
        visible={tray === "sale"}
        title="Add a sale"
        subtitle="Saved to this week's takings straight away."
        onClose={() => setTray(null)}
        actions={
          <Button
            label="Save sale"
            loading={createSale.isPending}
            disabled={!saleDesc.trim() || !saleAmount}
            onPress={async () => {
              await createSale.mutateAsync({ description: saleDesc.trim(), amount: Number(saleAmount) || 0 });
              haptics.soft();
              setSaleDesc("");
              setSaleAmount("");
              setTray(null);
              setMessage("Sale saved. Your takings are updated.");
            }}
          />
        }
      >
        <FieldWell
          tone="deep"
          label="What did you sell?"
          placeholder="Braiding service"
          value={saleDesc}
          onChangeText={setSaleDesc}
        />
        <FieldWell
          tone="deep"
          label="Amount"
          placeholder="0,00"
          value={saleAmount}
          onChangeText={setSaleAmount}
          keyboardType="decimal-pad"
        />
      </FrostedTray>

      <FrostedTray
        tone="deep"
        visible={tray === "invoice"}
        title="Send an invoice"
        subtitle="Recorded in Elav8 with a due date. No message is sent from here yet."
        onClose={() => setTray(null)}
        actions={
          <Button
            label="Record invoice"
            tone="burgundy"
            loading={createInvoice.isPending}
            disabled={!invoiceName.trim() || !invoiceAmount}
            onPress={async () => {
              await createInvoice.mutateAsync({
                customerName: invoiceName.trim(),
                amount: Number(invoiceAmount) || 0,
                dueInDays: 7,
              });
              haptics.soft();
              setInvoiceName("");
              setInvoiceAmount("");
              setTray(null);
              setMessage("Invoice recorded, due in seven days.");
            }}
          />
        }
      >
        <FieldWell
          tone="deep"
          label="Customer name"
          placeholder="Thabo Nkosi"
          value={invoiceName}
          onChangeText={setInvoiceName}
        />
        <FieldWell
          tone="deep"
          label="Amount"
          placeholder="0,00"
          value={invoiceAmount}
          onChangeText={setInvoiceAmount}
          keyboardType="decimal-pad"
        />
      </FrostedTray>

      <FrostedTray
        tone="deep"
        visible={tray === "draft"}
        title="Example payment reminder"
        subtitle="A sample of what Elav8 would draft. Nothing is sent."
        onClose={() => setTray(null)}
        actions={
          <>
            <Button
              label="Copy draft"
              variant="secondary"
              tone="teal"
              onPress={() => {
                haptics.light();
                setTray(null);
                setMessage("Draft copied. Paste it into WhatsApp yourself.");
              }}
            />
            <GhostAction label="Close" onPress={() => setTray(null)} />
          </>
        }
      >
        <RaisedCard tone="deep" style={styles.draftCard}>
          <Text style={styles.draftText}>{draft}</Text>
        </RaisedCard>
        <Text style={styles.aiNote}>
          WhatsApp isn&apos;t connected in this build, so Elav8 can&apos;t send on your behalf.
        </Text>
      </FrostedTray>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: layout.gutter, paddingTop: layout.base * 2, paddingBottom: layout.base * 4 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  business: { ...type.body, color: onDark.text, flexShrink: 1 },
  greeting: { ...type.helper, color: onDark.textMuted, marginTop: -8 },
  hero: { padding: 24, gap: 6, overflow: "hidden" },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: onDark.ochreGlow,
    top: -60,
    left: -30,
  },
  eyebrow: { ...type.sectionLabel, color: onDark.textMuted },
  heroValue: { ...type.hero, color: onDark.text },
  heroSub: { ...type.helper, color: onDark.textMuted },
  sparkline: { marginTop: 10 },
  heroCaption: { ...type.helper, fontSize: 12, lineHeight: 16, color: onDark.textFaint },
  opsRow: { flexDirection: "row", gap: 12 },
  opsCard: { flex: 1, padding: 18, gap: 4 },
  opsValue: { ...type.hero, fontSize: 30, lineHeight: 34, color: palette.ochre },
  opsLabel: { ...type.helper, color: onDark.textMuted },
  aiCard: { gap: 12 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiText: { ...type.body, color: onDark.text },
  aiNote: { ...type.helper, fontSize: 12, lineHeight: 16, color: onDark.textMuted },
  draftCard: { padding: 16, backgroundColor: palette.deepSunken },
  draftText: { ...type.body, color: onDark.text },
  toast: { position: "absolute", left: layout.screen, right: layout.screen, bottom: layout.base * 10 },
  toastCard: { padding: 16, borderColor: onDark.hairlineStrong },
  toastText: { ...type.helper, color: onDark.text },
  footerNote: { ...type.helper, color: onDark.textFaint, textAlign: "center" },
});

import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { OrbitIcon } from "@/components/ui/orbit-icon";
import { Sparkline } from "@/components/ui/sparkline";
import { ActionSheet } from "@/components/ui/action-sheet";
import { LedgerInput } from "@/components/ui/ledger-input";
import { palette, radius } from "@/constants/theme";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

const isWeekend = [0, 6].includes(new Date().getDay());

export default function CommandCenterScreen() {
  const { business, user } = useSession();
  const utils = trpc.useUtils();
  const summary = trpc.dashboard.summary.useQuery();
  const [pressed, setPressed] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [draftShown, setDraftShown] = useState(false);

  const [saleDesc, setSaleDesc] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const createSale = trpc.sales.create.useMutation({
    onSuccess: () => {
      utils.dashboard.summary.invalidate();
      setSaleOpen(false);
      setSaleDesc("");
      setSaleAmount("");
    },
  });
  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => {
      utils.dashboard.summary.invalidate();
      setInvoiceOpen(false);
      setInvoiceName("");
      setInvoiceAmount("");
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.98 : 1, { damping: 16, stiffness: 220 }) }],
  }));

  const data = summary.data;
  const delta = data?.revenue.deltaPct ?? 0;
  const firstName = user?.fullName?.split(" ")[0];

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={summary.isFetching} onRefresh={() => summary.refetch()} tintColor={palette.ochre} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>Elav8</Text>
          <View style={styles.topBarRight}>
            <Pill label={isWeekend ? "Weekend Free" : "Trial active"} tone={isWeekend ? "teal" : "ochre"} />
          </View>
        </View>
        <Text style={styles.trustNote}>🔒 Private by design — your data stays with your business.</Text>

        <Text style={styles.greeting}>Good day{firstName ? `, ${firstName}` : ""}.</Text>
        <Text style={styles.screenTitle}>{business?.name ?? "Your command center."}</Text>

        <Pressable
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => summary.refetch()}
        >
          <Animated.View style={[styles.revenue, cardStyle]}>
            <Text style={styles.revenueLabel}>THIS WEEK</Text>
            <View style={styles.revenueRow}>
              <View>
                <Text style={styles.revenueValue}>R {(data?.revenue.thisWeek ?? 0).toFixed(2)}</Text>
                <Text style={styles.revenueSub}>
                  {delta >= 0 ? "+" : ""}
                  {delta}% from last week
                </Text>
              </View>
              <Sparkline data={data?.revenue.sparkline ?? [0, 0, 0, 0, 0, 0, 0]} />
            </View>
          </Animated.View>
        </Pressable>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.radar}>
          <Pressable onPress={() => setSaleOpen(true)} style={[styles.radarAction, { backgroundColor: palette.ochre }]}>
            <Text style={styles.radarIcon}>＋</Text>
            <Text style={styles.radarText}>Add Sale</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/inventory")} style={[styles.radarAction, { backgroundColor: palette.teal }]}>
            <Text style={styles.radarIcon}>▦</Text>
            <Text style={styles.radarText}>Add Stock</Text>
          </Pressable>
          <Pressable onPress={() => setInvoiceOpen(true)} style={[styles.radarAction, { backgroundColor: palette.burgundy }]}>
            <Text style={styles.radarIcon}>↗</Text>
            <Text style={styles.radarText}>Send Invoice</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Keep an eye on</Text>
        <View style={styles.opsRow}>
          <Card style={styles.opsCard}>
            <Text style={styles.opsValue}>{data?.lowStockCount ?? 0}</Text>
            <Text style={styles.opsLabel}>Low stock items</Text>
          </Card>
          <Card style={styles.opsCard}>
            <Text style={[styles.opsValue, { color: palette.burgundy }]}>{data?.overdueCount ?? 0}</Text>
            <Text style={styles.opsLabel}>Overdue invoices</Text>
          </Card>
        </View>

        <Card style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <OrbitIcon size={22} spinning={!data?.suggestion} />
            <Text style={styles.aiEyebrow}>THINKING</Text>
          </View>
          {data?.suggestion ? (
            <>
              <Text style={styles.aiText}>Draft payment reminder for {data.suggestion.customerName.split(" ")[0]}?</Text>
              {draftShown ? (
                <View style={styles.draft}>
                  <Text style={styles.draftText}>&ldquo;{data.suggestion.draft}&rdquo;</Text>
                </View>
              ) : null}
              <Button label={draftShown ? "Draft ready" : "Draft WhatsApp"} onPress={() => setDraftShown(true)} />
            </>
          ) : (
            <Text style={styles.aiText}>No overdue reminders right now — nice work.</Text>
          )}
        </Card>

        <Text style={styles.footerNote}>Elav8 is a growth tool, not a surveillance tool.</Text>
      </ScrollView>

      <ActionSheet visible={saleOpen} title="Add a sale" onClose={() => setSaleOpen(false)}>
        <LedgerInput label="What did you sell?" placeholder="e.g. Braiding service" value={saleDesc} onChangeText={setSaleDesc} />
        <LedgerInput label="Amount (R)" placeholder="0.00" value={saleAmount} onChangeText={setSaleAmount} keyboardType="decimal-pad" />
        <Button
          label="Save sale"
          onPress={() => createSale.mutate({ description: saleDesc, amount: Number(saleAmount) || 0 })}
          loading={createSale.isPending}
          disabled={!saleDesc.trim() || !saleAmount}
        />
      </ActionSheet>

      <ActionSheet visible={invoiceOpen} title="Send an invoice" onClose={() => setInvoiceOpen(false)}>
        <LedgerInput label="Customer name" placeholder="e.g. Thabo Nkosi" value={invoiceName} onChangeText={setInvoiceName} />
        <LedgerInput label="Amount (R)" placeholder="0.00" value={invoiceAmount} onChangeText={setInvoiceAmount} keyboardType="decimal-pad" />
        <Button
          label="Send invoice"
          tone="burgundy"
          onPress={() => createInvoice.mutate({ customerName: invoiceName, amount: Number(invoiceAmount) || 0 })}
          loading={createInvoice.isPending}
          disabled={!invoiceName.trim() || !invoiceAmount}
        />
      </ActionSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, gap: 16, paddingTop: 12, paddingBottom: 32 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topBarRight: { flexDirection: "row", gap: 8 },
  brand: { fontFamily: "Fraunces_700Bold", fontSize: 22, color: palette.ink, letterSpacing: -0.5 },
  trustNote: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 11, color: palette.mutedInk },
  greeting: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 15, color: palette.mutedInk, marginTop: 6 },
  screenTitle: { fontFamily: "Fraunces_700Bold", fontSize: 24, lineHeight: 30, color: palette.ink },
  revenue: { backgroundColor: palette.ochre, minHeight: 140, borderRadius: radius.lg, padding: 20, justifyContent: "center" },
  revenueLabel: { color: "#F8EEDC", fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, letterSpacing: 1.8 },
  revenueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 },
  revenueValue: { color: palette.white, fontFamily: "Fraunces_700Bold", fontSize: 30 },
  revenueSub: { color: "#F8EEDC", fontFamily: "SpaceGrotesk_400Regular", fontSize: 13, marginTop: 4 },
  sectionTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: palette.ink, marginTop: 4 },
  radar: { flexDirection: "row", gap: 8 },
  radarAction: { flex: 1, borderRadius: radius.lg, minHeight: 86, padding: 12, justifyContent: "space-between" },
  radarIcon: { color: palette.white, fontSize: 20 },
  radarText: { color: palette.white, fontFamily: "SpaceGrotesk_700Bold", fontSize: 12 },
  opsRow: { flexDirection: "row", gap: 10 },
  opsCard: { flex: 1, gap: 2 },
  opsValue: { fontFamily: "Fraunces_700Bold", fontSize: 26, color: palette.ink },
  opsLabel: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, color: palette.mutedInk },
  aiCard: { gap: 12 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiEyebrow: { color: palette.teal, fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, letterSpacing: 1.5 },
  aiText: { color: palette.ink, fontFamily: "SpaceGrotesk_500Medium", fontSize: 15 },
  draft: { backgroundColor: palette.paper, borderRadius: radius.md, padding: 12 },
  draftText: { color: palette.ink, fontFamily: "SpaceGrotesk_400Regular", fontSize: 13, lineHeight: 19 },
  footerNote: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, textAlign: "center", marginTop: 4 },
});

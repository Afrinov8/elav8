import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui/screen-header";
import { LedgerInput } from "@/components/ui/ledger-input";
import { Segmented } from "@/components/ui/segmented";
import { CheckboxRow } from "@/components/ui/checkbox-row";
import { Button } from "@/components/ui/button";
import { palette, radius } from "@/constants/theme";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

const INDUSTRIES = [
  "Personal Care & Beauty",
  "Automotive & Repair",
  "Food, Beverage & Hospitality",
  "Construction & Trades",
  "Transport & Logistics",
  "Retail & Trading",
  "Home & Domestic Services",
  "Events & Entertainment",
  "Professional Services",
  "Other",
] as const;

export default function SignupScreen() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>(INDUSTRIES[0]);
  const [moduleChoice, setModuleChoice] = useState<"stock" | "jobs" | "both">("both");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consents, setConsents] = useState({
    eula: false,
    acknowledgement: false,
    smsConsent: false,
    dataSharing: false,
  });

  const { setSession } = useSession();
  const signup = trpc.auth.signup.useMutation();

  const canSubmit = useMemo(
    () =>
      businessName.trim().length > 1 &&
      fullName.trim().length > 1 &&
      phone.trim().length > 5 &&
      password.length >= 6 &&
      consents.eula &&
      consents.acknowledgement,
    [businessName, fullName, phone, password, consents],
  );

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      const result = await signup.mutateAsync({
        businessName: businessName.trim(),
        industry,
        moduleChoice,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        consents,
      });
      await setSession(result.token, result.user, (result.business as any) ?? null);
      router.replace("/(tabs)");
    } catch {
      // surfaced via signup.error
    }
  };

  return (
    <ScreenContainer containerClassName="bg-[#F7F1E7]" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          eyebrow="NEW BUSINESS"
          title="Set up your Command Center."
          subtitle="A few details to get you trading. Nothing here leaves your business record."
        />

        <LedgerInput label="Business name" placeholder="Bloom & Move" value={businessName} onChangeText={setBusinessName} />

        <Text style={styles.label}>Industry</Text>
        <View style={styles.grid}>
          {INDUSTRIES.map((item) => {
            const selected = item === industry;
            return (
              <Pressable
                key={item}
                onPress={() => setIndustry(item)}
                style={[styles.tile, selected && styles.tileSelected]}
              >
                <Text style={[styles.tileText, selected && styles.tileTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>What would you like to set up first?</Text>
        <Segmented
          value={moduleChoice}
          onChange={setModuleChoice}
          options={[
            { label: "Stock & Prices", value: "stock" },
            { label: "Jobs & Invoices", value: "jobs" },
            { label: "Both", value: "both" },
          ]}
        />

        <View style={styles.divider} />

        <LedgerInput label="Full name" placeholder="Your full name" value={fullName} onChangeText={setFullName} />
        <LedgerInput label="Phone" placeholder="+27 82 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <LedgerInput label="Email (optional)" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <LedgerInput label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />

        <View style={styles.divider} />

        <Text style={styles.label}>Before you continue</Text>
        <CheckboxRow
          label="I agree to the EULA"
          value={consents.eula}
          onValueChange={(v) => setConsents((c) => ({ ...c, eula: v }))}
        />
        <CheckboxRow
          label="I acknowledge this business information is mine"
          value={consents.acknowledgement}
          onValueChange={(v) => setConsents((c) => ({ ...c, acknowledgement: v }))}
        />
        <CheckboxRow
          label="Send me SMS updates"
          helper="Optional — reminders and account notices."
          value={consents.smsConsent}
          onValueChange={(v) => setConsents((c) => ({ ...c, smsConsent: v }))}
        />
        <CheckboxRow
          label="Share anonymized data to improve market insights"
          helper="Optional and opt-in. You can change this any time in Profile."
          value={consents.dataSharing}
          onValueChange={(v) => setConsents((c) => ({ ...c, dataSharing: v }))}
        />

        {signup.error ? <Text style={styles.errorText}>{signup.error.message}</Text> : null}

        <Button label="Submit & Continue" onPress={onSubmit} disabled={!canSubmit} loading={signup.isPending} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, gap: 14, padding: 20, paddingBottom: 40 },
  label: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 13, color: palette.ink, marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: {
    width: "48%",
    minHeight: 52,
    borderWidth: 1,
    borderColor: palette.sandLine,
    borderRadius: radius.md,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: palette.card,
  },
  tileSelected: { borderColor: palette.ochre, backgroundColor: "#F4E5CD" },
  tileText: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, color: palette.ink },
  tileTextSelected: { fontFamily: "SpaceGrotesk_500Medium", color: palette.ochreDeep },
  divider: { height: 1, backgroundColor: palette.sandLine, marginVertical: 6 },
  errorText: { color: palette.burgundy, fontFamily: "SpaceGrotesk_400Regular", fontSize: 13 },
});

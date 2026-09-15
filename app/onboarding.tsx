import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { SpazaSilhouette } from "@/components/skyline";
import { ApertureRing } from "@/components/ui/aperture-ring";
import { Button } from "@/components/ui/button";
import { CheckboxRow } from "@/components/ui/checkbox-row";
import { FieldWell } from "@/components/ui/field-well";
import { FrostedTray } from "@/components/ui/frosted-tray";
import { GhostAction } from "@/components/ui/ghost-action";
import { OtpWell } from "@/components/ui/otp-well";
import { RaisedCard } from "@/components/ui/raised-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SegmentedRail } from "@/components/ui/segmented-rail";
import { ShieldMark } from "@/components/ui/shield-mark";
import { Toggle } from "@/components/ui/toggle";
import {
  fontFamily,
  formatPhone,
  layout,
  motion,
  onDark,
  onLight,
  palette,
  radius,
  ramp,
  type,
} from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

/**
 * New-business flow from design.md: Welcome → Identity and Contact → Industry →
 * Business Setup → Inventory Setup (skipped for Jobs & Invoices) → Consent →
 * Verification → Pending Approval.
 */

type Step = "welcome" | "identity" | "industry" | "business" | "inventory" | "consent" | "verification" | "pending";
type ModuleChoice = "jobs" | "stock" | "both";
type InventoryRow = { id: string; name: string; selling: string; cost: string };

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

/** Sample items from the content standards, so no row starts empty-looking. */
const SAMPLE_SUGGESTIONS = ["Airtime R5", "Brown bread", "2L cold drink", "Paraffin 1L", "Maize meal 5kg"];

let rowSeed = 0;
const makeRow = (): InventoryRow => ({ id: `row-${(rowSeed += 1)}`, name: "", selling: "", cost: "" });

export default function OnboardingScreen() {
  const { setSession } = useSession();
  const haptics = useHaptics();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("welcome");

  /* profile · onboarding state (design.md → MVP data model) */
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");

  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>(INDUSTRIES[0]);

  const [businessName, setBusinessName] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [addressSameAsPhysical, setAddressSameAsPhysical] = useState(true);
  const [businessAddress, setBusinessAddress] = useState("");
  const [moduleChoice, setModuleChoice] = useState<ModuleChoice>("both");

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [headers, setHeaders] = useState({ name: "Item", selling: "Selling price", cost: "Cost price" });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [consents, setConsents] = useState({ eula: false, acknowledgement: false, smsConsent: false, dataSharing: false });
  const [error, setError] = useState<string | undefined>();

  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [notified, setNotified] = useState(false);
  const [statusNote, setStatusNote] = useState<string | undefined>();

  const signup = trpc.auth.signup.useMutation();
  const createItem = trpc.inventory.create.useMutation();

  const steps = useMemo<Step[]>(
    () =>
      moduleChoice === "jobs"
        ? ["welcome", "identity", "industry", "business", "consent", "verification", "pending"]
        : ["welcome", "identity", "industry", "business", "inventory", "consent", "verification", "pending"],
    [moduleChoice],
  );

  const index = Math.max(steps.indexOf(step), 0);
  const deep = step === "verification" || step === "pending";

  /* shared-axis step transition */
  const direction = useRef(1);
  const anim = useSharedValue(1);
  useEffect(() => {
    anim.value = 0;
    anim.value = withTiming(1, {
      duration: reducedMotion ? motion.reduced : motion.onboardingStep,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const stepStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ translateX: direction.current * 26 * (1 - anim.value) }],
  }));

  const go = (next: Step) => {
    const nextIndex = steps.indexOf(next);
    direction.current = nextIndex >= index ? 1 : -1;
    setError(undefined);
    setStep(next);
  };

  /* A module switch can remove the inventory step from under us. */
  useEffect(() => {
    if (!steps.includes(step)) setStep("consent");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useEffect(() => {
    if (step !== "inventory" || rows.length > 0) return;
    const count = moduleChoice === "stock" ? 3 : 2;
    setRows(Array.from({ length: count }, makeRow));
  }, [step, moduleChoice, rows.length]);

  const identityValid =
    fullName.trim().length > 1 && dateOfBirth.trim().length >= 4 && phone.trim().length >= 6 && password.length >= 6;
  const inventoryComplete = rows.length > 0 && rows.every((row) => row.name.trim() && row.selling.trim() && row.cost.trim());
  const consentsValid = consents.eula && consents.acknowledgement;

  const submit = async () => {
    setError(undefined);
    try {
      const result = await signup.mutateAsync({
        businessName: businessName.trim(),
        industry,
        moduleChoice,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        registered,
        registrationNumber: registrationNumber.trim() || undefined,
        physicalAddress: physicalAddress.trim() || undefined,
        addressSameAsPhysical,
        businessAddress: addressSameAsPhysical ? physicalAddress.trim() || undefined : businessAddress.trim() || undefined,
        website: website.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        consents,
      });
      await setSession(result.token, result.user, (result.business as never) ?? null);

      const seeded = rows.filter((row) => row.name.trim() && row.selling.trim());
      if (seeded.length > 0) {
        await Promise.allSettled(
          seeded.map((row) =>
            createItem.mutateAsync({
              name: row.name.trim(),
              sellingPrice: Number(row.selling) || 0,
              costPrice: Number(row.cost) || 0,
              stockQty: 0,
            }),
          ),
        );
      }

      haptics.success();
      go("verification");
    } catch (cause) {
      haptics.rigid();
      setError(cause instanceof Error ? cause.message : "We couldn't create your account. Please try again.");
    }
  };

  const verify = () => {
    haptics.success();
    setVerified(true);
    setTimeout(() => go("pending"), motion.ringSweep);
  };

  return (
    <ScreenContainer tone={deep ? "deep" : "paper"} padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {step !== "welcome" ? (
          <View style={styles.progressWrap}>
            <Text style={[styles.progressLabel, deep && styles.progressLabelDeep]}>
              Step {index + 1} of {steps.length}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: deep ? onDark.hairline : palette.sandLine }]}>
              <View style={[styles.progressFill, { width: `${((index + 1) / steps.length) * 100}%` }]} />
            </View>
          </View>
        ) : null}

        <Animated.View style={[styles.flex, stepStyle]}>
          <ScrollView
            contentContainerStyle={[styles.scroll, (step === "welcome" || step === "verification" || step === "pending") && styles.centered]}
            keyboardShouldPersistTaps="handled"
          >
            {step === "welcome" ? (
              <>
                <View style={styles.spaza}>
                  <SpazaSilhouette />
                </View>
                <Text style={styles.statement}>Run your business{"\n"}from your phone.</Text>
                <Text style={styles.statementBody}>
                  Track what you sell, what&apos;s left on the shelf, and who still owes you — without a laptop or a till.
                  R10 a day, weekends free, three-day trial.
                </Text>
              </>
            ) : null}

            {step === "identity" ? (
              <>
                <ScreenHeader
                  eyebrow="Identity and contact"
                  title="Who are we doing business with?"
                  subtitle="These details sit on your business record and on the invoices you send."
                />
                <View style={styles.fields}>
                  <FieldWell label="Full name" placeholder="Nomsa Dlamini" value={fullName} onChangeText={setFullName} />
                  <FieldWell
                    label="Date of birth"
                    placeholder="1990-04-17"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    keyboardType="numbers-and-punctuation"
                  />
                  <FieldWell
                    label="Phone number"
                    placeholder="+27 82 123 4567"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    helper={phone.length > 6 ? formatPhone(phone) : "We use this to verify you."}
                  />
                  <FieldWell
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    optional
                  />
                  <FieldWell
                    label="Physical address"
                    placeholder="12 Vilakazi Street, Soweto"
                    value={physicalAddress}
                    onChangeText={setPhysicalAddress}
                    multiline
                  />
                  <FieldWell
                    label="Website"
                    placeholder="yourbusiness.co.za"
                    value={website}
                    onChangeText={setWebsite}
                    autoCapitalize="none"
                    optional
                  />
                  <FieldWell
                    label="Password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    helper="You'll use this with your phone number to sign in."
                  />
                </View>
              </>
            ) : null}

            {step === "industry" ? (
              <>
                <ScreenHeader
                  eyebrow="Industry"
                  title="What kind of work do you do?"
                  subtitle="This shapes the language Elav8 uses — nothing more."
                />
                <View style={styles.grid}>
                  {INDUSTRIES.map((item) => {
                    const selected = item === industry;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          haptics.selection();
                          setIndustry(item);
                        }}
                        style={[styles.tile, selected && styles.tileSelected]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.tileText, selected && styles.tileTextSelected]}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {step === "business" ? (
              <>
                <ScreenHeader
                  eyebrow="Business setup"
                  title="Set up your business."
                  subtitle="Registration and address details make your invoices look official."
                />
                <View style={styles.fields}>
                  <FieldWell
                    label="Business name"
                    placeholder="Bloom & Move"
                    value={businessName}
                    onChangeText={setBusinessName}
                  />

                  <RaisedCard style={styles.toggleCard}>
                    <View style={styles.toggleCopy}>
                      <Text style={styles.toggleTitle}>Registered business</Text>
                      <Text style={styles.toggleHelper}>We&apos;ll show your registration number on invoices.</Text>
                    </View>
                    <Toggle value={registered} onValueChange={setRegistered} />
                  </RaisedCard>

                  {registered ? (
                    <Animated.View entering={FadeIn.duration(180)}>
                      <FieldWell
                        label="Registration number"
                        placeholder="2019/123456/07"
                        value={registrationNumber}
                        onChangeText={setRegistrationNumber}
                        keyboardType="numbers-and-punctuation"
                      />
                    </Animated.View>
                  ) : null}

                  <RaisedCard style={styles.toggleCard}>
                    <View style={styles.toggleCopy}>
                      <Text style={styles.toggleTitle}>Trading from the same address</Text>
                      <Text style={styles.toggleHelper}>Switch this off if the business trades elsewhere.</Text>
                    </View>
                    <Toggle value={addressSameAsPhysical} onValueChange={setAddressSameAsPhysical} />
                  </RaisedCard>

                  {!addressSameAsPhysical ? (
                    <Animated.View entering={FadeIn.duration(180)}>
                      <FieldWell
                        label="Business address"
                        placeholder="45 Church Street, Pretoria"
                        value={businessAddress}
                        onChangeText={setBusinessAddress}
                        multiline
                      />
                    </Animated.View>
                  ) : null}

                  <View style={styles.railBlock}>
                    <Text style={styles.blockLabel}>What would you like to set up first?</Text>
                    <SegmentedRail
                      value={moduleChoice}
                      onChange={setModuleChoice}
                      compact
                      options={[
                        { label: "Jobs & Invoices", value: "jobs" },
                        { label: "Stock & Prices", value: "stock" },
                        { label: "Both", value: "both" },
                      ]}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {step === "inventory" ? (
              <>
                <ScreenHeader
                  eyebrow="Inventory setup"
                  title="What do you sell?"
                  subtitle="Add what you know now. You can add more from the Inventory tab any time."
                />
                <View style={styles.actionRow}>
                  <GhostAction label="Customize columns" align="start" onPress={() => setCustomizeOpen(true)} />
                </View>
                <View style={styles.rows}>
                  {rows.map((row, rowIndex) => (
                    <Animated.View key={row.id} entering={FadeIn.duration(180)} layout={LinearTransition.duration(180)}>
                      <RaisedCard style={styles.rowCard}>
                        <View style={styles.rowHead}>
                          <Text style={styles.rowIndex}>Row {rowIndex + 1}</Text>
                          {rows.length > 1 ? (
                            <Pressable
                              onPress={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                              hitSlop={12}
                              accessibilityLabel={`Remove row ${rowIndex + 1}`}
                            >
                              <Text style={styles.rowRemove}>Remove</Text>
                            </Pressable>
                          ) : null}
                        </View>
                        <FieldWell
                          label={headers.name}
                          placeholder={SAMPLE_SUGGESTIONS[rowIndex % SAMPLE_SUGGESTIONS.length]}
                          value={row.name}
                          onChangeText={(value) =>
                            setRows((current) => current.map((item) => (item.id === row.id ? { ...item, name: value } : item)))
                          }
                        />
                        <View style={styles.rowPrices}>
                          <View style={styles.rowPrice}>
                            <FieldWell
                              label={headers.selling}
                              placeholder="0,00"
                              value={row.selling}
                              onChangeText={(value) =>
                                setRows((current) => current.map((item) => (item.id === row.id ? { ...item, selling: value } : item)))
                              }
                              keyboardType="decimal-pad"
                            />
                          </View>
                          <View style={styles.rowPrice}>
                            <FieldWell
                              label={headers.cost}
                              placeholder="0,00"
                              value={row.cost}
                              onChangeText={(value) =>
                                setRows((current) => current.map((item) => (item.id === row.id ? { ...item, cost: value } : item)))
                              }
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>
                      </RaisedCard>
                    </Animated.View>
                  ))}
                </View>
                <View style={styles.actionRow}>
                  <Button
                    label="Add More"
                    variant="secondary"
                    tone="teal"
                    onPress={() => setRows((current) => [...current, makeRow()])}
                  />
                </View>
                {!inventoryComplete ? (
                  <Text style={styles.inlineNote}>
                    Fill every field in every row to continue, or skip this for now.
                  </Text>
                ) : null}
              </>
            ) : null}

            {step === "consent" ? (
              <>
                <ScreenHeader
                  eyebrow="Consent"
                  title="Before you start."
                  subtitle="Two consents are required. The other two are yours to choose, and you can change them later."
                />
                <View style={styles.fields}>
                  <CheckboxRow
                    required
                    label="I agree to the Elav8 End User Licence Agreement."
                    helper="Required to use the app."
                    value={consents.eula}
                    onValueChange={(value) => setConsents((current) => ({ ...current, eula: value }))}
                  />
                  <CheckboxRow
                    required
                    label="I confirm this business information is mine to share."
                    value={consents.acknowledgement}
                    onValueChange={(value) => setConsents((current) => ({ ...current, acknowledgement: value }))}
                  />
                  <CheckboxRow
                    label="Send me SMS updates about my account."
                    helper="Optional — reminders and account notices."
                    value={consents.smsConsent}
                    onValueChange={(value) => setConsents((current) => ({ ...current, smsConsent: value }))}
                  />
                  <CheckboxRow
                    label="Share anonymised data to improve market insights."
                    helper="Optional and opt-in. No customer names, no phone numbers."
                    value={consents.dataSharing}
                    onValueChange={(value) => setConsents((current) => ({ ...current, dataSharing: value }))}
                  />
                  {error ? (
                    <RaisedCard style={styles.errorCard}>
                      <Text style={styles.errorText}>⚑ {error}</Text>
                    </RaisedCard>
                  ) : null}
                </View>
              </>
            ) : null}

            {step === "verification" ? (
              <>
                <ApertureRing
                  progress={verified ? 1 : code.length / 4}
                  size={148}
                  color={palette.teal}
                  glow={onDark.tealGlow}
                  label={verified ? "OK" : `${code.length}/4`}
                  caption={verified ? "Verified" : "Enter code"}
                />
                <Text style={styles.deepTitle}>Verify your number.</Text>
                <Text style={styles.deepBody}>
                  We sent a four-digit code to {phone ? formatPhone(phone) : "your phone"}.
                </Text>
                <View style={styles.otp}>
                  <OtpWell value={code} onChange={setCode} autoFocus />
                </View>
                <Text style={styles.deepNote}>
                  Demo code — any four digits work. SMS delivery isn&apos;t connected in this build.
                </Text>
              </>
            ) : null}

            {step === "pending" ? (
              <>
                <ShieldMark />
                <Text style={styles.deepTitle}>You&apos;re in the queue.</Text>
                <Text style={styles.deepBody}>
                  Our vetting team confirms new businesses, usually within one working day. We&apos;ll tell you the moment
                  you&apos;re approved.
                </Text>
                {notified ? (
                  <RaisedCard tone="deep" style={styles.noticeCard}>
                    <Text style={styles.noticeText}>
                      Noted — we&apos;ll send a message to {phone ? formatPhone(phone) : "your phone"} when it&apos;s done.
                    </Text>
                  </RaisedCard>
                ) : null}
                {statusNote ? <Text style={styles.deepNote}>{statusNote}</Text> : null}
                <Text style={styles.deepNote}>Vetting isn&apos;t wired up in this build, so you can head straight in.</Text>
              </>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, deep && styles.footerDeep]}>
            {step === "welcome" ? (
              <>
                <Button label="Start" onPress={() => go("identity")} />
                <GhostAction label="I already have an account" onPress={() => router.replace("/(auth)/login")} />
              </>
            ) : null}

            {step === "identity" ? (
              <>
                <Button label="Continue" disabled={!identityValid} onPress={() => go("industry")} />
                <GhostAction label="Back" onPress={() => go("welcome")} />
              </>
            ) : null}

            {step === "industry" ? (
              <>
                <Button label="Continue" onPress={() => go("business")} />
                <GhostAction label="Back" onPress={() => go("identity")} />
              </>
            ) : null}

            {step === "business" ? (
              <>
                <Button
                  label="Continue"
                  disabled={businessName.trim().length < 2}
                  onPress={() => go(moduleChoice === "jobs" ? "consent" : "inventory")}
                />
                <GhostAction label="Back" onPress={() => go("industry")} />
              </>
            ) : null}

            {step === "inventory" ? (
              <>
                {inventoryComplete ? <Button label="Done" onPress={() => go("consent")} /> : null}
                <GhostAction label="Do this later" onPress={() => go("consent")} />
              </>
            ) : null}

            {step === "consent" ? (
              <>
                <Button
                  label="Submit & Verify"
                  disabled={!consentsValid}
                  loading={signup.isPending}
                  onPress={submit}
                />
                <GhostAction label="Back" onPress={() => go(moduleChoice === "jobs" ? "business" : "inventory")} />
              </>
            ) : null}

            {step === "verification" ? (
              <>
                <Button label="Verify" tone="teal" disabled={code.length < 4} onPress={verify} />
                <GhostAction label="Verify via WhatsApp" onPress={() => haptics.light()} />
              </>
            ) : null}

            {step === "pending" ? (
              <>
                {!notified ? <Button label="Notify Me" onPress={() => { haptics.soft(); setNotified(true); }} /> : null}
                <GhostAction
                  label="Check Status"
                  onPress={() => {
                    haptics.light();
                    setStatusNote("Still with the vetting team. Nothing needed from you right now.");
                  }}
                />
                <GhostAction label="Continue to Command Center" onPress={() => router.replace("/(tabs)")} />
              </>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <FrostedTray
        visible={customizeOpen}
        title="Customize columns"
        subtitle="Rename the labels on your inventory rows. This only changes what you see."
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
  flex: { flex: 1 },
  progressWrap: {
    gap: 8,
    paddingHorizontal: layout.screen,
    paddingTop: 12,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
  },
  progressLabel: { ...type.sectionLabel, color: palette.mutedInk, fontSize: 10, lineHeight: 13 },
  progressLabelDeep: { color: onDark.textMuted },
  progressTrack: { height: 2, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: 2, backgroundColor: palette.ochre },
  scroll: {
    flexGrow: 1,
    gap: layout.gutter,
    paddingHorizontal: layout.screen,
    paddingTop: layout.base * 3,
    paddingBottom: layout.base * 3,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
  },
  centered: { alignItems: "center", justifyContent: "center" },
  spaza: { position: "absolute", right: -24, top: -8, opacity: 0.9 },
  statement: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.68, color: palette.ink, marginTop: 140 },
  statementBody: { ...type.body, color: palette.mutedInk, maxWidth: 420 },
  fields: { gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47%",
    minHeight: 72,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: palette.sandLine,
    backgroundColor: palette.paperRaised,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  tileSelected: { backgroundColor: ramp.ochre[100], borderWidth: 1, borderColor: palette.ochre },
  tileText: { ...type.body, color: palette.ink },
  tileTextSelected: { fontFamily: fontFamily.sansMedium, color: ramp.ochre[700] },
  toggleCard: { flexDirection: "row", alignItems: "center", gap: 16 },
  toggleCopy: { flex: 1, gap: 4 },
  toggleTitle: { ...type.body, color: palette.ink },
  toggleHelper: { ...type.helper, color: palette.mutedInk },
  railBlock: { gap: 10 },
  blockLabel: { ...type.sectionLabel, color: palette.mutedInk },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rows: { gap: 16 },
  rowCard: { gap: 14 },
  rowHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowIndex: { ...type.sectionLabel, color: palette.mutedInk },
  rowRemove: { ...type.helper, color: palette.burgundy },
  rowPrices: { flexDirection: "row", gap: 12 },
  rowPrice: { flex: 1 },
  inlineNote: { ...type.helper, color: palette.mutedInk, textAlign: "center" },
  errorCard: { padding: 14, borderColor: palette.burgundy },
  errorText: { ...type.helper, color: palette.burgundy },
  deepTitle: { ...type.title, color: onDark.text, textAlign: "center" },
  deepBody: { ...type.body, color: onDark.textMuted, textAlign: "center", maxWidth: 340 },
  deepNote: { ...type.helper, color: onDark.textFaint, textAlign: "center", maxWidth: 340 },
  otp: { width: "100%", maxWidth: 300, marginTop: 8 },
  noticeCard: { padding: 16, borderColor: onDark.hairlineStrong },
  noticeText: { ...type.helper, color: onDark.text },
  footer: {
    gap: 4,
    paddingHorizontal: layout.screen,
    paddingBottom: layout.safeBottom,
    borderTopWidth: 1,
    borderTopColor: onLight.hairlineSoft,
    paddingTop: 12,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
    backgroundColor: palette.paper,
  },
  footerDeep: { backgroundColor: palette.deepLedger, borderTopColor: onDark.hairline },
});

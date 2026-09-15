import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { FieldWell } from "@/components/ui/field-well";
import { GhostAction } from "@/components/ui/ghost-action";
import { RaisedCard } from "@/components/ui/raised-card";
import { SegmentedRail } from "@/components/ui/segmented-rail";
import { SignalPill } from "@/components/ui/signal-pill";
import { formatPhone, fontFamily, layout, palette, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

type AuthMode = "login" | "register";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  const { setSession } = useSession();
  const haptics = useHaptics();
  const login = trpc.auth.login.useMutation();

  const onSubmit = async () => {
    if (!identifier.trim() || !password) {
      haptics.rigid();
      setError("Enter your phone number or email and your password.");
      return;
    }
    setError(undefined);
    try {
      const result = await login.mutateAsync({ identifier: identifier.trim(), password });
      await setSession(result.token, result.user, (result.business as never) ?? null);
      router.replace("/(tabs)");
    } catch (cause) {
      haptics.rigid();
      setError(cause instanceof Error ? cause.message : "We couldn't sign you in. Please try again.");
    }
  };

  const preview = identifier.trim().length > 6 ? formatPhone(identifier) : undefined;

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <Text style={styles.wordmark}>Elav8</Text>
            <SignalPill label="3-day trial" tone="ochre" />
          </View>

          <View style={styles.heading}>
            <Text style={styles.greeting}>Welcome back.</Text>
            <Text style={styles.sub}>
              {mode === "login"
                ? "Sign in to your Command Center."
                : "Set up a business account — it takes a few minutes."}
            </Text>
          </View>

          <SegmentedRail
            value={mode}
            onChange={setMode}
            options={[
              { label: "Log In", value: "login" },
              { label: "Register", value: "register" },
            ]}
          />

          {mode === "login" ? (
            <View style={styles.form}>
              <FieldWell
                label="Phone or email"
                placeholder="+27 82 123 4567"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
                helper={preview}
              />
              <FieldWell
                label="Password"
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? (
                <RaisedCard style={styles.errorCard}>
                  <Text style={styles.errorText}>⚑ {error}</Text>
                </RaisedCard>
              ) : null}
            </View>
          ) : (
            <RaisedCard style={styles.registerCard}>
              <Text style={styles.registerTitle}>New here?</Text>
              <Text style={styles.registerBody}>
                Registration walks through your details, your industry, what you sell, and consent — then verifies your
                number.
              </Text>
              <Text style={styles.registerNote}>R10 a day once your trial ends. Weekends are free.</Text>
            </RaisedCard>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {mode === "login" ? (
            <>
              <Button label="Log In" onPress={onSubmit} loading={login.isPending} />
              <GhostAction label="Forgot password?" onPress={() => router.push("/(auth)/recover")} />
            </>
          ) : (
            <>
              <Button label="Create a Business Account" onPress={() => router.push("/onboarding")} />
              <GhostAction label="Back to Log In" onPress={() => setMode("login")} />
            </>
          )}
          <Text style={styles.trust}>Private by design — your data stays with your business.</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    gap: layout.gutter,
    paddingHorizontal: layout.screen,
    paddingTop: layout.base * 2,
    paddingBottom: layout.base * 2,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
  },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { ...type.wordmark, fontFamily: fontFamily.display, color: palette.ink },
  heading: { gap: 8 },
  greeting: { fontFamily: fontFamily.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: palette.ink },
  sub: { ...type.body, color: palette.mutedInk },
  form: { gap: 16 },
  errorCard: { padding: 14 },
  errorText: { ...type.helper, color: palette.burgundy },
  registerCard: { gap: 10 },
  registerTitle: { ...type.title, fontSize: 18, lineHeight: 24, color: palette.ink },
  registerBody: { ...type.body, color: palette.mutedInk },
  registerNote: { ...type.helper, color: palette.mutedInk },
  footer: {
    gap: 8,
    paddingHorizontal: layout.screen,
    paddingBottom: layout.safeBottom,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
  },
  trust: { ...type.helper, color: palette.mutedInk, textAlign: "center", marginTop: 4 },
});

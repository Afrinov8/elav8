import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkylineBackground } from "@/components/skyline-background";
import { LedgerInput } from "@/components/ui/ledger-input";
import { Button } from "@/components/ui/button";
import { palette } from "@/constants/theme";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = useSession();
  const login = trpc.auth.login.useMutation();

  const onSubmit = async () => {
    if (!identifier.trim() || !password) return;
    try {
      const result = await login.mutateAsync({ identifier: identifier.trim(), password });
      await setSession(result.token, result.user, (result.business as any) ?? null);
      router.replace("/(tabs)");
    } catch {
      // error surfaced via login.error below
    }
  };

  return (
    <SkylineBackground>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.brandRow}>
              <Text style={styles.brand}>Elav8</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>3-day trial</Text>
              </View>
            </View>

            <View style={styles.spacer} />

            <View style={styles.card}>
              <Text style={styles.title}>Welcome back.</Text>
              <Text style={styles.subtitle}>Log in to your Command Center.</Text>

              <View style={styles.form}>
                <LedgerInput
                  label="Phone Number or Email"
                  placeholder="you@example.com"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <LedgerInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={login.error?.message}
                />
                <Pressable onPress={() => {}}>
                  <Text style={styles.link}>Forgot Password?</Text>
                </Pressable>
              </View>

              <Button label="Log In" onPress={onSubmit} loading={login.isPending} />

              <Pressable onPress={() => router.push("/(auth)/welcome")} style={styles.bottomLink}>
                <Text style={styles.mutedText}>
                  New here? <Text style={styles.link}>Create a Business Account</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SkylineBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "flex-end", padding: 24, paddingBottom: 28 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: palette.white, fontSize: 22, fontFamily: "Fraunces_700Bold", letterSpacing: -0.5 },
  pill: { backgroundColor: "rgba(247,241,231,0.16)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { color: palette.white, fontSize: 12, fontFamily: "SpaceGrotesk_500Medium" },
  spacer: { flex: 1, minHeight: 40 },
  card: {
    backgroundColor: "rgba(255,253,249,0.94)",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(217,204,184,0.6)",
    gap: 4,
  },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 24, color: palette.ink },
  subtitle: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 15, color: palette.mutedInk, marginBottom: 12 },
  form: { gap: 2, marginTop: 4 },
  link: { color: palette.teal, fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  mutedText: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 14 },
  bottomLink: { alignItems: "center", marginTop: 16 },
});

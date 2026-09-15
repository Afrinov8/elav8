import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { ApertureRing } from "@/components/ui/aperture-ring";
import { Button } from "@/components/ui/button";
import { FieldWell } from "@/components/ui/field-well";
import { GhostAction } from "@/components/ui/ghost-action";
import { OtpWell } from "@/components/ui/otp-well";
import { formatPhone, layout, onDark, palette, type } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";

/**
 * Forgot Password → Verify and Reset. The recovery code is a demo code: no SMS
 * provider is connected, and the screen says so (design.md → prototype honesty).
 */
export default function RecoverScreen() {
  const [phase, setPhase] = useState<"request" | "reset">("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const haptics = useHaptics();

  const revealed = code.length === 4;
  const mismatch = revealed && confirm.length > 0 && password !== confirm;

  if (phase === "request") {
    return (
      <ScreenContainer padded={false}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.greeting}>Forgot your password?</Text>
          <Text style={styles.sub}>
            Enter the phone number on your account and we&apos;ll send a four-digit recovery code.
          </Text>
          <FieldWell
            label="Phone number"
            placeholder="+27 82 123 4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            helper={phone.length > 6 ? `Code will go to ${formatPhone(phone)}` : undefined}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Send recovery code"
            tone="teal"
            disabled={phone.trim().length < 6}
            onPress={() => {
              haptics.light();
              setPhase("reset");
            }}
          />
          <GhostAction label="Back to Log In" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer tone="deep" padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, styles.centered]} keyboardShouldPersistTaps="handled">
          <ApertureRing
            progress={code.length / 4}
            size={132}
            color={palette.teal}
            glow={onDark.tealGlow}
            label={revealed ? "OK" : `${code.length}/4`}
            caption={revealed ? "Code ready" : "Enter code"}
          />
          <Text style={styles.deepTitle}>Verify and reset.</Text>
          <Text style={styles.deepSub}>We sent a four-digit code to {formatPhone(phone)}.</Text>

          <View style={styles.otp}>
            <OtpWell value={code} onChange={setCode} autoFocus />
          </View>
          <Text style={styles.deepNote}>
            Demo code — any four digits work. SMS delivery isn&apos;t connected in this build.
          </Text>

          {revealed ? (
            <Animated.View entering={FadeIn.duration(180)} style={styles.reveal}>
              <FieldWell
                tone="deep"
                label="New password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <FieldWell
                tone="deep"
                label="Confirm password"
                placeholder="Type it again"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                error={mismatch ? "Those passwords don't match yet." : undefined}
              />
            </Animated.View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Reset password"
            tone="teal"
            disabled={!revealed || password.length < 6 || mismatch}
            onPress={() => {
              haptics.success();
              router.replace("/(auth)/login");
            }}
          />
          <GhostAction label="Verify via WhatsApp" onPress={() => haptics.light()} />
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
  centered: { alignItems: "center", justifyContent: "center" },
  greeting: { ...type.title, color: palette.ink },
  sub: { ...type.body, color: palette.mutedInk },
  deepTitle: { ...type.title, color: onDark.text, textAlign: "center" },
  deepSub: { ...type.body, color: onDark.textMuted, textAlign: "center", marginTop: -8 },
  otp: { width: "100%", maxWidth: 320, marginTop: 8 },
  deepNote: { ...type.helper, color: onDark.textFaint, textAlign: "center" },
  reveal: { width: "100%", gap: 16, marginTop: 8 },
  footer: {
    gap: 8,
    paddingHorizontal: layout.screen,
    paddingBottom: layout.safeBottom,
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
  },
});

import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { palette, radius } from "@/constants/theme";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { business, user, logout } = useSession();
  const utils = trpc.useUtils();
  const privacy = trpc.business.getPrivacy.useQuery();
  const updatePrivacy = trpc.business.updatePrivacy.useMutation({
    onSuccess: () => utils.business.getPrivacy.invalidate(),
  });
  const [notice, setNotice] = useState("");

  const initials = (business?.name ?? "EL")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="PROFILE" title="Your business, your rules." subtitle="Keep control of the way Elav8 works for you." />

        <Card>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.business}>{business?.name ?? "Your business"}</Text>
              <Text style={styles.detail}>
                {business?.industry ?? "—"} · {user?.fullName ?? ""}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.setting}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>SMS updates</Text>
              <Text style={styles.detail}>Reminders and account notifications</Text>
            </View>
            <Toggle
              value={privacy.data?.smsConsent ?? false}
              onValueChange={(v) => updatePrivacy.mutate({ smsConsent: v })}
            />
          </View>
          <View style={styles.setting}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Anonymized data sharing</Text>
              <Text style={styles.detail}>Optional market insights contribution</Text>
            </View>
            <Toggle
              value={privacy.data?.dataSharing ?? false}
              onValueChange={(v) => updatePrivacy.mutate({ dataSharing: v })}
            />
          </View>
        </Card>

        <View style={styles.actions}>
          <Pressable onPress={() => setNotice("Your data export is being prepared. We'll notify you when it's ready.")}>
            <Text style={styles.tealAction}>Download my data</Text>
          </Pressable>
          <Pressable onPress={() => setNotice("Deletion requests are reviewed by our team before they're actioned.")}>
            <Text style={styles.mutedAction}>Delete my data</Text>
          </Pressable>
        </View>

        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        <Pressable onPress={onLogout} style={styles.logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.privacy}>Elav8 is a growth tool, not a surveillance tool. Location and sharing are opt-in.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 20, paddingBottom: 32 },
  identity: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#E9D5B5", justifyContent: "center", alignItems: "center" },
  avatarText: { color: palette.ink, fontFamily: "SpaceGrotesk_700Bold" },
  business: { color: palette.ink, fontFamily: "Fraunces_700Bold", fontSize: 16 },
  detail: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, marginTop: 3 },
  divider: { height: 1, backgroundColor: palette.sandLine, marginVertical: 16 },
  setting: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  settingCopy: { flex: 1, gap: 2 },
  settingTitle: { color: palette.ink, fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  actions: { gap: 16 },
  tealAction: { color: palette.teal, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
  mutedAction: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  notice: { backgroundColor: "#EAF2EA", borderRadius: radius.md, padding: 12 },
  noticeText: { color: palette.teal, fontFamily: "SpaceGrotesk_400Regular", fontSize: 13, lineHeight: 18 },
  logout: { alignItems: "center", marginTop: 4 },
  logoutText: { color: palette.burgundy, fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  privacy: { color: palette.mutedInk, fontFamily: "SpaceGrotesk_400Regular", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 8 },
});

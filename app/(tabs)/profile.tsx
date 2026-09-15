import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { GhostAction } from "@/components/ui/ghost-action";
import { RaisedCard } from "@/components/ui/raised-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toggle } from "@/components/ui/toggle";
import { fontFamily, formatPhone, layout, onLight, palette, ramp, radius, type } from "@/constants/theme";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-context";
import { usePrefs } from "@/lib/prefs";

export default function ProfileScreen() {
  const { business, user, logout } = useSession();
  const { prefs, setPref } = usePrefs();
  const utils = trpc.useUtils();
  const privacy = trpc.business.getPrivacy.useQuery();
  const updatePrivacy = trpc.business.updatePrivacy.useMutation({
    onSuccess: () => utils.business.getPrivacy.invalidate(),
  });
  const [notice, setNotice] = useState<string | null>(null);

  const initials = (business?.name ?? "EL")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          eyebrow="Profile"
          title="Your business, your rules."
          subtitle="Everything here is yours to change, and none of it is shared without your say-so."
        />

        <RaisedCard style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.business} numberOfLines={1}>
              {business?.name ?? "Your business"}
            </Text>
            <Text style={styles.detail}>
              {business?.industry ?? "—"}
              {user?.fullName ? ` · ${user.fullName}` : ""}
            </Text>
            {user?.phone ? <Text style={styles.detail}>{formatPhone(user.phone)}</Text> : null}
          </View>
        </RaisedCard>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Business settings</Text>
          <RaisedCard style={styles.groupCard}>
            <SettingRow
              title="SMS updates"
              helper="Reminders and account notices by text."
              value={privacy.data?.smsConsent ?? false}
              onChange={(value) => updatePrivacy.mutate({ smsConsent: value })}
              last={false}
            />
            <SettingRow
              title="Anonymised market insights"
              helper="Optional. Counts and categories only, never names."
              value={privacy.data?.dataSharing ?? false}
              onChange={(value) => updatePrivacy.mutate({ dataSharing: value })}
              last
            />
          </RaisedCard>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Privacy preferences</Text>
          <RaisedCard style={styles.groupCard}>
            <SettingRow
              title="Reduce motion"
              helper="Collapses petal unfold, tray slides and screen transitions."
              value={prefs.reducedMotion}
              onChange={(value) => setPref("reducedMotion", value)}
              last={false}
            />
            <SettingRow
              title="Haptics"
              helper="Short taps and confirmation pulses on supported phones."
              value={prefs.hapticEnabled}
              onChange={(value) => setPref("hapticEnabled", value)}
              last
            />
          </RaisedCard>

          <View style={styles.actions}>
            <GhostAction
              label="Download my data"
              align="start"
              onPress={() =>
                setNotice(
                  "Export isn't connected yet — the button is here so you know it's coming. Your records live in your own database.",
                )
              }
            />
            <GhostAction
              label="Delete my data"
              align="start"
              tone="muted"
              onPress={() =>
                setNotice("Deletion needs a real approval step, so nothing is removed from this build. Ask us when you're ready.")
              }
            />
          </View>
        </View>

        {notice ? (
          <RaisedCard style={styles.noticeCard}>
            <Text style={styles.noticeText}>{notice}</Text>
          </RaisedCard>
        ) : null}

        <GhostAction
          label="Log out"
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        />

        <Text style={styles.footnote}>
          Elav8 is a growth tool, not a surveillance tool. Location and sharing stay off unless you switch them on.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({
  title,
  helper,
  value,
  onChange,
  last,
}: {
  title: string;
  helper: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last: boolean;
}) {
  return (
    <View style={[styles.setting, !last && styles.settingDivider]}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingHelper}>{helper}</Text>
      </View>
      <Toggle value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: layout.gutter, paddingBottom: layout.base * 4 },
  identity: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ramp.ochre[100],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 24, color: ramp.ochre[700] },
  identityCopy: { flex: 1, gap: 3 },
  business: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 26, color: palette.ink },
  detail: { ...type.helper, color: palette.mutedInk },
  group: { gap: 12 },
  groupLabel: { ...type.sectionLabel, color: palette.mutedInk },
  groupCard: { paddingVertical: 4, paddingHorizontal: 20 },
  setting: { flexDirection: "row", alignItems: "center", gap: 16, minHeight: 64 },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: onLight.hairlineSoft },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { ...type.body, color: palette.ink },
  settingHelper: { ...type.helper, fontSize: 12, lineHeight: 16, color: palette.mutedInk },
  actions: { gap: 4, alignItems: "flex-start" },
  noticeCard: { padding: 16, borderRadius: radius.card, borderColor: onLight.hairline },
  noticeText: { ...type.helper, color: palette.ink },
  footnote: { ...type.helper, color: palette.mutedInk, textAlign: "center" },
});

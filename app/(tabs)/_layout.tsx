import { Redirect, Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SkylineSplash, useSplashGate } from "@/components/skyline-splash";
import { TabIcon, type TabIconName } from "@/components/ui/tab-icon";
import { control, layout, palette, type as typeScale } from "@/constants/theme";
import { useHaptics } from "@/lib/haptics";
import { useSession } from "@/lib/auth-context";

const TABS: Record<string, { label: string; icon: TabIconName }> = {
  index: { label: "Command Center", icon: "command" },
  inventory: { label: "Inventory", icon: "inventory" },
  money: { label: "Money", icon: "money" },
  profile: { label: "Profile", icon: "profile" },
};

/** Quiet Tab Bar — 64dp, hairline top border, no drop shadow. */
function QuietTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const bottom = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, { height: control.tabBar + bottom, paddingBottom: bottom }]}>
      {state.routes.map((route, index) => {
        const meta = TABS[route.name] ?? { label: route.name, icon: "command" as TabIconName };
        const focused = state.index === index;
        const options = descriptors[route.key].options;

        const onPress = () => {
          haptics.selection();
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? meta.label}
          >
            <View style={[styles.dot, focused && styles.dotActive]} />
            <TabIcon name={meta.icon} color={focused ? palette.ink : "rgba(118,110,100,0.9)"} />
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { status } = useSession();
  const showSplash = useSplashGate(status !== "loading");

  if (status === "loading" || showSplash) {
    return <SkylineSplash />;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs tabBar={(props) => <QuietTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.paper } }}>
      {Object.keys(TABS).map((name) => (
        <Tabs.Screen key={name} name={name} options={{ title: TABS[name].label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 8,
    backgroundColor: palette.paper,
    borderTopWidth: 1,
    borderTopColor: palette.sandLine,
    paddingHorizontal: layout.base,
  },
  item: { flex: 1, minHeight: control.minTouch, alignItems: "center", justifyContent: "flex-start", gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "transparent", marginBottom: 2 },
  dotActive: { backgroundColor: palette.ochre },
  label: { ...typeScale.helper, fontSize: 11, lineHeight: 14, color: "rgba(118,110,100,0.9)" },
  labelActive: { color: palette.ink },
});

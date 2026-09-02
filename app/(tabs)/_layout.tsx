import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { palette } from "@/constants/theme";
import { useSession } from "@/lib/auth-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { status } = useSession();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: palette.paper, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={palette.ochre} />
      </View>
    );
  }

  if (status === "unauthenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ochre,
        tabBarInactiveTintColor: palette.mutedInk,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 11 },
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: 64 + bottomPadding,
          backgroundColor: palette.paper,
          borderTopColor: palette.sandLine,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol size={20} name="house.fill" color={color} /> }}
      />
      <Tabs.Screen
        name="inventory"
        options={{ title: "Inventory", tabBarIcon: ({ color }) => <IconSymbol size={20} name="shippingbox.fill" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <IconSymbol size={20} name="person.crop.circle.fill" color={color} /> }}
      />
    </Tabs>
  );
}

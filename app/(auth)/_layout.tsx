import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { palette } from "@/constants/theme";
import { useSession } from "@/lib/auth-context";

export default function AuthLayout() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: palette.paper, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={palette.ochre} />
      </View>
    );
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

import { Redirect, Stack } from "expo-router";

import { SkylineSplash, useSplashGate } from "@/components/skyline-splash";
import { motion } from "@/constants/theme";
import { useSession } from "@/lib/auth-context";

export default function AuthLayout() {
  const { status } = useSession();
  const showSplash = useSplashGate(status !== "loading");

  if (status === "loading" || showSplash) {
    return <SkylineSplash />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: motion.fadeThrough,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="recover" />
    </Stack>
  );
}

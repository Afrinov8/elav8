import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkylineBackground } from "@/components/skyline-background";
import { Button } from "@/components/ui/button";
import { OrbitIcon } from "@/components/ui/orbit-icon";
import { palette } from "@/constants/theme";

export default function WelcomeScreen() {
  return (
    <SkylineBackground variant="alt">
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back to Login</Text>
          </Pressable>

          <View style={styles.spacer} />

          <View style={styles.copyBlock}>
            <OrbitIcon size={32} />
            <Text style={styles.title}>Run your business{"\n"}from your phone.</Text>
            <Text style={styles.subtitle}>R10/day. Weekend free. 3-day trial.</Text>
            <Text style={styles.body}>
              Track sales, stock and invoices without a laptop, a shop system, or a subscription
              you have to think about. Elav8 stays on your side — private by design.
            </Text>
          </View>

          <Button label="Start" onPress={() => router.push("/(auth)/signup")} />
        </ScrollView>
      </SafeAreaView>
    </SkylineBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 28 },
  back: { alignSelf: "flex-start" },
  backText: { color: "rgba(247,241,231,0.85)", fontFamily: "SpaceGrotesk_500Medium", fontSize: 14 },
  spacer: { flex: 1, minHeight: 24 },
  copyBlock: { gap: 14, marginBottom: 28 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 30, lineHeight: 36, color: palette.white },
  subtitle: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 15, color: "#E9D5B5" },
  body: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 14, lineHeight: 21, color: "rgba(247,241,231,0.82)" },
});

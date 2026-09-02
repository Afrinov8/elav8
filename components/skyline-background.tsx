import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const SKYLINE_DUSK = require("@/assets/images/skyline-dusk.jpg") as ImageSourcePropType;
const SKYLINE_DUSK_ALT = require("@/assets/images/skyline-dusk-alt.jpg") as ImageSourcePropType;

/**
 * Atmospheric skyline treatment shared by Splash and Login: photo, warm
 * duotone-ish gradient wash, and a light frosted layer — "paper-glass", not
 * iOS-clone glass. Never used at full opacity/clarity on its own.
 */
export function SkylineBackground({
  variant = "primary",
  frosted = false,
  children,
}: {
  variant?: "primary" | "alt";
  frosted?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={variant === "alt" ? SKYLINE_DUSK_ALT : SKYLINE_DUSK}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(36,33,29,0.55)", "rgba(194,138,61,0.22)", "rgba(24,22,19,0.82)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {frosted ? <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} /> : null}
      {children}
    </View>
  );
}

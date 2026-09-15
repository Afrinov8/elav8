import { StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { layout, palette } from "@/constants/theme";
import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * Base surface. A screen never mixes both: onboarding, forms, Inventory and
   * Profile live on Paper; Skyline Splash, Verification and Command Center
   * live on Deep Ledger (design.md → surface pairing rules).
   */
  tone?: "paper" | "deep";
  /** SafeArea edges to apply. Bottom is handled by the Quiet Tab Bar. */
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
  /** Horizontal padding. Defaults to the 24dp gutter rhythm. */
  padded?: boolean;
}

export function ScreenContainer({
  tone = "paper",
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  padded = true,
  style,
  ...props
}: ScreenContainerProps) {
  const deep = tone === "deep";
  return (
    <View
      className={cn("flex-1", containerClassName)}
      style={{ backgroundColor: deep ? palette.deepLedger : palette.paper }}
      {...props}
    >
      <StatusBar style={deep ? "light" : "dark"} />
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={[styles.content, padded && { paddingHorizontal: layout.screen }, style]}
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" },
});

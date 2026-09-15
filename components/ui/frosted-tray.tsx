import { useEffect } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { layout, motion, onDark, onLight, palette, radius, type } from "@/constants/theme";

/**
 * Frosted Tray — depth level 2. Blurs the surface beneath so context is never
 * fully lost: 36×4dp Sand capsule handle 12dp from the top edge, scrolling
 * content above a fixed action row.
 */
export function FrostedTray({
  visible,
  title,
  subtitle,
  onClose,
  children,
  actions,
  tone = "paper",
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "paper" | "deep";
}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: reducedMotion ? motion.reduced : motion.trayPresent,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
  }, [visible, progress, reducedMotion]);

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reducedMotion ? 0 : interpolate(progress.value, [0, 1], [360, 0]) }],
    opacity: progress.value,
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const deep = tone === "deep";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: onLight.scrim }]}
            onPress={onClose}
            accessibilityLabel="Close"
          />
        </Animated.View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.tray,
              deep
                ? { borderColor: onDark.hairline, backgroundColor: "rgba(35,32,25,0.86)" }
                : { borderColor: onLight.hairline, backgroundColor: "rgba(253,250,244,0.82)" },
              trayStyle,
            ]}
          >
            <BlurView
              intensity={deep ? 40 : 60}
              tint={deep ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[styles.handle, { backgroundColor: deep ? onDark.hairlineStrong : palette.sandLine }]} />

            <View style={styles.header}>
              <Text style={[styles.title, deep && styles.titleDeep]}>{title}</Text>
              {subtitle ? <Text style={[styles.subtitle, deep && styles.subtitleDeep]}>{subtitle}</Text> : null}
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  tray: {
    borderTopLeftRadius: radius.tray,
    borderTopRightRadius: radius.tray,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 20,
    paddingHorizontal: layout.screen,
    paddingBottom: layout.safeBottom,
    overflow: "hidden",
    maxHeight: "88%",
    shadowColor: "#24211D",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 24 },
    elevation: 24,
  },
  handle: { width: 36, height: 4, borderRadius: 999, alignSelf: "center", marginTop: -8, marginBottom: 16 },
  header: { gap: 6, marginBottom: 16 },
  title: { ...type.title, fontSize: 20, lineHeight: 26, color: palette.ink },
  titleDeep: { color: onDark.text },
  subtitle: { ...type.helper, color: palette.mutedInk },
  subtitleDeep: { color: onDark.textMuted },
  scroll: { flexGrow: 0 },
  scrollContent: { gap: 4, paddingBottom: 8 },
  actions: { gap: 8, paddingTop: 16 },
});

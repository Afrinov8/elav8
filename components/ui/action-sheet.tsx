import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { palette, radius } from "@/constants/theme";

export function ActionSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(36,33,29,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: palette.paper,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    padding: 22,
    paddingBottom: 32,
    gap: 12,
  },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 20, color: palette.ink, marginBottom: 4 },
});

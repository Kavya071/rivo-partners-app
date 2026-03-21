import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { setWhatsAppPref, WhatsAppType } from "@/lib/whatsapp";
import Icon from "@/components/Icon";

interface WhatsAppPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: WhatsAppType) => void;
}

export default function WhatsAppPickerSheet({
  visible,
  onClose,
  onSelect,
}: WhatsAppPickerSheetProps) {
  const insets = useSafeAreaInsets();

  const handleSelect = async (type: WhatsAppType) => {
    await setWhatsAppPref(type);
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View />
      </Pressable>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />

        <Text style={styles.title}>Continue with WhatsApp</Text>
        <Text style={styles.subtitle}>Select your preferred account.</Text>

        <View style={styles.optionsRow}>
          <Pressable
            onPress={() => handleSelect("personal")}
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name="logo-whatsapp" size={32} color="#fff" />
            </View>
            <Text style={styles.optionLabel}>Personal</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelect("business")}
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name="logo-whatsapp" size={32} color="#fff" />
              <View style={styles.businessBadge}>
                <Text style={styles.businessBadgeText}>B</Text>
              </View>
            </View>
            <Text style={styles.optionLabel}>Business</Text>
          </Pressable>
        </View>

        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  optionPressed: {
    backgroundColor: Colors.border,
    borderColor: Colors.borderLight,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.whatsapp,
    justifyContent: "center",
    alignItems: "center",
  },
  businessBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.whatsapp,
  },
  businessBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Colors.whatsapp,
  },
  optionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textMuted,
  },
});

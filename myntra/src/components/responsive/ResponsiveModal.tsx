import React from "react";
import { Modal, StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme";

interface ResponsiveModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const { isTablet, scaleFont } = useResponsive();
  const { theme } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.card },
            isTablet ? styles.tabletDialog : styles.phoneFullScreen,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: scaleFont(18) }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.body}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  phoneFullScreen: {
    width: "100%",
    height: "100%",
  },
  tabletDialog: {
    width: "80%",
    maxWidth: 500,
    borderRadius: 12,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
});

export default ResponsiveModal;

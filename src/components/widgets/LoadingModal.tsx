import React from "react";
import { Modal, View, Text, ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import Toast from "react-native-toast-message";

interface LoadingModalProps {
  visible: boolean;
  message: string;
  backgroundStyle?: StyleProp<ViewStyle>;
}

export default function LoadingModal({ visible, message, backgroundStyle }: LoadingModalProps) {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center" style={backgroundStyle}>
        <View className="px-6 py-3.5 rounded-lg items-center justify-center shadow-md flex-row" style={{  backgroundColor: colors.accent }}>
          <ActivityIndicator size="small" color={colors.textOnAccent} />
          <Text className="text-base font-uber-move-medium tracking-wider ml-4" style={{ color: colors.textOnAccent }}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

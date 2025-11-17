import React from "react";
import { ScrollView, View, TouchableOpacity, Linking } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OnboardSocietyBottomSheetProps {
  onClose: () => void;
}

const OnboardSocietyBottomSheet: React.FC<OnboardSocietyBottomSheetProps> = ({
  onClose,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleContactPress = () => {
    // You can replace this with actual contact information
    // For example: Linking.openURL('mailto:contact@domus.com') or Linking.openURL('tel:+1234567890')
    Linking.openURL("mailto:contact@domus.com").catch((err) =>
      console.error("Failed to open email:", err)
    );
  };

  return (
    <ScrollView
      className="flex-1 max-h-[80vh]"
      style={{ paddingBottom: insets.bottom + 16, marginTop: 24 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="px-6">
        <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-6">
          Let's get in touch
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7 mb-4">
          Ready to bring Domus to your society? We're here to help make the
          transition smooth and seamless. Whether you're a resident, a
          management committee member, or a property manager, we'll work with
          you to get your society set up and running on Domus.
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7 mb-4">
          Our team will guide you through the entire onboarding process, from
          initial setup to training your team and residents. We'll ensure
          everything is configured just right for your society's unique needs.
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7 mb-6">
          Get in touch with us to start the conversation and bring modern,
          hassle-free society management to your community.
        </ThemedText>

        <TouchableOpacity
          onPress={handleContactPress}
          className="p-4 rounded-lg items-center"
          style={{
            backgroundColor: themedColors.buttonBackground,
          }}
        >
          <ThemedText
            className="text-base font-uber-move-medium tracking-wider"
            style={{ color: themedColors.buttonText }}
          >
            Contact Us
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default OnboardSocietyBottomSheet;


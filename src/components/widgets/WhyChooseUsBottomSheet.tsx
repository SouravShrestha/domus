import React from "react";
import { ScrollView, View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WhyChooseUsBottomSheetProps {
  onClose: () => void;
}

const WhyChooseUsBottomSheet: React.FC<WhyChooseUsBottomSheetProps> = ({
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 max-h-[80vh]"
      style={{ paddingBottom: insets.bottom + 16, marginTop: 24 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="px-6">
        <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-6">
          Why Domus?
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7 mb-4">
          Choosing the right society app shouldn't feel like a full-time job.
          Domus is built to make everyday living actually smooth — from joining
          your residence to staying connected with everything happening around
          you. No clutter, no weird menus, no 2000s-era UI. Just clean, fast,
          mobile-first features that respect your time.
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7 mb-4">
          You get instant access to your residence, crystal-clear communication,
          and tools that actually solve problems instead of creating new ones.
          Whether it's managing invites, verifying members, or keeping things
          organized, Domus handles it in the background so you can focus on
          living, not navigating apps.
        </ThemedText>

        <ThemedText className="text-base font-lato-regular tracking-wide leading-7">
          Bottom line: Domus is the society app that actually gets it.
        </ThemedText>
      </View>
    </ScrollView>
  );
};

export default WhyChooseUsBottomSheet;

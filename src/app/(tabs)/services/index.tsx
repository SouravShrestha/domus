import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, ThemedStatusBar } from "@themes/themedComponents";

const ServicesScreen: React.FC = () => {
  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ThemedText className="text-2xl font-uber-move-bold">Services</ThemedText>
          <ThemedText className="text-base font-uber-move text-secondary mt-2">
            Explore available services
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ServicesScreen;

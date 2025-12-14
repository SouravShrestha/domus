import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";

const Visitors: React.FC = () => {
  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-4">
          <ThemedText className="text-2xl font-uber-move-bold tracking-wider">
            Visitors
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default Visitors;

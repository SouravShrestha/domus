import React from "react";
import { View, Text, TouchableOpacity, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const EntryConfirmationScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const logId = params.logId as string;
  const visitorName = params.visitorName as string;
  const residenceName = params.residenceName as string;
  const flatNumber = params.flatNumber as string;
  const block = params.block as string;
  const tempPassCode = params.tempPassCode as string;

  const entryTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Visitor Pass Code: ${tempPassCode}\nVisitor: ${visitorName}\nResidence: ${residenceName} (${
          block ? `${block}-` : ""
        }${flatNumber})\nEntry Time: ${entryTime}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDone = () => {
    router.replace("/(guard)/(tabs)/scanner");
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Entry Confirmed
          </ThemedText>
        </View>

        <View className="flex-1 px-4 justify-center">
          {/* Success Icon */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: `${themedColors.accent}20` }}
            >
              <Ionicons
                name="checkmark"
                size={48}
                color={themedColors.accent}
              />
            </View>
          </View>

          {/* Visitor Details */}
          <View
            className="p-6 rounded-xl mb-6"
            style={{ backgroundColor: themedColors.card }}
          >
            <View className="mb-4">
              <Text
                className="text-sm font-lato-regular mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                Visitor Name
              </Text>
              <ThemedText className="text-lg font-uber-move-medium">
                {visitorName}
              </ThemedText>
            </View>

            <View className="mb-4">
              <Text
                className="text-sm font-lato-regular mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                Visiting
              </Text>
              <ThemedText className="text-lg font-uber-move-medium">
                {residenceName}
              </ThemedText>
              <Text
                className="text-sm font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                {block ? `Block ${block}, ` : ""}Flat {flatNumber}
              </Text>
            </View>

            <View>
              <Text
                className="text-sm font-lato-regular mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                Entry Time
              </Text>
              <ThemedText className="text-base font-uber-move-medium">
                {entryTime}
              </ThemedText>
            </View>
          </View>

          {/* Temporary Pass Code */}
          <View
            className="p-6 rounded-xl items-center"
            style={{ backgroundColor: themedColors.card }}
          >
            <Text
              className="text-sm font-lato-regular mb-4"
              style={{ color: themedColors.secondaryText }}
            >
              Temporary Pass Code
            </Text>

            {/* QR Code */}
            <View
              className="mb-4 p-4 rounded-xl"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <QRCode value={tempPassCode} size={200} />
            </View>

            {/* Pass Code Text */}
            <View
              className="px-6 py-3 rounded-lg"
              style={{ backgroundColor: themedColors.background }}
            >
              <Text
                className="text-2xl font-uber-move-bold tracking-widest"
                style={{ color: themedColors.text }}
              >
                {tempPassCode}
              </Text>
            </View>

            <Text
              className="text-xs font-lato-regular mt-4 text-center"
              style={{ color: themedColors.secondaryText }}
            >
              Valid for 24 hours • Use for exit tracking
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-4 pt-2">
          <TouchableOpacity
            onPress={handleShare}
            className="py-4 rounded-xl mb-3 border"
            style={{ borderColor: themedColors.border }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="share-outline"
                size={20}
                color={themedColors.text}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-base font-uber-move-medium"
                style={{ color: themedColors.text }}
              >
                Share Pass Code
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDone}
            className="py-4 rounded-xl"
            style={{ backgroundColor: themedColors.accent }}
            activeOpacity={0.8}
          >
            <Text
              className="text-center text-base font-uber-move-medium"
              style={{ color: themedColors.textOnAccent }}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default EntryConfirmationScreen;

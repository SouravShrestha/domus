import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import ScanIcon from "@components/icons/ScanIcon";
import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "@/constants/routes";

const GuardScannerHome: React.FC = () => {
  const { themedColors } = useTheme();
  const router = useRouter();

  const handleScan = () => {
    // TODO: Open camera for QR scanning
    console.log("Open scanner");
  };

  const handleManualEntry = () => {
    // TODO: Open manual code entry
    console.log("Manual entry");
  };

  const handleWalkInVisitor = () => {
    router.push(ROUTES.GUARD.SCREENS.WALK_IN.SEARCH_RESIDENCE);
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Security Gate
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            Scan visitor QR codes or enter codes manually
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          {/* Large Scan Button */}
          <TouchableOpacity
            onPress={handleScan}
            className="w-48 h-48 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: themedColors.accent }}
            activeOpacity={0.8}
          >
            <ScanIcon
              width={64}
              height={64}
              color={themedColors.textOnAccent}
            />
            <Text
              className="text-lg font-uber-move-medium mt-2"
              style={{ color: themedColors.textOnAccent }}
            >
              Scan QR
            </Text>
          </TouchableOpacity>

          {/* Manual Entry Button */}
          <TouchableOpacity
            onPress={handleManualEntry}
            className="px-6 py-3 rounded-full border mb-3"
            style={{ borderColor: themedColors.border }}
            activeOpacity={0.7}
          >
            <ThemedText className="text-base font-uber-move-medium">
              Enter Code Manually
            </ThemedText>
          </TouchableOpacity>

          {/* Walk-in Visitor Button */}
          <TouchableOpacity
            onPress={handleWalkInVisitor}
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: themedColors.card }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="person-add-outline"
                size={20}
                color={themedColors.text}
                style={{ marginRight: 8 }}
              />
              <ThemedText className="text-base font-uber-move-medium">
                Walk-in Visitor
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View
          className="mx-4 mb-4 p-4 rounded-xl"
          style={{ backgroundColor: themedColors.card }}
        >
          <ThemedText className="text-sm font-uber-move-medium mb-3">
            Today's Activity
          </ThemedText>
          <View className="flex-row justify-around">
            <View className="items-center">
              <ThemedText className="text-2xl font-uber-move-bold">
                0
              </ThemedText>
              <Text
                className="text-xs font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                Entries
              </Text>
            </View>
            <View className="items-center">
              <ThemedText className="text-2xl font-uber-move-bold">
                0
              </ThemedText>
              <Text
                className="text-xs font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                Exits
              </Text>
            </View>
            <View className="items-center">
              <ThemedText className="text-2xl font-uber-move-bold">
                0
              </ThemedText>
              <Text
                className="text-xs font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                Inside
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default GuardScannerHome;

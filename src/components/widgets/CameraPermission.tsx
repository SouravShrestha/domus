import { ThemedSafeAreaView, ThemedText, ThemedTextSecondary } from "@/themes/themedComponents";
import { Image } from "expo-image";
import React from "react";
import { Text, View, TouchableOpacity, StatusBar } from "react-native";
import CameraPermissionImage from "@images/camera-girl.png";
import { useTheme } from "@/contexts/themeContext";
import BackButton from "./BackButton";
import { router } from "expo-router/build/exports";
import basicColors from "@/themes/colors";

interface CameraPermissionProps {
    onRequestPermission: () => void;
    onCancel: () => void;
}

export default function CameraPermission({ onRequestPermission, onCancel }: CameraPermissionProps) {
    const { themedColors } = useTheme();
    return (
      <ThemedSafeAreaView className="flex-1">
        <StatusBar barStyle="default" animated />
        <View
          className="flex-row items-center justify-between w-12 ml-4 pt-2"
          style={{ transform: [{ rotate: "-0deg" }] }}
        >
          <BackButton onPress={() => router.back()} color={themedColors.text} />
        </View>
        <View className="flex-1 items-center  justify-center px-10">
          <View className="w-full items-center justify-around flex-1">
            <View className="items-center justify-center">
              <View
                className="w-64 h-64 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: themedColors.cardBackground }}
              >
                <Image
                  source={CameraPermissionImage}
                  className="w-48 h-48 absolute bottom-0 ml-2"
                />
              </View>
              <ThemedText className="text-2xl font-uber-move-medium tracking-wider text-center mt-12">
                Enable Camera
              </ThemedText>

              <ThemedTextSecondary className="text-center mt-3 px-2 font-lato-regular leading-6 tracking-wide text-base">
                Please provide us access to your camera, which is required for
                QR Pass scanning features.
              </ThemedTextSecondary>
            </View>

            <View className="w-full items-center justify-center">
              <TouchableOpacity
                onPress={onRequestPermission}
                activeOpacity={0.9}
                className="mt-6 w-full py-3 rounded-lg"
                style={{ backgroundColor: themedColors.buttonBackground }}
              >
                <Text
                  className="text-center font-uber-move-medium text-lg tracking-wide"
                  style={{ color: themedColors.buttonText }}
                >
                  Allow
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onCancel} className="mt-4">
                <ThemedTextSecondary className="text-base font-lato-regular wide">
                  Maybe later
                </ThemedTextSecondary>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedSafeAreaView>
    );
}

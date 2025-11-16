import React from "react";
import { View, Text, TouchableOpacity, Image, StatusBar } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ArrowIcon from "@components/icons/ArrowIcon";
import { themeColors } from "@themes/colors";
import { useTheme } from "@contexts/themeContext";
import splashIcon from "@assets/icons/splash-icon-light.png";
import { ROUTES } from "@constants/routes";

const Welcome: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const handleNavigation = (): void => {
    router.push(ROUTES.AUTH.PHONE);
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.splashBackground }}
    >
      <StatusBar barStyle="light-content" animated />

      <SafeAreaView
        className="flex-1 justify-end items-center"
        style={{ paddingTop: insets.top }}
      >
        {/* Splash Icon */}
        <View className="absolute flex-1 items-center justify-center top-1/2 left-0 right-0">
          <Image
            source={splashIcon}
            style={{ width: 200, height: 200, marginTop: -35 }}
            resizeMode="contain"
          />
        </View>

        {/* Get Started Button & Footer */}
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between rounded-full px-3 py-3.5 self-center mb-8 w-[55%]"
            onPress={handleNavigation}
            style={{ backgroundColor: themeColors.light.background }}
          >
            <View className="flex-1 items-center">
              <Text
                className="font-uber-move-medium tracking-wide text-base"
                style={{ color: themeColors.light.text }}
              >
                Get Started !
              </Text>
            </View>

            <View
              className="rounded-full absolute right-3"
              style={{
                width: 28,
                height: 28,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.splashBackground,
              }}
            >
              <View style={{ transform: [{ scaleX: -1 }] }} className="ml-1">
                <ArrowIcon width={20} height={20} stroke="white" />
              </View>
            </View>
          </TouchableOpacity>

          <Text
            className="text-xs text-center leading-7 mb-2 px-4 font-lato-regular"
            style={{ color: colors.secondaryTextOnPrimary }}
          >
            By continuing, you agree to our Terms & Policies.{"\n"}
            See how we use data in our Privacy Policy. We never share your data.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;

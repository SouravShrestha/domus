import React from "react";
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { ProfilePassDto } from "@/types/api/response/profilePass";
import WavyBorder from "@/components/widgets/WavyBorder";
import splashIcon from "@assets/icons/splash-icon-light.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32; // mx-4 = 16px on each side
const WAVE_AMPLITUDE = 3; // Height of the wave

interface ProfileTicketProps {
  profilePass: ProfilePassDto | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ProfileTicket: React.FC<ProfileTicketProps> = ({
  profilePass,
  onPress,
}) => {
  const { themedColors } = useTheme();

  if (!profilePass) {
    return null;
  }

  const TicketContent = (
    <View
      className="mx-4 rounded-2xl overflow-hidden border"
      style={{ borderColor: themedColors.border }}
    >
      <View
        className="px-4 flex-row items-center justify-center rounded-t-xl relative"
        style={{
          backgroundColor: themedColors.secondary,
          paddingTop: 16,
          paddingBottom: WAVE_AMPLITUDE * 2,
          minHeight: 112, // h-28 equivalent
        }}
      >
        <View className="items-center justify-center">
          <Image source={splashIcon} className="w-16 h-16" contentFit="contain" transition={300} />
        </View>

        {/* Wavy Border SVG */}
        <WavyBorder
          width={CARD_WIDTH}
          amplitude={WAVE_AMPLITUDE}
          frequency={0.1}
          fillColor={themedColors.ticketBackground}
        />
      </View>

      {/* Content Section */}
      <View
        className="px-5 py-4 rounded-b-xl"
        style={{ backgroundColor: themedColors.ticketBackground }}
      >
        <ThemedText
          className="text-lg font-uber-move-medium tracking-wider mb-2"
          style={{ color: themedColors.text }}
        >
          {profilePass.sharedData.name}
        </ThemedText>
        <ThemedText className="text-xs font-lato-regular tracking-wide mb-2">
          {profilePass.domusId}
        </ThemedText>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="w-full"
      >
        {TicketContent}
      </TouchableOpacity>
    );
  }

  return TicketContent;
};

export default ProfileTicket;

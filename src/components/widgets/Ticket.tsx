import React from "react";
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Text,
} from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { PassStatus } from "@/types/api/response/profilePass";
import colorMapping from "@/utils/themeColors";
import { CircleIcon } from "../icons";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface TicketProps {
  type?: string;
  title?: string;
  amount?: string;
  subtitle?: string;
  validUntil?: string;
  icon?: React.ReactNode;
  status?: PassStatus;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Ticket: React.FC<TicketProps> = ({
  type,
  title,
  subtitle,
  validUntil,
  icon,
  status,
  onPress,
}) => {
  const { themedColors } = useTheme();

  const TicketContent = (
    <View className="relative mx-4">
      <View
        className="rounded-xl overflow-visible relative pb-2 pt-2"
        style={{
          backgroundColor: themedColors.ticketBackground,
        }}
      >
        {/* Left notch - positioned outside */}
        <View
          className="absolute w-8 h-8 rounded-full -left-6 z-10 mt-4"
          style={{
            top: "50%",
            transform: [{ translateY: "-50%" }],
            backgroundColor: themedColors.background,
          }}
        />

        {/* Right notch - positioned outside */}
        <View
          className="absolute w-8 h-8 rounded-full -right-6 z-10 mt-4"
          style={{
            top: "50%",
            transform: [{ translateY: "-50%" }],
            backgroundColor: themedColors.background,
          }}
        />

        <View className="flex-row p-4 min-h-[120px]">
          {/* Left section - Icon/Logo */}
          <View className="w-[30%] justify-center items-center">{icon}</View>

          {/* Right section - Content */}
          <View className="flex-1 justify-start pl-3 mt-3">
            {subtitle && (
              <ThemedText
                className="text-xs font-lato-regular tracking-wide"
                style={{ color: themedColors.secondaryText }}
              >
                {subtitle}
              </ThemedText>
            )}
            {title && (
              <ThemedText
                className="text-lg font-uber-move-medium tracking-wider mt-1"
                style={{ color: themedColors.text }}
              >
                {title}
              </ThemedText>
            )}
            {validUntil && (
              <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider mt-2 mb-2">
                Verified until {validUntil}
              </ThemedTextSecondary>
            )}
          </View>
        </View>
      </View>
      {type && (
        <View
          className="h-16 rounded-b-xl items-end justify-end p-1 px-3.5 -mt-10 -z-10"
          style={{ backgroundColor: themedColors.accent + "20" }}
        >
          <Text
            className="text-xs font-uber-move-medium tracking-wider uppercase"
            style={{ color: themedColors.accent }}
          >
            {type}
          </Text>
        </View>
      )}
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

export default Ticket;

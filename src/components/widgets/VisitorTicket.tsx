import React from "react";
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Dimensions,
  Text,
} from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { MyVisitorPassDto } from "@/types/api/response/visitorPass";
import WavyBorder from "@/components/widgets/WavyBorder";
import { format } from "date-fns";
import { Residence } from "@/types/api/response/residence";
import { User } from "@/types/models/user";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32; // mx-4 = 16px on each side
const WAVE_AMPLITUDE = 3; // Height of the wave

interface VisitorTicketProps {
  visitorPass: MyVisitorPassDto;
  metadata: {
    visitorUser: User;
    invitedByUser: User;
    residence: Residence | null;
  } | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

const VisitorTicket: React.FC<VisitorTicketProps> = ({
  visitorPass,
  metadata,
  onPress,
  color = null,
}) => {
  const { themedColors } = useTheme();
  
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    try {
      return format(date, "dd MMM, yyyy");
    } catch {
      return "";
    }
  };

  const TicketContent = (
    <View
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: themedColors.border }}
    >
      <View
        className="flex-row items-center justify-center rounded-t-xl relative"
        style={{
          backgroundColor: color || themedColors.secondary,
          paddingTop: 16,
          paddingBottom: WAVE_AMPLITUDE * 2,
          minHeight: 112, // h-28 equivalent
        }}
      >
        <View className="items-center justify-center">
          <View className="rounded-xl items-center justify-center">
            <Text className="text-white text-2xl font-uber-move-bold tracking-widest">
              {metadata?.residence?.shortName || "?"}
            </Text>
          </View>
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
          className="text-base font-uber-move-medium tracking-wider mb-1 leading-6"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ color: themedColors.text, lineHeight: 24, height: 48 }}
        >
          {metadata?.residence?.society?.name}
        </ThemedText>
        <ThemedText className="text-sm font-lato-regular tracking-wide mb-1">
          {metadata?.residence?.shortName}
        </ThemedText>
        {visitorPass.visitor.expectedCheckInTime && (
          <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider mt-3">
            IN:{" "}
            {formatDate(new Date(visitorPass.visitor.expectedCheckInTime))}
          </ThemedTextSecondary>
        )}
        {visitorPass.visitor.expectedCheckOutTime && (
          <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider mt-1">
            OUT:{" "}
            {formatDate(new Date(visitorPass.visitor.expectedCheckOutTime))}
          </ThemedTextSecondary>
        )}
        {metadata?.invitedByUser && (
          <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider mt-4 self-end text-right leading-5">
            Invited by, {"\n"}
            {metadata?.invitedByUser?.name}
          </ThemedTextSecondary>
        )}
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

export default VisitorTicket;

import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import {
  SocietyContact,
  SocietyContactTypeLabels,
  SocietyContactTypeColors,
} from "@/types";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { getDefaultCategoryImageUrl } from "@/utils/categoryImages";

interface ContactCardProps {
  contact: SocietyContact;
  onPress?: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onPress }) => {
  const { themedColors } = useTheme();
  const typeColor = SocietyContactTypeColors[contact.type];
  const typeLabel = SocietyContactTypeLabels[contact.type];
  const imageUrl =
    contact.image_url || getDefaultCategoryImageUrl(contact.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg px-4 py-5 border"
      style={{
        borderColor: themedColors.lightBorder,
        backgroundColor: themedColors.cardBackground,
      }}
    >
      <View className="flex items-center">
        <View
          className="w-12 h-12 items-center justify-center overflow-hidden"
        >
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 48, height: 48 }}
            contentFit="cover"
            transition={200}
          />
        </View>

        <View className="flex-1 items-center mt-4">
          <ThemedText
            className="text-sm font-uber-move-medium"
            numberOfLines={1}
          >
            {contact.name}
          </ThemedText>
          <ThemedTextSecondary className="text-xs mt-0.5" numberOfLines={1}>
            {formatPhoneForDisplay(contact.phone)}
          </ThemedTextSecondary>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;

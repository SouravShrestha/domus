import React from "react";
import { View, TouchableOpacity, Linking, Alert, Image } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SocietyContact,
  SocietyContactTypeLabels,
  SocietyContactTypeColors,
} from "@/types";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { PhoneIcon, EditIcon } from "@/components/icons";

interface ContactBottomSheetProps {
  contact: SocietyContact | null;
  onEdit?: (contact: SocietyContact) => void;
  isLoading?: boolean;
}

const ContactBottomSheet: React.FC<ContactBottomSheetProps> = ({
  contact,
  onEdit,
  isLoading = false,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!contact) return null;

  const typeColor = SocietyContactTypeColors[contact.type];
  const typeLabel = SocietyContactTypeLabels[contact.type];

  const handleCall = () => {
    const phoneUrl = `tel:${contact.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Unable to make phone calls on this device");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to initiate call");
      });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(contact);
    }
  };

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-4">
          {contact.image_url ? (
            <Image
              source={{ uri: contact.image_url }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: typeColor + "15" }}
            />
          )}
          <View className="flex-1 ml-4">
            <ThemedText className="text-lg font-uber-move-medium tracking-wide">
              {contact.name}
            </ThemedText>
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
              {formatPhoneForDisplay(contact.phone)}
            </ThemedTextSecondary>
          </View>

          <View
            className="px-3 py-1.5 rounded-md"
            style={{ backgroundColor: typeColor + "20" }}
          >
            <ThemedText
              className="text-xs font-lato-medium"
              style={{ color: typeColor }}
            >
              {typeLabel}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row mt-6 gap-x-3">
          <TouchableOpacity
            onPress={handleCall}
            disabled={isLoading}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-md"
            style={{
              backgroundColor: themedColors.accent,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <PhoneIcon size={16} color={themedColors.textOnAccent} />
            <ThemedText
              className="text-sm font-uber-move-medium ml-2"
              style={{ color: themedColors.textOnAccent }}
            >
              Call
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEdit}
            disabled={isLoading}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-md"
            style={{
              backgroundColor: themedColors.buttonBackground,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <EditIcon width={16} height={16} color={themedColors.buttonText} />
            <ThemedText
              className="text-sm font-uber-move-medium ml-2"
              style={{ color: themedColors.buttonText }}
            >
              Edit
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ContactBottomSheet;

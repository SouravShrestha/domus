import React from "react";
import { View, TouchableOpacity, Linking, Alert } from "react-native";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SocietyContact,
  SocietyContactTypeLabels,
  SocietyContactTypeColors,
} from "@/types";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import {
  PhoneIcon,
  EditIcon,
  PencilIcon,
  PhoneCallIcon,
} from "@/components/icons";
import { Image } from "expo-image";
import basicColors from "@/themes/colors";

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
      <View className="px-8 pt-6">
        <View className="flex items-center mb-4">
          {contact.image_url ? (
            <Image
              source={{ uri: contact.image_url }}
              className="w-14 h-14"
              contentFit="cover"
            />
          ) : (
            <View
              className="w-14 h-14 rounded-md items-center justify-center mt-2"
              style={{ backgroundColor: typeColor + "15" }}
            />
          )}
          <View className="flex-1 mt-4 items-center">
            <ThemedText className="text-lg font-uber-move-medium tracking-wide">
              {contact.name}
            </ThemedText>
            <ThemedTextSecondary className="text-base font-uber-move-medium tracking-wider mt-0.5">
              {formatPhoneForDisplay(contact.phone)}
            </ThemedTextSecondary>
          </View>
        </View>

        <View className="flex-row-reverse mt-4 gap-x-3">
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
            <PhoneCallIcon
              width={16}
              height={16}
              color={themedColors.textOnAccent}
            />
            <ThemedText
              className="text-base font-uber-move-medium ml-2 tracking-wider"
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
              opacity: isLoading ? 0.6 : 1,
              borderColor: themedColors.text,
            }}
          >
            <View
              className="flex-row items-center border-b-[1.5px] pb-1 px-1"
              style={{ borderColor: themedColors.text }}
            >
              <PencilIcon width={16} height={16} color={themedColors.text} />
              <ThemedText
                className="text-base font-uber-move-medium ml-2 tracking-wider "
                style={{ color: themedColors.text }}
              >
                Edit
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ContactBottomSheet;

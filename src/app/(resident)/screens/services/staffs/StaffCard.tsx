import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { StaffWithAssignment, STAFF_CATEGORIES, StaffCategory } from "@/types/models/staff";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import basicColors from "@/themes/colors";
import {
    AvatarCook,
    AvatarDriver,
    AvatarNanny,
    AvatarMaid,
    AvatarStaff,
} from "@/assets/image-icons";
import { Image } from "expo-image";
import IconTagPill from "@/components/widgets/IconTagPill";

interface StaffCardProps {
    staff: StaffWithAssignment;
    onPress?: () => void;
    width?: number | string;
}

const getCategoryLabel = (category: string) => {
    return STAFF_CATEGORIES.find(c => c.value === category)?.label || category;
};

const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        maid: basicColors.lightPink,
        cook: basicColors.orange,
        driver: basicColors.blue,
        nanny: basicColors.lightPink,
        other: basicColors.gray,
    };
    return colors[category] || basicColors.gray;
};

const getCategoryAvatar = (category: StaffCategory) => {
    const avatars: Record<string, any> = {
        maid: AvatarMaid,
        cook: AvatarCook,
        driver: AvatarDriver,
        nanny: AvatarNanny,
    };
    return avatars[category] || AvatarStaff;
};

const StaffCard: React.FC<StaffCardProps> = ({ staff, onPress }) => {
    const { themedColors } = useTheme();
    const categoryColor = getCategoryColor(staff.category);
    const isAccessDisabled = staff.is_access_disabled || false;
    const isInactive = staff.assignment.status === "inactive" || isAccessDisabled;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="p-4 rounded-lg border mb-4"
        style={{
          backgroundColor: themedColors.cardBackground,
          borderColor: themedColors.lightBorder,
          width: "48%",
        }}
      >
        <View className="flex items-center justify-center">
          <Image
            source={
              staff.image_url
                ? { uri: staff.image_url }
                : getCategoryAvatar(staff.category)
            }
            style={{ width: 72, height: 72 }}
            resizeMode="cover"
          />
          <View className="flex-1 items-center mt-1">
            <View className="flex-row items-center">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wide flex-1 text-center"
                numberOfLines={1}
              >
                {staff.name}
              </ThemedText>
            </View>
            <ThemedTextSecondary
              className="text-sm font-uber-move-medium mt-0.5 tracking-wide"
              numberOfLines={1}
            >
              {formatPhoneForDisplay(staff.phone)}
            </ThemedTextSecondary>
            <View className="flex-row items-center mt-3">
              <IconTagPill
                iconKey={getCategoryLabel(staff.category).toLowerCase()}
                label={getCategoryLabel(staff.category)}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
};

export default StaffCard;

import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { avatarService } from "@api/services/avatar.service";
import { AvatarDto } from "@/types/api/response/avatar";
import { Gender } from "../../types/common/enums";
import LoadingOverlay from "./LoadingOverlay";

interface AvatarPickerModalProps {
  onSelect: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
  gender: Gender | string;
  isLoading?: boolean;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  onSelect,
  currentAvatarUrl,
  gender,
  isLoading: externalLoading,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const [avatars, setAvatars] = useState<AvatarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    currentAvatarUrl || null
  );

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        const genderForApi =
          gender === Gender.OTHER || gender === "other"
            ? "Unknown"
            : typeof gender === "string"
            ? gender.charAt(0).toUpperCase() + gender.slice(1)
            : gender === Gender.MALE
            ? "Male"
            : "Female";
        const response = await avatarService.getAvatarsByGender(genderForApi);
        setAvatars(response.avatars || []);
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
      } finally {
        setLoading(false);
      }
    };

    if (gender) {
      fetchAvatars();
    }
  }, [gender]);

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onSelect(avatarUrl);
  };

  const renderAvatarItem = ({ item }: { item: AvatarDto }) => {
    const isSelected = selectedAvatar === item.url;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.url)}
        style={{
          width: "30%",
          aspectRatio: 1,
          margin: "1.5%",
          borderRadius: 12,
          borderWidth: isSelected ? 3 : 1,
          borderColor: isSelected ? colors.accent : colors.border,
          overflow: "hidden",
          backgroundColor: colors.cardBackground,
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    );
  };

  if (loading || externalLoading) {
    return (
      <LoadingOverlay currentTheme={currentTheme} withToast={false} />
    );
  }

  return (
    <View
      className="flex-1 px-5 w-full max-h-[70vh]"
      style={{
        backgroundColor: colors.modal,
        marginTop: 12,
      }}
    >
      <View className="flex-row justify-start items-center mb-7 pr-1 pl-1">
        <ThemedText className="text-[19px] font-uber-move-medium tracking-wide">
          Update your avatar
        </ThemedText>
      </View>

      {avatars.length === 0 ? (
        <View className="items-center justify-center py-10">
          <ThemedText className="text-base">
            No avatars available for this gender
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={avatars}
          renderItem={renderAvatarItem}
          keyExtractor={(item) => item.url}
          numColumns={3}
          contentContainerStyle={{
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AvatarPickerModal;


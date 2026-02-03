import React from "react";
import { View } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import {
  NoticeVisibility,
  NoticeAudience,
} from "@/types/models/notice";
import { UsersIcon, HomeIcon, ShieldIcon } from "../icons";
import CategoryPill from "../widgets/CategoryPill";

interface AudienceSelectorProps {
  audience: NoticeAudience;
  onAudienceChange: (audience: NoticeAudience) => void;
}

const VISIBILITY_OPTIONS = [
  {
    value: NoticeVisibility.All,
    label: "Everyone",
    icon: UsersIcon,
  },
  {
    value: NoticeVisibility.OwnersOnly,
    label: "Owners",
    icon: HomeIcon,
  },
  {
    value: NoticeVisibility.SecurityGuards,
    label: "Guards",
    icon: ShieldIcon,
  },
];

const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audience,
  onAudienceChange,
}) => {

  const handleVisibilityChange = (visibility: NoticeVisibility) => {
    onAudienceChange({ visibility });
  };

  return (
    <View className="flex-row justify-start" style={{ columnGap: 6, rowGap: 10 }}>
      {VISIBILITY_OPTIONS.map((option) => {
        const isSelected = audience.visibility === option.value;
        return (
          <CategoryPill
            key={option.value}
            label={option.label}
            value={option.value}
            isSelected={isSelected}
            onPress={() => handleVisibilityChange(option.value)}
            iconKey={option.value.toString().toLowerCase()}
          />
        );
      })}
    </View>
  );
};

export default AudienceSelector;

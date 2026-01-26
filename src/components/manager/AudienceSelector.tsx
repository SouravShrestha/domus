import React from "react";
import { View } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import {
  NoticeVisibility,
  NoticeAudience,
} from "@/types/models/notice";
import { UsersIcon, HomeIcon, ShieldIcon } from "../icons";
import IconPillButton from "../widgets/IconPillButton";

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
  const { themedColors } = useTheme();

  const handleVisibilityChange = (visibility: NoticeVisibility) => {
    onAudienceChange({ visibility });
  };

  return (
    <View className="flex-row justify-start" style={{ columnGap: 8, rowGap: 10 }}>
      {VISIBILITY_OPTIONS.map((option) => {
        const IconComponent = option.icon;
        const isSelected = audience.visibility === option.value;
        
        return (
          <IconPillButton
            key={option.value}
            label={option.label}
            isSelected={isSelected}
            onPress={() => handleVisibilityChange(option.value)}
            icon={
              <IconComponent
                width={14}
                height={14}
                color={isSelected ? themedColors.textOnAccent : themedColors.text}
              />
            }
          />
        );
      })}
    </View>
  );
};

export default AudienceSelector;

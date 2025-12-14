import React from "react";
import { View, ImageSourcePropType } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import HelpSecurityCard from "./HelpSecurityCard";

interface HelpSecurityItem {
  label: string;
  image: ImageSourcePropType;
  imageSize?: number;
  onPress?: () => void;
}

interface HelpSecurityCardRowProps {
  title: string;
  actions: HelpSecurityItem[];
}

const HelpSecurityCardRow: React.FC<HelpSecurityCardRowProps> = ({
  title,
  actions,
}) => {
  return (
    <View className="px-5">
      <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider mb-4">
        {title}
      </ThemedTextSecondary>

      <View className="flex-row px-1" style={{ gap: 12 }}>
        {actions.map((item, index) => (
          <HelpSecurityCard
            key={index}
            label={item.label}
            image={item.image}
            imageSize={item.imageSize}
            onPress={item.onPress || (() => {})}
          />
        ))}
      </View>
    </View>
  );
};

export default HelpSecurityCardRow;

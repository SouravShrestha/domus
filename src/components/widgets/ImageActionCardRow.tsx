import React from "react";
import { View, ImageSourcePropType } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import ImageActionCard from "./ImageActionCard";

interface ImageActionItem {
  label: string;
  image: ImageSourcePropType;
  imageSize?: number;
  imageBackgroundColor?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

interface ImageActionCardRowProps {
  title: string;
  actions: ImageActionItem[];
}

const ImageActionCardRow: React.FC<ImageActionCardRowProps> = ({
  title,
  actions,
}) => {
  return (
    <View className="px-5">
      <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider">
        {title}
      </ThemedTextSecondary>

      <View className="flex-row mt-4 justify-between">
        {actions.map((item, index) => (
          <ImageActionCard
            key={index}
            label={item.label}
            image={item.image}
            imageSize={item.imageSize}
            imageBackgroundColor={item.imageBackgroundColor}
            onPress={item.onPress || (() => {})}
            backgroundColor={item.backgroundColor}
            textColor={item.textColor}
            style={{
              flex: 1,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageActionCardRow;

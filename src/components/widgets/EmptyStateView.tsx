import React, { ReactNode } from "react";
import { Image, View } from "react-native";
import NotFoundIcon from "@icons/NotFoundIcon";
import { ThemedTextSecondary } from "@themes/themedComponents";
import colorMapping from "@/utils/themeColors";

interface EmptyStateViewProps {
  title: string;
  subtitle1?: string;
  subtitle2?: string;
  backgroundColor: string;
  icon?: ReactNode;
  imageOverflow?: boolean;
  button?: ReactNode;
}

const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  subtitle1,
  subtitle2,
  backgroundColor,
  icon,
  imageOverflow = false,
  button,
}) => {
  return (
    <View className="flex items-center justify-center relative">
      {button && (
        <View className="w-full px-2 absolute -bottom-24">
          {button}
        </View>
      )}
      <View
        className="w-44 h-44 rounded-full justify-center items-center"
        style={{ backgroundColor: backgroundColor, overflow: imageOverflow ? 'visible' : 'hidden' }}
      >
        {icon}
      </View>
      <ThemedTextSecondary className="text-center mt-8 text-xl font-uber-move-medium tracking-wider">
        {title}
      </ThemedTextSecondary>
      {subtitle1 && (
        <ThemedTextSecondary className="text-center mt-2 text-base font-lato-regular">
          {subtitle1}
        </ThemedTextSecondary>
      )}
      {subtitle2 && (
        <ThemedTextSecondary className="text-center mt-2 text-sm font-lato-regular">
          {subtitle2}
        </ThemedTextSecondary>
      )}
    </View>
  );
};

export default EmptyStateView;

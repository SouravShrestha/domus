import React from "react";
import { View, Text } from "react-native";

interface TagWidgetProps {
  label: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
}

const TagWidget: React.FC<TagWidgetProps> = ({ label, icon, backgroundColor, textColor }) => {
  return (
    <View
      className="flex flex-row rounded-md px-3 py-1 items-center self-start space-x-2"
      style={{ backgroundColor }}
    >
      {icon}
      <Text
        className="font-lato-regular text-sm tracking-wide"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
};

export default TagWidget;
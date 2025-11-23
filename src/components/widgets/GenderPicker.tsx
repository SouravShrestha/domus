import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import BatmanPng from "@images/batman.png";
import WonderWomanPng from "@images/crown.png";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { ThemedText } from "@themes/themedComponents";
import { Gender } from "../../types/common/enums";

interface GenderPickerProps {
  onSelect?: (gender: string) => void;
}

type Hero = {
  label: string;
  source: any;
  bgColor: string;
  borderColor: string;
  textColor: string;
  tintColor: string;
  gender: Gender;
};

export default function GenderPicker({ onSelect }: GenderPickerProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const heroes: Hero[] = [
    { label: "Dark Knight", source: BatmanPng, bgColor: "bg-blue-100", borderColor: "border-blue-500", textColor: "text-blue-500", tintColor: "#3B82F6", gender: Gender.MALE },
    { label: "Wonder Queen", source: WonderWomanPng, bgColor: "bg-pink-100", borderColor: "border-pink-500", textColor: "text-pink-500", tintColor: "#EC4899", gender: Gender.FEMALE },
  ];

  const pickHero = (index: number) => {
    setSelected(index);
    if (onSelect) {
      onSelect(heroes[index].gender);
    }
  };

  return (
    <View className="flex-row justify-start">
      {heroes.map(({ label, source, bgColor, borderColor, textColor, tintColor }, i) => {
        const isSelected = selected === i;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => pickHero(i)}
            className={`flex-row items-center justify-center px-3 pr-6 rounded-md border mr-4 ${isSelected ? `${borderColor} ${bgColor}` : "bg-transparent"}`}
            style={{ height: 48, borderColor: isSelected ? undefined : colors.border }}
          >
            <View className="flex-row items-center">
              <Image
                source={source}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: isSelected ? tintColor : colors.text,
                }}
                contentFit="contain"
                transition={300}
              />
              <ThemedText className={`ml-2 ${isSelected ? textColor : undefined}`}>
                {label}
              </ThemedText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

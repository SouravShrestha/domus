import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";

const colors = [
  { bg: "bg-red-500", text: "text-red-100" },
  { bg: "bg-green-500", text: "text-green-100" },
  { bg: "bg-blue-500", text: "text-blue-200" },
  { bg: "bg-yellow-500", text: "text-yellow-900" },
  { bg: "bg-purple-500", text: "text-purple-100" },
  { bg: "bg-pink-500", text: "text-pink-100" },
  { bg: "bg-indigo-500", text: "text-indigo-100" },
  { bg: "bg-teal-500", text: "text-teal-100" },
  { bg: "bg-orange-500", text: "text-orange-100" },
];

const getInitials = (username: string): string => {
  const words = username.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getRandomColor = (input: string) => {
  const index = input.charCodeAt(0) % colors.length;
  return colors[index];
};

interface ProfileIconProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  username,
  avatarUrl = null,
  size = 40,
}) => {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#ccc",
        }}
        contentFit="cover"
        transition={300}
      />
    );
  }

  const initials = getInitials(username ?? "N A");
  const { bg, text } = getRandomColor(initials);

  return (
    <View
      className={`rounded-full items-center justify-center ${bg}`}
      style={{ width: size, height: size }}
    >
      <Text className={`font-lato-bold text-base tracking-wider ${text}`}>
        {initials}
      </Text>
    </View>
  );
};

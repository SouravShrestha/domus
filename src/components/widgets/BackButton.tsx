import React from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import ArrowIcon from "@icons/ArrowIcon";

interface BackButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    color?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, color }) => {
    const { currentTheme } = useTheme();
    const colors = (themeColors[currentTheme] || {}) as Record<string, string>;
    const iconColor = color || colors.text;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="w-10 h-10 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <ArrowIcon width={24} height={24} stroke={iconColor} />
        </TouchableOpacity>
    );
};

export default BackButton;

import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@contexts/themeContext";
import { ThemedText } from "@themes/themedComponents";
import ArrowIcon from "@icons/ArrowIcon";

export default function TypingButton({ phrases, onPress, buttonText }: { phrases: string[], onPress: () => void, buttonText: string }) {
  const { themedColors } = useTheme();
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const current = phrases[index];
    let i = 0;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (i < current.length) {
        setText(current.slice(0, i + 1));
        i++;
        timeout = setTimeout(type, 100);
      } else {
        timeout = setTimeout(erase, 900);
      }
    };

    const erase = () => {
      if (i > 0) {
        setText(current.slice(0, i - 1));
        i--;
        timeout = setTimeout(erase, 50);
      } else {
        setIndex((index + 1) % phrases.length);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [index, phrases]);

  return (
    <TouchableOpacity
      className="w-full pl-5 rounded-full border"
      style={{
        backgroundColor: themedColors.inputBackground,
        borderColor: themedColors.border,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <ThemedText className="text-base font-uber-move-medium tracking-wider py-3">
          {text}
        </ThemedText>
        <View
          className="absolute right-1.5 top-1.5 py-2 pl-5 pr-3 rounded-full items-center justify-center flex-row"
          style={{ backgroundColor: themedColors.buttonBackground }}
        >
          <Text className="text-sm font-uber-move-medium tracking-wider mr-1" style={{ color: themedColors.buttonText }}>
            {buttonText}
          </Text>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <ArrowIcon width={16} height={16} stroke={themedColors.buttonText} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

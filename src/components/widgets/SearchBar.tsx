import React, { useState, RefObject } from "react";
import { View, TextInput, TouchableOpacity, StyleProp, TextStyle } from "react-native";
import SearchIcon from "@icons/SearchIcon";
import CancelIcon from "@icons/CancelIcon";
import { themeColors } from "@themes/colors";
import { useTheme } from "@/contexts/themeContext";

interface SearchBarProps {
  prompt: string;
  style?: StyleProp<TextStyle>;
  autoFocus?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onReturnPressed?: (text: string) => void;
  inputRef?: RefObject<TextInput>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  prompt,
  style,
  autoFocus = false,
  value,
  onChangeText,
  onReturnPressed,
  inputRef,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="relative">
      <View className="absolute z-10 top-3.5 left-1.5" pointerEvents="none">
        <SearchIcon width={20} height={20} color={colors.placeholderText} />
      </View>
      <TextInput
        ref={inputRef}
        placeholder={prompt}
        className="px-4 rounded-full -mx-2 border-[0.5px] font-uber-move-medium tracking-wide pl-12 pr-12"
        style={{
          height: 48,
          fontSize: 16,
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
          color: colors.text,
          ...(style as object),
        }}
        placeholderTextColor={colors.placeholderText}
        id="searchbar"
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={(event) => {
          if (onReturnPressed) {
            onReturnPressed(event.nativeEvent.text);
          }
        }}
      />
      {value ? (
        <TouchableOpacity
          className="absolute z-20 h-full flex items-center justify-center right-1 p-2"
          onPress={() => onChangeText("")}
        >
          <CancelIcon width={12} height={12} color={colors.placeholderText} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;

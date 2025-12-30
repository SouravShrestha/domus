import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

export interface FilterOption {
  key: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilter: string | null;
  onFilterChange: (filterKey: string | null) => void;
  allLabel?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedFilter,
  onFilterChange,
  allLabel = "All",
}) => {
  const { themedColors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="mb-3"
      nestedScrollEnabled={false}
      style={{ flexGrow: 0 }}
    >
      <TouchableOpacity
        onPress={() => onFilterChange(null)}
        className="px-3 py-1.5 rounded-full border"
        style={{
          backgroundColor:
            selectedFilter === null
              ? themedColors.accent
              : themedColors.cardBackground,
          borderColor:
            selectedFilter === null
              ? themedColors.accent
              : themedColors.border,
        }}
        activeOpacity={0.7}
      >
        <ThemedText
          className="text-sm font-uber-move-medium"
          style={{
            color:
              selectedFilter === null
                ? themedColors.textOnAccent
                : themedColors.text,
          }}
        >
          {allLabel}
        </ThemedText>
      </TouchableOpacity>

      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          onPress={() => onFilterChange(option.key)}
          className="px-3.5 py-1.5 rounded-full border"
          style={{
            backgroundColor:
              selectedFilter === option.key
                ? themedColors.accent
                : themedColors.cardBackground,
            borderColor:
              selectedFilter === option.key
                ? themedColors.accent
                : themedColors.lightBorder,
          }}
          activeOpacity={0.7}
        >
          <ThemedText
            className="text-sm font-uber-move-medium"
            style={{
              color:
                selectedFilter === option.key
                  ? themedColors.textOnAccent
                  : themedColors.text,
            }}
          >
            {capitalizeFirstLetterOfWords(option.label)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default FilterChips;

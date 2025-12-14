import React from "react";
import { View, ImageSourcePropType } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import CommunityCard from "./CommunityCard";

interface CommunityCardItem {
  label: string;
  image: ImageSourcePropType;
  onPress?: () => void;
}

interface CommunityCardGridProps {
  title: string;
  actions: CommunityCardItem[];
  columns?: number;
}

const CommunityCardGrid: React.FC<CommunityCardGridProps> = ({
  title,
  actions,
  columns = 4,
}) => {
  const rows: CommunityCardItem[][] = [];
  for (let i = 0; i < actions.length; i += columns) {
    rows.push(actions.slice(i, i + columns));
  }

  return (
    <View className="px-5">
      <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider mb-1">
        {title}
      </ThemedTextSecondary>

      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          className="flex-row justify-between"
          style={{ marginBottom: rowIndex < rows.length - 1 ? 12 : 0 }}
        >
          {row.map((item, index) => (
            <CommunityCard
              key={index}
              label={item.label}
              image={item.image}
              onPress={item.onPress || (() => {})}
              style={{
                flex: 1,
                marginRight: index < row.length - 1 ? 10 : 0,
              }}
            />
          ))}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, i) => (
              <View
                key={`empty-${i}`}
                style={{
                  flex: 1,
                  marginRight: i < columns - row.length - 1 ? 10 : 0,
                }}
              />
            ))}
        </View>
      ))}
    </View>
  );
};

export default CommunityCardGrid;

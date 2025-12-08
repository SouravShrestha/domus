import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { ResidenceWithSociety } from "@/types/api/response/residence";

interface ResidenceCardProps {
  residence: ResidenceWithSociety;
  onPress: (residence: ResidenceWithSociety) => void;
}

const ResidenceCard: React.FC<ResidenceCardProps> = ({ residence, onPress }) => {
  const { themedColors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(residence)}
      className="p-4 rounded-xl mb-3"
      style={{
        backgroundColor: themedColors.card,
        borderWidth: 1,
        borderColor: themedColors.border,
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <ThemedText className="text-lg font-uber-move-medium">
            {residence.short_name}
          </ThemedText>
          {residence.block && (
            <View className="flex-row items-center mt-1">
              <View
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: themedColors.accent + "20" }}
              >
                <ThemedText
                  className="text-xs font-lato-bold"
                  style={{ color: themedColors.accent }}
                >
                  {residence.block}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
        
        <View className="items-end">
          <View
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: residence.is_occupied
                ? "#26C281"
                : themedColors.disabled,
            }}
          />
          <ThemedText
            className="text-xs font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {residence.is_occupied ? "Occupied" : "Vacant"}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ResidenceCard;

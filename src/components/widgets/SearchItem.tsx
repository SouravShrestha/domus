import React from "react";
import { View, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import MapPinIcon from "@icons/MapPinIcon";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import BuildingIcon from "@icons/BuildingIcon";
import DirectionSignalIcon from "@icons/DirectionSignalIcon";
import LocationArrowIcon from "@icons/LocationArrowIcon";
import GovernmentFlagIcon from "@icons/GovernmentFlagIcon";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { Address } from "@/types/models/address";

interface AddressWithCountry extends Address {
  country?: string;
}

interface SearchItemProps {
  onPress?: (event: GestureResponderEvent) => void;
  MainText: string;
  Type: string;
  Address?: AddressWithCountry | null;
}

const SearchItem: React.FC<SearchItemProps> = ({ onPress, MainText, Type, Address }) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const getIcon = () => {
    switch (Type.toLowerCase()) {
      case "society":
        return <BuildingIcon width={20} height={20} color={colors.text} />;
      case "city":
        return <GovernmentFlagIcon width={20} height={20} color={colors.text} />;
      case "locality":
        return <DirectionSignalIcon width={20} height={20} color={colors.text} />;
      case "state":
        return <MapPinIcon width={20} height={20} color={colors.text} />;
      case "location":
        return <LocationArrowIcon width={20} height={20} color={colors.text} />;
      default:
        return <MapPinIcon width={20} height={20} color={colors.text} />;
    }
  };

  const getAddress = (address?: AddressWithCountry | null) => {
    if (!address) return Type.toLowerCase() === "location" ? "My current location" : "Unknown Address";

    address.country = "India";

    const addressParts: { [key: string]: string } = {
      society: `${address.street ?? ""}, ${address.city ?? ""}, ${address.state ?? ""}, ${address.zipCode ?? ""}`,
      city: `${address.state ?? ""}, ${address.country}`,
      locality: `${address.city ?? ""}, ${address.state ?? ""}, ${address.zipCode ?? ""}`,
      state: `${address.country}`,
    };

    const formattedAddress = addressParts[Type.toLowerCase()] || null;

    return formattedAddress ? capitalizeFirstLetterOfWords(formattedAddress) : "Unknown Address";
  };

  return (
    <TouchableOpacity
      className="flex flex-row items-start py-2 px-6 mr-4"
      onPress={onPress}
    >
      <View className="mt-2.5">{getIcon()}</View>
      <View className="ml-5">
        <ThemedText className="text-lg font-uber-move-medium tracking-wide">
          {MainText}
        </ThemedText>
        <View className="flex flex-row items-start justify-between w-full mt-1">
          <ThemedText className="text-[15px] font-lato-regular tracking-wide w-4/5 text-wrap leading-5">
            {getAddress(Address)}
          </ThemedText>
          {Type.toLowerCase() !== "location" && (
            <ThemedTextSecondary className="text-[14px] font-lato-regular tracking-wide">
              {capitalizeFirstLetterOfWords(Type)}
            </ThemedTextSecondary>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;

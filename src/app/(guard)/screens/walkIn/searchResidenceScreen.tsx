import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useGuard } from "@contexts/guardContext";
import { searchResidences } from "@/api/services/residence.service";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { Ionicons } from "@expo/vector-icons";

const SearchResidenceScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { societyId } = useGuard();
  const router = useRouter();

  const [searchType, setSearchType] = useState<"flat" | "resident">("flat");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ResidenceWithSociety[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length >= 2 && societyId) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, searchType, societyId]);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !societyId) return;

    setIsLoading(true);
    try {
      const { data, error } = await searchResidences(
        societyId,
        searchTerm,
        searchType
      );
      if (data) {
        setResults(data);
      } else {
        console.error("Search error:", error);
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResidence = (residence: ResidenceWithSociety) => {
    router.push({
      pathname: "/(guard)/screens/walkIn/visitorInfoScreen",
      params: {
        residenceId: residence.id,
        residenceName: residence.short_name,
        flatNumber: residence.flat_number,
        block: residence.block || "",
      },
    });
  };

  const renderResidenceItem = ({ item }: { item: ResidenceWithSociety }) => (
    <TouchableOpacity
      onPress={() => handleSelectResidence(item)}
      className="p-4 mb-3 rounded-xl"
      style={{ backgroundColor: themedColors.card }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <ThemedText className="text-lg font-uber-move-medium">
            {item.short_name}
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {item.block ? `Block ${item.block}, ` : ""}Flat {item.flat_number}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={themedColors.secondaryText}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={themedColors.text} />
          </TouchableOpacity>
          <ThemedText className="text-2xl font-uber-move-medium">
            Search Residence
          </ThemedText>
        </View>

        <View className="px-4">
          {/* Search Type Toggle */}
          <View
            className="flex-row mb-4 p-1 rounded-xl"
            style={{ backgroundColor: themedColors.card }}
          >
            <TouchableOpacity
              onPress={() => setSearchType("flat")}
              className="flex-1 py-3 rounded-lg"
              style={{
                backgroundColor:
                  searchType === "flat" ? themedColors.accent : "transparent",
              }}
            >
              <Text
                className="text-center font-uber-move-medium"
                style={{
                  color:
                    searchType === "flat"
                      ? themedColors.textOnAccent
                      : themedColors.text,
                }}
              >
                Flat Number
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSearchType("resident")}
              className="flex-1 py-3 rounded-lg"
              style={{
                backgroundColor:
                  searchType === "resident"
                    ? themedColors.accent
                    : "transparent",
              }}
            >
              <Text
                className="text-center font-uber-move-medium"
                style={{
                  color:
                    searchType === "resident"
                      ? themedColors.textOnAccent
                      : themedColors.text,
                }}
              >
                Resident Name
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View
            className="flex-row items-center px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: themedColors.card }}
          >
            <Ionicons
              name="search"
              size={20}
              color={themedColors.secondaryText}
              style={{ marginRight: 12 }}
            />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={
                searchType === "flat"
                  ? "Enter flat number (e.g., A-101, 205)"
                  : "Enter resident name"
              }
              placeholderTextColor={themedColors.secondaryText}
              className="flex-1 font-lato-regular text-base"
              style={{ color: themedColors.text }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={themedColors.secondaryText}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={themedColors.accent} />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderResidenceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : searchTerm.trim().length >= 2 ? (
            <View className="items-center justify-center py-8">
              <Ionicons
                name="home-outline"
                size={48}
                color={themedColors.secondaryText}
              />
              <Text
                className="text-base font-lato-regular mt-4 text-center"
                style={{ color: themedColors.secondaryText }}
              >
                No residences found
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Ionicons
                name="search-outline"
                size={48}
                color={themedColors.secondaryText}
              />
              <Text
                className="text-base font-lato-regular mt-4 text-center"
                style={{ color: themedColors.secondaryText }}
              >
                {searchType === "flat"
                  ? "Search by flat number or block"
                  : "Search by resident name"}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default SearchResidenceScreen;

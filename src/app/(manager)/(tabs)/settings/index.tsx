import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/themeContext";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
  ThemedScrollView,
  ThemedHR,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { themeColors } from "@themes/colors";

import {
  SocietiesIcon,
  BuildingIcon,
  PhoneIcon,
  RulesIcon,
  ToggleOnIcon,
  EditIcon,
  ArrowIcon,
  CheckIcon,
  ChevronDownIcon,
  BoltIcon,
  BoltSlashIcon,
} from "@components/icons";

import Divider from "@components/widgets/Divider";
import ListItemButton from "@components/widgets/ListItemButton";
import CustomToggle from "@components/widgets/CustomToggle";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Building {
  id: string;
  name: string;
  flats: Flat[];
}

interface Flat {
  id: string;
  number: string;
  enabled: boolean;
}

interface EmergencyContact {
  id: string;
  label: string;
  phone: string;
}

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { themedColors, currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const [refreshing, setRefreshing] = useState(false);

  // Society Info State
  const [societyName, setSocietyName] = useState("Green Valley Apartments");
  const [societyAddress, setSocietyAddress] = useState(
    "123 Main Street, Bengaluru, Karnataka 560001"
  );
  const [isEditingSociety, setIsEditingSociety] = useState(false);
  const [tempSocietyName, setTempSocietyName] = useState(societyName);
  const [tempSocietyAddress, setTempSocietyAddress] = useState(societyAddress);

  // Buildings & Flats State
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: "1",
      name: "Block A",
      flats: [
        { id: "a1", number: "A-101", enabled: true },
        { id: "a2", number: "A-102", enabled: true },
        { id: "a3", number: "A-103", enabled: false },
      ],
    },
    {
      id: "2",
      name: "Block B",
      flats: [
        { id: "b1", number: "B-101", enabled: true },
        { id: "b2", number: "B-102", enabled: true },
      ],
    },
    {
      id: "3",
      name: "Block C",
      flats: [
        { id: "c1", number: "C-101", enabled: true },
        { id: "c2", number: "C-102", enabled: false },
        { id: "c3", number: "C-103", enabled: true },
      ],
    },
  ]);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(
    null
  );

  // Emergency Contacts State
  const [emergencyContacts] = useState<EmergencyContact[]>([
    { id: "1", label: "Security", phone: "+91 9876543210" },
    { id: "2", label: "Manager", phone: "+91 9876543211" },
    { id: "3", label: "Local Emergency", phone: "100" },
  ]);

  // Gate Instructions State
  const [gateInstructions, setGateInstructions] = useState(
    "All visitors must show valid ID. Delivery personnel should be escorted to the residence. No entry after 10 PM without prior approval."
  );
  const [isEditingGate, setIsEditingGate] = useState(false);
  const [tempGateInstructions, setTempGateInstructions] =
    useState(gateInstructions);

  // Society Status State
  const [societyActive, setSocietyActive] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleSaveSocietyInfo = () => {
    setSocietyName(tempSocietyName);
    setSocietyAddress(tempSocietyAddress);
    setIsEditingSociety(false);
  };

  const handleCancelSocietyEdit = () => {
    setTempSocietyName(societyName);
    setTempSocietyAddress(societyAddress);
    setIsEditingSociety(false);
  };

  const handleBuildingPress = (buildingId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedBuildingId(
      expandedBuildingId === buildingId ? null : buildingId
    );
  };

  const handleFlatToggle = (buildingId: string, flatId: string) => {
    setBuildings((prev) =>
      prev.map((building) => {
        if (building.id === buildingId) {
          return {
            ...building,
            flats: building.flats.map((flat) =>
              flat.id === flatId ? { ...flat, enabled: !flat.enabled } : flat
            ),
          };
        }
        return building;
      })
    );
  };

  const handleCallContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSaveGateInstructions = () => {
    setGateInstructions(tempGateInstructions);
    setIsEditingGate(false);
  };

  const handleCancelGateEdit = () => {
    setTempGateInstructions(gateInstructions);
    setIsEditingGate(false);
  };

  const handleSocietyStatusChange = (value: boolean) => {
    Alert.alert(
      value ? "Activate Society" : "Pause Society",
      value
        ? "Are you sure you want to activate this society?"
        : "Pausing will temporarily disable all society features. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => setSocietyActive(value),
          style: value ? "default" : "destructive",
        },
      ]
    );
  };

  const iconColor = colors.text;
  const iconSize = 18;

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <ThemedScrollView
        style={{ marginTop: insets.top }}
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themedColors.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View className="mt-4 mb-6">
          <ThemedText className="text-2xl font-uber-move-bold tracking-wide">
            Society Settings
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
            Manage your society configuration
          </ThemedTextSecondary>
        </View>

        {/* 1. Society Info */}
        <View className="mb-5">
          <View className="flex-row items-center mb-4">
            <SocietiesIcon
              width={iconSize}
              height={iconSize}
              color={iconColor}
            />
            <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider ml-3">
              Society Information
            </ThemedTextSecondary>
          </View>

          {isEditingSociety ? (
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <TextInput
                value={tempSocietyName}
                onChangeText={setTempSocietyName}
                placeholder="Society Name"
                placeholderTextColor={colors.placeholderText}
                className="text-base font-uber-move-medium mb-3 pb-2"
                style={{
                  color: colors.text,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              />
              <TextInput
                value={tempSocietyAddress}
                onChangeText={setTempSocietyAddress}
                placeholder="Address"
                placeholderTextColor={colors.placeholderText}
                multiline
                numberOfLines={2}
                className="text-sm font-lato-regular"
                style={{ color: colors.secondaryText }}
              />
              <View className="flex-row justify-end mt-4" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleCancelSocietyEdit}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.border }}
                >
                  <ThemedText className="text-sm font-uber-move-medium">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSocietyInfo}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.accent }}
                >
                  <ThemedText
                    className="text-sm font-uber-move-medium"
                    style={{ color: colors.textOnAccent }}
                  >
                    Save
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingSociety(true)}
              className="rounded-xl p-4 flex-row justify-between items-start"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <View className="flex-1 mr-3">
                <ThemedText className="text-base font-uber-move-medium mb-1">
                  {societyName}
                </ThemedText>
                <ThemedTextSecondary className="text-sm font-lato-regular">
                  {societyAddress}
                </ThemedTextSecondary>
              </View>
              <EditIcon width={16} height={16} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        <Divider style={{ height: 8 }} />

        {/* 2. Buildings & Flats */}
        <View className="my-5">
          <View className="flex-row items-center mb-4">
            <BuildingIcon
              width={iconSize}
              height={iconSize}
              color={iconColor}
            />
            <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider ml-3">
              Buildings & Flats
            </ThemedTextSecondary>
          </View>

          <View style={{ gap: 8 }}>
            {buildings.map((building) => (
              <View key={building.id}>
                <TouchableOpacity
                  onPress={() => handleBuildingPress(building.id)}
                  className="rounded-xl p-4 flex-row justify-between items-center"
                  style={{ backgroundColor: colors.cardBackground }}
                >
                  <View className="flex-row items-center">
                    <ThemedText className="text-base font-uber-move-medium">
                      {building.name}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular ml-2">
                      ({building.flats.length} flats)
                    </ThemedTextSecondary>
                  </View>
                  <View
                    style={{
                      transform: [
                        {
                          rotate:
                            expandedBuildingId === building.id
                              ? "180deg"
                              : "0deg",
                        },
                      ],
                    }}
                  >
                    <ChevronDownIcon
                      width={16}
                      height={16}
                      color={colors.secondaryText}
                    />
                  </View>
                </TouchableOpacity>

                {expandedBuildingId === building.id && (
                  <View
                    className="mt-2 ml-4 rounded-xl p-3"
                    style={{ backgroundColor: colors.inputBackground }}
                  >
                    {building.flats.map((flat, index) => (
                      <View key={flat.id}>
                        <View className="flex-row justify-between items-center py-2">
                          <View className="flex-row items-center">
                            {flat.enabled ? (
                              <BoltIcon
                                width={14}
                                height={14}
                                color={colors.success}
                              />
                            ) : (
                              <BoltSlashIcon
                                width={14}
                                height={14}
                                color={colors.disabled}
                              />
                            )}
                            <ThemedText className="text-sm font-uber-move-regular ml-3">
                              {flat.number}
                            </ThemedText>
                          </View>
                          <CustomToggle
                            value={flat.enabled}
                            onValueChange={() =>
                              handleFlatToggle(building.id, flat.id)
                            }
                          />
                        </View>
                        {index < building.flats.length - 1 && <ThemedHR />}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <Divider style={{ height: 8 }} />

        {/* 3. Emergency Contacts */}
        <View className="my-5">
          <View className="flex-row items-center mb-4">
            <PhoneIcon width={iconSize} height={iconSize} color={iconColor} />
            <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider ml-3">
              Emergency Contacts
            </ThemedTextSecondary>
          </View>

          <View style={{ gap: 8 }}>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => handleCallContact(contact.phone)}
                className="rounded-xl p-4 flex-row justify-between items-center"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <View>
                  <ThemedText className="text-base font-uber-move-medium">
                    {contact.label}
                  </ThemedText>
                  <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                    {contact.phone}
                  </ThemedTextSecondary>
                </View>
                <View
                  className="p-2 rounded-full"
                  style={{ backgroundColor: colors.success + "30" }}
                >
                  <PhoneIcon width={16} height={16} color={colors.success} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider style={{ height: 8 }} />

        {/* 4. Gate Instructions */}
        <View className="my-5">
          <View className="flex-row items-center mb-4">
            <RulesIcon width={iconSize} height={iconSize} color={iconColor} />
            <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider ml-3">
              Gate Instructions
            </ThemedTextSecondary>
          </View>

          {isEditingGate ? (
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <TextInput
                value={tempGateInstructions}
                onChangeText={setTempGateInstructions}
                placeholder="Enter instructions for guards..."
                placeholderTextColor={colors.placeholderText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="text-sm font-lato-regular"
                style={{
                  color: colors.text,
                  minHeight: 100,
                }}
              />
              <View className="flex-row justify-end mt-4" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleCancelGateEdit}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.border }}
                >
                  <ThemedText className="text-sm font-uber-move-medium">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveGateInstructions}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.accent }}
                >
                  <ThemedText
                    className="text-sm font-uber-move-medium"
                    style={{ color: colors.textOnAccent }}
                  >
                    Save
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingGate(true)}
              className="rounded-xl p-4 flex-row justify-between items-start"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <ThemedTextSecondary className="text-sm font-lato-regular flex-1 mr-3 leading-5">
                {gateInstructions}
              </ThemedTextSecondary>
              <EditIcon width={16} height={16} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        <Divider style={{ height: 8 }} />

        {/* 5. Society Status */}
        <View className="my-5">
          <View className="flex-row items-center mb-4">
            <ToggleOnIcon
              width={iconSize}
              height={iconSize}
              color={iconColor}
            />
            <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider ml-3">
              Society Status
            </ThemedTextSecondary>
          </View>

          <View
            className="rounded-xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <View className="flex-1 mr-3">
              <ThemedText className="text-base font-uber-move-medium">
                Society is {societyActive ? "Active" : "Paused"}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                {societyActive
                  ? "All features are enabled"
                  : "Society features are temporarily disabled"}
              </ThemedTextSecondary>
            </View>
            <CustomToggle
              value={societyActive}
              onValueChange={handleSocietyStatusChange}
            />
          </View>
        </View>
      </ThemedScrollView>
    </ThemedView>
  );
};

export default SettingsScreen;

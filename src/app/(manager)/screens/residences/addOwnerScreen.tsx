import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  FlatList,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import * as Contacts from "expo-contacts";
import { ROUTES } from "@constants/routes";
import { formatPhoneForDisplay } from "@utils/phoneHelpers";
import Divider from "@/components/widgets/Divider";
import { FilledGiftIcon } from "@/components/icons";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
};

type ContactCardProps = {
  item: Contact;
  onSelect: (contact: Contact) => void;
  cardBackgroundColor: string;
};

const ContactCard = memo(
  ({ item, onSelect, cardBackgroundColor }: ContactCardProps) => (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      className="rounded-md p-5 mb-3 flex-1"
      style={{
        backgroundColor: cardBackgroundColor,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 items-center">
          <ProfileIcon username={item.name} size={48} />
          <ThemedText className="font-uber-move-medium text-base mb-1 text-center mt-3">
            {item.name}
          </ThemedText>
          <ThemedText className="font-lato-regular text-sm opacity-70">
            {formatPhoneForDisplay(item.phoneNumber)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  ),
);

const AddOwnerScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    residenceId: string;
    residenceName: string;
    block: string;
    floorNumber: string;
    hasOwner?: string;
  }>();

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [hasContactPermission, setHasContactPermission] =
    useState<boolean>(false);

  const hasOwner = params.hasOwner === "true";

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [phoneNumber, contacts]);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        setHasContactPermission(false);
        return;
      }

      setHasContactPermission(true);
      setIsLoadingContacts(true);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const contactList: Contact[] = [];

      data.forEach((contact) => {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          contact.phoneNumbers.forEach((phone) => {
            if (phone.number) {
              const cleaned = phone.number.replace(/[^0-9]/g, "");
              if (cleaned.length >= 10) {
                contactList.push({
                  id: `${contact.id}-${phone.number}`,
                  name: contact.name || "Unknown",
                  phoneNumber: cleaned.slice(-10),
                });
              }
            }
          });
        }
      });

      contactList.sort((a, b) => a.name.localeCompare(b.name));

      setContacts(contactList);
    } catch {
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const filterContacts = () => {
    if (!phoneNumber.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = phoneNumber.toLowerCase().trim();
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phoneNumber.includes(query),
    );

    setFilteredContacts(filtered);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhoneNumber(cleaned);
  };

  const handleContactSelect = useCallback(
    (contact: Contact) => {
      router.push({
        pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.OWNER_DETAILS,
        params: {
          phone: formatPhoneForDisplay(contact.phoneNumber),
          name: contact.name,
          residenceId: params.residenceId,
          residenceName: params.residenceName,
          block: params.block,
          floorNumber: params.floorNumber,
        },
      });
    },
    [
      params.residenceId,
      params.residenceName,
      params.block,
      params.floorNumber,
    ],
  );

  const handleInviteNewNumber = () => {
    if (phoneNumber.length < 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit phone number.",
      );
      return;
    }

    router.push({
      pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.OWNER_DETAILS,
      params: {
        phone: formatPhoneForDisplay(phoneNumber),
        residenceId: params.residenceId,
        residenceName: params.residenceName,
        block: params.block,
        floorNumber: params.floorNumber,
      },
    });
  };

  const renderContactCard = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactCard
        item={item}
        onSelect={handleContactSelect}
        cardBackgroundColor={themedColors.cardBackground}
      />
    ),
    [handleContactSelect, themedColors.cardBackground],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  const showInviteButton =
    phoneNumber.length >= 10 && filteredContacts.length === 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />

        {isLoadingContacts && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          className="flex-1"
        >
          <View
            className="pb-2 mx-3"
            style={{
              paddingTop: insets.top + 6,
            }}
          >
            <ThemedHeaderWithBack
              onBackPress={() => router.back()}
              title={hasOwner ? "Change Owner" : "Invite Owner"}
            />
          </View>

          <View className="flex-1 px-5">
            {/* Residence Info */}
            <View
              className="rounded-xl p-4 mt-2 mb-4"
              style={{ backgroundColor: themedColors.cardBackground }}
            >
              <ThemedTextSecondary className="font-uber-move-medium text-xs uppercase tracking-wider mb-1">
                Residence
              </ThemedTextSecondary>
              <ThemedText className="font-uber-move-medium text-lg">
                {params.residenceName}
              </ThemedText>
              <ThemedTextSecondary className="font-uber-move-regular text-sm mt-1">
                Block {params.block} • Floor {params.floorNumber}
              </ThemedTextSecondary>
            </View>

            <View className="mt-2.5">
              <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-base">
                Enter owner's phone number
              </ThemedText>
              <View className="flex-row items-center mt-2">
                <View
                  className="mr-2 px-3 border rounded-md items-center justify-center"
                  style={{ borderColor: themedColors.border, height: 48 }}
                >
                  <ThemedText className="font-uber-move-medium text-base tracking-wider">
                    +91
                  </ThemedText>
                </View>
                <TextInput
                  className="rounded-md px-4 border font-uber-move-medium flex-1 tracking-wider"
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: themedColors.text,
                    borderColor: themedColors.border,
                  }}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor={themedColors.placeholderText}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                />
              </View>
            </View>

            {showInviteButton && (
              <TouchableOpacity
                onPress={handleInviteNewNumber}
                className="rounded-md p-4 mt-8 flex-row items-center justify-center border"
                style={{
                  backgroundColor: themedColors.cardBackground,
                  borderColor: themedColors.border,
                }}
              >
                <FilledGiftIcon
                  width={16}
                  height={16}
                  color={themedColors.text}
                />
                <ThemedText className="font-lato-regular text-base text-center mx-2">
                  Invite
                </ThemedText>
                <Text
                  className="font-uber-move-medium text-base text-center tracking-wider"
                  style={{ color: themedColors.accent }}
                >
                  {formatPhoneForDisplay(phoneNumber)}
                </Text>
              </TouchableOpacity>
            )}

            {hasContactPermission && (
              <View className="mt-8 flex-1">
                <Divider className="mb-6" />
                <ThemedText className="font-uber-move-medium text-base mb-3 ml-1 tracking-wide">
                  Choose from your contacts
                </ThemedText>

                {filteredContacts.length > 0 ? (
                  <FlatList
                    data={filteredContacts}
                    renderItem={renderContactCard}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 12 }}
                    contentContainerStyle={{
                      paddingBottom: insets.bottom + 24,
                      paddingTop: 12,
                    }}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                  />
                ) : phoneNumber.length > 0 ? (
                  <View className="py-12">
                    <ThemedTextSecondary className="font-lato-regular text-base text-center">
                      No matching contacts found. {"\n"}Continue entering
                      complete number to send invite.
                    </ThemedTextSecondary>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            )}

            {!hasContactPermission && (
              <View
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: themedColors.cardBackground }}
              >
                <ThemedText className="font-lato-regular text-base opacity-70 text-center">
                  Allow contact access to search and select from your contacts
                </ThemedText>
                <TouchableOpacity
                  onPress={loadContacts}
                  className="mt-3 rounded-lg py-2 px-4 self-center"
                  style={{ backgroundColor: themedColors.accent }}
                >
                  <ThemedText
                    className="font-uber-move-medium text-sm"
                    style={{ color: themedColors.textOnAccent }}
                  >
                    Enable Access
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default AddOwnerScreen;

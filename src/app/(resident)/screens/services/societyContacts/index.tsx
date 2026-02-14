import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { getActiveSocietyContactsBySocietyId } from "@api/services/societyContact.service";
import {
  SocietyContact,
  SocietyContactType,
  SocietyContactTypeLabels,
  SocietyContactTypeColors,
} from "@/types";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { router } from "expo-router";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { Image } from "expo-image";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { getDefaultCategoryImageUrl } from "@/utils/categoryImages";
import { PhoneCallIcon } from "@/components/icons";

const SocietyContactsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();

  const [contacts, setContacts] = useState<SocietyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<SocietyContact | null>(
    null,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const societyId = currentResidence?.society_id;

  const fetchContacts = useCallback(
    async (showRefresh = false) => {
      if (!societyId) return;

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error } =
          await getActiveSocietyContactsBySocietyId(societyId);

        if (error) {
          console.error("Error fetching contacts:", error);
          setContacts([]);
          return;
        }

        setContacts(data || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [societyId],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = () => {
    fetchContacts(true);
  };

  const handleContactPress = useCallback((contact: SocietyContact) => {
    setSelectedContact(contact);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCall = useCallback((contact: SocietyContact) => {
    const phoneUrl = `tel:${contact.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Unable to make phone calls on this device");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to initiate call");
      });
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  const groupedContacts = contacts.reduce<
    Partial<Record<SocietyContactType, SocietyContact[]>>
  >((acc, contact) => {
    const type = contact.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type]!.push(contact);
    return acc;
  }, {});

  const contactTypes = Object.keys(groupedContacts) as SocietyContactType[];

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top + 6, paddingHorizontal: 12 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="">
          <ThemedHeaderWithBack
            title="society contacts"
            onBackPress={() => router.back()}
          />
        </View>

        {contacts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ThemedTextSecondary className="text-base text-center">
              No contacts available.
            </ThemedTextSecondary>
          </View>
        ) : (
          <View className="mt-10 px-2">
            {contactTypes.map((type) => (
              <View key={type} className="mb-6 -mt-2">
                <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider mb-4">
                  {SocietyContactTypeLabels[type]}
                </ThemedTextSecondary>
                <View className="flex-row flex-wrap justify-between">
                  {groupedContacts[type]?.map((contact) => {
                    const imageUrl =
                      contact.image_url ||
                      getDefaultCategoryImageUrl(contact.type);
                    return (
                      <View key={contact.id} className="w-[49%] px-1 mb-5">
                        <TouchableOpacity
                          onPress={() => handleContactPress(contact)}
                          activeOpacity={0.7}
                          className="rounded-lg px-4 py-5 border"
                          style={{
                            borderColor: themedColors.lightBorder,
                            backgroundColor: themedColors.cardBackground,
                          }}
                        >
                          <View className="flex items-center">
                            <View className="w-12 h-12 items-center justify-center overflow-hidden">
                              <Image
                                source={{ uri: imageUrl }}
                                style={{ width: 48, height: 48 }}
                                contentFit="cover"
                                transition={200}
                              />
                            </View>

                            <View className="flex-1 items-center mt-4">
                              <ThemedText
                                className="text-sm font-uber-move-medium tracking-wide"
                                numberOfLines={1}
                              >
                                {contact.name}
                              </ThemedText>
                              <ThemedTextSecondary
                                className="text-sm mt-0.5 font-uber-move-medium tracking-wider"
                                numberOfLines={1}
                              >
                                {formatPhoneForDisplay(contact.phone)}
                              </ThemedTextSecondary>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Portal hostName="global">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enableDynamicSizing={true}
          enablePanDownToClose
          enableHandlePanningGesture={true}
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView>
            {selectedContact && (
              <View
                className="flex-1"
                style={{ paddingBottom: insets.bottom + 12 }}
              >
                <View className="px-8 pt-6">
                  <View className="flex items-center mb-4">
                    {selectedContact.image_url ? (
                      <Image
                        source={{ uri: selectedContact.image_url }}
                        className="w-14 h-14"
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        className="w-14 h-14 rounded-md items-center justify-center mt-2"
                        style={{
                          backgroundColor:
                            SocietyContactTypeColors[selectedContact.type] +
                            "15",
                        }}
                      />
                    )}
                    <View className="flex-1 mt-4 items-center">
                      <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                        {selectedContact.name}
                      </ThemedText>
                      <ThemedTextSecondary className="text-base font-uber-move-medium tracking-wider mt-0.5">
                        {formatPhoneForDisplay(selectedContact.phone)}
                      </ThemedTextSecondary>
                    </View>
                  </View>

                  <View className="mt-4">
                    <TouchableOpacity
                      onPress={() => handleCall(selectedContact)}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-center py-3.5 rounded-md"
                      style={{
                        backgroundColor: themedColors.accent,
                      }}
                    >
                      <PhoneCallIcon
                        width={16}
                        height={16}
                        color={themedColors.textOnAccent}
                      />
                      <ThemedText
                        className="text-base font-uber-move-medium ml-2 tracking-wider"
                        style={{ color: themedColors.textOnAccent }}
                      >
                        Call
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default SocietyContactsScreen;

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
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
} from "@/types";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { PlusIcon } from "@/components/icons";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import ContactCard from "./contactCard";
import ContactBottomSheet from "./contactBottomSheet";

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

  useEffect(() => {
    const unsubscribe = appEventEmitter.on(
      AppEvents.SOCIETY_CONTACT_UPDATED,
      () => fetchContacts(false),
    );
    return () => unsubscribe();
  }, [fetchContacts]);

  const handleRefresh = () => {
    fetchContacts(true);
  };

  const handleContactPress = useCallback((contact: SocietyContact) => {
    setSelectedContact(contact);
    bottomSheetRef.current?.expand();
  }, []);

  const handleEditContact = useCallback(
    (contact: SocietyContact) => {
      bottomSheetRef.current?.close();
      router.push({
        pathname: ROUTES.MANAGER.SCREENS.SERVICES.SOCIETY_CONTACTS.EDIT_CONTACT,
        params: {
          contactId: contact.id,
          societyId: societyId || "",
          mode: "edit",
        },
      });
    },
    [societyId],
  );

  const handleAddContact = () => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.SOCIETY_CONTACTS.EDIT_CONTACT,
      params: {
        societyId: societyId || "",
        mode: "add",
      },
    });
  };

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
        style={{ marginTop: insets.top + 6, paddingHorizontal: 16 }}
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
        <View className="-mx-2">
          <ThemedHeaderWithBack
            title="society contacts"
            onBackPress={() => router.back()}
          />
        </View>

        {contacts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ThemedTextSecondary className="text-base text-center">
              No contacts added yet.{"\n"}Tap the + button to add a contact.
            </ThemedTextSecondary>
          </View>
        ) : (
          <View className="mt-10 px-1">
            {contactTypes.map((type) => (
              <View key={type} className="mb-6 -mt-2">
                <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider mb-4">
                  {SocietyContactTypeLabels[type]}
                </ThemedTextSecondary>
                <View className="flex-row flex-wrap justify-between">
                  {groupedContacts[type]?.map((contact) => (
                    <View key={contact.id} className="w-[49%] px-1 mb-5">
                      <ContactCard
                        contact={contact}
                        onPress={() => handleContactPress(contact)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddContact}
        className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
        style={{
          backgroundColor: themedColors.accent,
          bottom: insets.bottom + 24,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
      </TouchableOpacity>

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
            <ContactBottomSheet
              contact={selectedContact}
              onEdit={handleEditContact}
              isLoading={isLoading}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default SocietyContactsScreen;

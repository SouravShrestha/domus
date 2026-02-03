import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { router, useLocalSearchParams } from "expo-router";
import {
  getSocietyContactById,
  createSocietyContact,
  updateSocietyContact,
  deleteSocietyContact,
} from "@api/services/societyContact.service";
import {
  SocietyContactType,
  SocietyContactTypeLabels,
  SocietyContactTypeColors,
} from "@/types";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import CustomToggle from "@/components/widgets/CustomToggle";
import { SaveIcon, TrashXmarkIcon, EditIcon, PencilIcon } from "@/components/icons";
import { formatPhoneForApi } from "@/utils/phoneHelpers";
import { getDefaultCategoryImageUrl } from "@/utils/categoryImages";
import CategoryImagePicker, {
  CategoryImagePickerRef,
} from "@/components/widgets/CategoryImagePicker";
import CategoryPill from "@/components/widgets/CategoryPill";

const contactTypeOptions = [
  {
    value: SocietyContactType.Authority,
    label: SocietyContactTypeLabels[SocietyContactType.Authority],
  },
  {
    value: SocietyContactType.Emergency,
    label: SocietyContactTypeLabels[SocietyContactType.Emergency],
  },
  {
    value: SocietyContactType.Maintenance,
    label: SocietyContactTypeLabels[SocietyContactType.Maintenance],
  },
];

const EditContactScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    contactId?: string;
    societyId?: string;
    mode?: string;
  }>();

  const isEditing = params.mode === "edit" && !!params.contactId;
  const societyId = params.societyId || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactType, setContactType] = useState<SocietyContactType>(
    SocietyContactType.Authority,
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const imagePickerRef = useRef<CategoryImagePickerRef>(null);

  const currentImageUrl = imageUrl || getDefaultCategoryImageUrl(contactType);

  const handleOpenImagePicker = () => {
    imagePickerRef.current?.open();
  };

  const handleImageSelect = (selectedImageUrl: string) => {
    setImageUrl(selectedImageUrl);
  };

  useEffect(() => {
    if (isEditing && params.contactId) {
      fetchContact(params.contactId);
    }
  }, [isEditing, params.contactId]);

  const fetchContact = async (contactId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await getSocietyContactById(contactId);
      if (error || !data) {
        console.error("Error fetching contact:", error);
        router.back();
        return;
      }
      setName(data.name);
      setPhone(data.phone);
      setContactType(data.type);
      setImageUrl(data.image_url);
      setIsActive(data.is_active);
    } catch (error) {
      console.error("Error fetching contact:", error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter both name and phone number.",
      );
      return;
    }

    let finalPhone = phone.trim();
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      finalPhone = formatPhoneForApi(phone) || finalPhone;
    } else if (cleaned.length === 10 && phone.includes('91')) {
      finalPhone = formatPhoneForApi(phone) || finalPhone;
    }

    setIsSaving(true);
    try {
      const contactData = {
        society_id: societyId,
        name: name.trim(),
        phone: finalPhone,
        type: contactType,
        image_url: imageUrl,
        is_active: isActive,
      };

      if (isEditing && params.contactId) {
        const { error } = await updateSocietyContact(
          params.contactId,
          contactData,
        );
        if (error) {
          console.error("Error updating contact:", error);
          Alert.alert("Error", "Failed to update contact. Please try again.");
          return;
        }
      } else {
        const { error } = await createSocietyContact(contactData);
        if (error) {
          console.error("Error creating contact:", error);
          Alert.alert("Error", "Failed to create contact. Please try again.");
          return;
        }
      }

      appEventEmitter.emit(AppEvents.SOCIETY_CONTACT_UPDATED);
      router.back();
    } catch (error) {
      console.error("Error saving contact:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!params.contactId) return;
            setIsSaving(true);
            try {
              const { error } = await deleteSocietyContact(params.contactId);
              if (error) {
                console.error("Error deleting contact:", error);
                Alert.alert(
                  "Error",
                  "Failed to delete contact. Please try again.",
                );
                return;
              }
              appEventEmitter.emit(AppEvents.SOCIETY_CONTACT_UPDATED);
              router.back();
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "An unexpected error occurred.");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

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
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="-mx-2">
          <ThemedHeaderWithBack
            title={isEditing ? "edit contact" : "add contact"}
            onBackPress={() => router.back()}
          />
        </View>

        {/* Image Picker Section */}
        <View className="mt-8 items-center">
          <TouchableOpacity
            onPress={handleOpenImagePicker}
            className="relative"
          >
            <View
              className="w-24 h-24 overflow-hidden items-center justify-center"
            >
              <Image
                source={{ uri: currentImageUrl }}
                style={{ width: 96, height: 96 }}
                contentFit="cover"
                transition={200}
              />
            </View>
            <View
              className="absolute top-0 -right-5 w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: themedColors.buttonBackground,
              }}
            >
              <PencilIcon
                width={14}
                height={14}
                color={themedColors.buttonText}
              />
            </View>
          </TouchableOpacity>
          <ThemedTextSecondary className="text-xs mt-2">
            Tap to change image
          </ThemedTextSecondary>
        </View>

        <View className="mt-6">
          <ThemedText className="text-sm font-uber-move-medium mb-2">
            Name
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter contact name"
            placeholderTextColor={themedColors.placeholderText}
            className="rounded-lg px-4 py-3 border"
            style={{
              borderColor: themedColors.lightBorder,
              backgroundColor: themedColors.cardBackground,
              color: themedColors.text,
              fontSize: 16,
              lineHeight: 20,
            }}
          />
        </View>

        <View className="mt-6">
          <ThemedText className="text-sm font-uber-move-medium mb-2">
            Phone Number
          </ThemedText>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={themedColors.placeholderText}
            keyboardType="phone-pad"
            className="rounded-lg px-4 py-3 border"
            style={{
              borderColor: themedColors.lightBorder,
              backgroundColor: themedColors.cardBackground,
              color: themedColors.text,
              fontSize: 16,
              lineHeight: 20,
            }}
          />
        </View>

        <View className="mt-6">
          <ThemedText className="text-sm font-uber-move-medium mb-3">
            Contact Type
          </ThemedText>
          <View className="flex-row gap-x-1">
            {contactTypeOptions.map((option) => {
              const isSelected = contactType === option.value;
              const typeColor = SocietyContactTypeColors[option.value];
              return (
                <View className="ml-0">
                  <CategoryPill
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={typeColor}
                    isSelected={isSelected}
                    onPress={() => setContactType(option.value)}
                    iconKey={option.value}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {isEditing && (
          <View
            className="flex-row items-center justify-between mt-6 rounded-lg p-4 border"
            style={{
              borderColor: themedColors.lightBorder,
              backgroundColor: themedColors.cardBackground,
            }}
          >
            <View className="w-2/3">
              <ThemedText className="text-base font-uber-move-medium">
                Active
              </ThemedText>
              <ThemedTextSecondary className="text-sm mt-1">
                Inactive contacts won't appear in the list
              </ThemedTextSecondary>
            </View>
            <View className="w-1/5 items-center justify-center">
              <CustomToggle value={isActive} onValueChange={setIsActive} />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim() || !phone.trim() || isSaving}
          className="mt-8 rounded-md py-4 items-center flex-row justify-center"
          style={{
            backgroundColor:
              name.trim() && phone.trim()
                ? themedColors.buttonBackground
                : themedColors.lightBorder,
          }}
        >
          <SaveIcon
            width={14}
            height={14}
            color={
              name.trim() && phone.trim()
                ? themedColors.buttonText
                : themedColors.secondaryText
            }
          />
          <ThemedText
            className="text-base font-uber-move-medium ml-2"
            style={{
              color:
                name.trim() && phone.trim()
                  ? themedColors.buttonText
                  : themedColors.secondaryText,
            }}
          >
            {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
          </ThemedText>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isSaving}
            className="mt-4 rounded-md py-4 items-center flex-row justify-center"
            style={{
              backgroundColor: themedColors.error + "15",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            <TrashXmarkIcon width={14} height={14} color={themedColors.error} />
            <ThemedText
              className="text-base font-uber-move-medium ml-2"
              style={{ color: themedColors.error }}
            >
              Delete Contact
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CategoryImagePicker
        ref={imagePickerRef}
        contactType={contactType}
        onSelect={handleImageSelect}
        currentImageUrl={imageUrl}
      />

      {isSaving && <LoadingOverlay currentTheme={currentTheme} />}
    </ThemedView>
  );
};

export default EditContactScreen;

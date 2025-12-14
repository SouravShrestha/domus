import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  useColorScheme,
  Text,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useTheme } from "@/contexts/themeContext";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedScrollView,
  ThemedView,
  ThemedHR,
} from "@themes/themedComponents";

import {
  ProfileIcon,
  HeartIcon,
  NotificationIcon,
  EmailIcon,
  SmsIcon,
  PrivacyIcon,
  ThemeIcon,
  AutomaticIcon,
  DarkIcon,
  LightIcon,
  SwapIcon,
  ArrowIcon,
} from "@components/icons";
import { ROUTES } from "@constants/routes";

import ActionButton from "@components/widgets/ActionButton";
import SettingToggle from "@components/widgets/SettingToggle";
import Divider from "@components/widgets/Divider";
import ListItemButton from "@components/widgets/ListItemButton";
import WideButton from "@components/widgets/WideButton";
import BottomDropdownLabel from "@components/widgets/BottomDropdownLabel";
import LoadingOverlay from "@components/widgets/LoadingOverlay";
import ThemeModal from "@components/widgets/ThemeModal";
import { ProfileIcon as ProfileIconComponent } from "@components/widgets/ProfileIcon";

import logo from "@assets/icons/ios-light.png";
import logoDark from "@assets/icons/ios-dark.png";

import { themeColors } from "@themes/colors";
import colorMapping from "@themes/colors";
import { getUserDisplayName } from "@utils/textHelpers";
import useStatusBarStyle from "@hooks/useStatusBarStyle";
import { notificationPreferencesService } from "@api/services/notificationPreferences.service";
import { userService } from "@api/services/user.service";
import { useAuth } from "@/contexts/authContext";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { ThemeSelection, IconProps } from "@/types/common";
import AvatarPickerModal from "@components/widgets/AvatarPickerModal";
import { showErrorToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";

interface ThemeOption {
  label: string;
  value: string;
  icon: React.FC<IconProps>;
  backgroundColor: string;
  textColor: string;
}

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const router = useRouter();
  const {
    themedColors,
    currentTheme,
    selectedTheme,
    setTheme: setCurrentTheme,
  } = useTheme();
  const { signOut, isManager, switchViewMode, profile, refreshProfile } =
    useAuth();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [prefsLoaded, setPrefsLoaded] = useState<boolean>(false);
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([]);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState<boolean>(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);

  const colors = themeColors[currentTheme];
  const iconColor = colors.text || "#fff";

  useStatusBarStyle("auto");

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshProfile();

      if (profile?.id) {
        const prefs =
          await notificationPreferencesService.getPreferencesByUserId(
            profile.id
          );
        setPushEnabled(prefs?.enable_push_notifications ?? true);
        setEmailEnabled(prefs?.enable_email_notifications ?? true);
        setSmsEnabled(prefs?.enable_sms_notifications ?? true);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setRefreshing(false);
    }
  }, [profile?.id, refreshProfile]);

  const handleSwitchToManager = () => {
    switchViewMode("manager");
    router.replace(ROUTES.MANAGER.HOME);
  };

  // Load notification preferences only once when profile is available
  useEffect(() => {
    const loadPrefs = async () => {
      if (profile?.id && !prefsLoaded) {
        try {
          const prefs =
            await notificationPreferencesService.getPreferencesByUserId(
              profile.id
            );
          setPushEnabled(prefs?.enable_push_notifications ?? true);
          setEmailEnabled(prefs?.enable_email_notifications ?? true);
          setSmsEnabled(prefs?.enable_sms_notifications ?? true);
          setPrefsLoaded(true);
        } catch (err) {
          console.error("Failed to load notification preferences:", err);
        }
      }
    };
    loadPrefs();
  }, [profile?.id, prefsLoaded]);

  useEffect(() => {
    setThemeOptions([
      {
        label: "System theme",
        value: "system",
        icon: AutomaticIcon,
        backgroundColor: themeColors[systemScheme || "dark"].background,
        textColor: themeColors[systemScheme || "dark"].text,
      },
      {
        label: "Dark theme",
        value: "dark",
        icon: DarkIcon,
        backgroundColor: themeColors.dark.background,
        textColor: themeColors.dark.text,
      },
      {
        label: "Light theme",
        value: "light",
        icon: LightIcon,
        backgroundColor: themeColors.light.background,
        textColor: themeColors.light.text,
      },
    ]);
  }, [systemScheme, currentTheme]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeChange = (theme: ThemeSelection) => {
    setCurrentTheme(theme);
  };

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const avatarBottomSheetRefInternal = React.useRef<BottomSheet>(null);

  const toggleBottomSheet = (expand: boolean) => {
    if (expand) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  };

  const toggleAvatarBottomSheet = (expand: boolean) => {
    if (expand) {
      setIsAvatarSheetOpen(true);
      avatarBottomSheetRefInternal.current?.expand();
    } else {
      setIsAvatarSheetOpen(false);
      avatarBottomSheetRefInternal.current?.close();
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!profile) return;

    try {
      setIsUpdatingAvatar(true);
      await userService.updateProfilePicture(profile.id, avatarUrl);
      await refreshProfile();

      toggleAvatarBottomSheet(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      showErrorToast("Failed to update avatar. Please try again.");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleNotificationPreferenceChange = async (
    type: "push" | "email" | "sms",
    value: boolean
  ) => {
    if (!profile) return;

    if (type === "push") {
      setPushEnabled(value);
    } else if (type === "email") {
      setEmailEnabled(value);
    } else if (type === "sms") {
      setSmsEnabled(value);
    }

    try {
      await notificationPreferencesService.updateSinglePreference(
        profile.id,
        type,
        value
      );
    } catch (error) {
      console.error("Failed to update notification preference:", error);
      if (type === "push") {
        setPushEnabled(!value);
      } else if (type === "email") {
        setEmailEnabled(!value);
      } else if (type === "sms") {
        setSmsEnabled(!value);
      }
      showErrorToast(
        "Failed to update notification preference. Please try again."
      );
    }
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
    []
  );

  return (
    <ThemedView className="flex-1 relative">
      <ThemedScrollView
        className="flex-1 px-5"
        style={{ marginTop: insets.top }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themedColors.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header with back button */}
        <View className="mb-6 flex-row items-center pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={10}
          >
            <ArrowIcon width={24} height={24} stroke={themedColors.text} />
          </TouchableOpacity>
        </View>
        {/* Header: Profile Info */}
        <View className="">
          <View className="items-center flex-row mb-8">
            <TouchableOpacity
              className="mr-4"
              onPress={() => toggleAvatarBottomSheet(true)}
            >
              <ProfileIconComponent
                username={getUserDisplayName(profile)}
                avatarUrl={profile?.photo_url}
                size={48}
              />
            </TouchableOpacity>
            <View className="flex flex-col justify-between flex-1">
              <ThemedText className="text-xl font-uber-move-bold tracking-wider">
                {getUserDisplayName(profile)}
              </ThemedText>
              <ThemedTextSecondary className="text-base font-lato-regular">
                {formatPhoneForDisplay(profile?.phone)}
              </ThemedTextSecondary>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-10 flex flex-row justify-start mt-2">
            <ActionButton
              icon={ProfileIcon}
              label="your profile details"
              backgroundColor={colors.cardBackground}
              iconColor={colorMapping.brightGreen}
              iconBackgroundColor={colorMapping.brightGreen + "50"}
              textColor={colors.text}
              onPress={() => console.log("Your profile details")} // eslint-disable-line no-console
            />
            <ActionButton
              icon={HeartIcon}
              label="help and support"
              backgroundColor={colors.cardBackground}
              iconColor={colorMapping.lightPink}
              iconBackgroundColor={colorMapping.lightPink + "50"}
              textColor={colors.text}
              onPress={() => console.log("Help and support")} // eslint-disable-line no-console
            />
          </View>
        </View>

        <Divider style={{ height: 8 }} />

        {/* Settings */}
        <View className="my-5">
          <ThemedTextSecondary className="text-xs font-uber-move-medium mb-5 uppercase tracking-wider">
            Settings
          </ThemedTextSecondary>
          <TouchableOpacity
            onPress={() => toggleBottomSheet(true)}
            className="p-2 -m-2 px-10 -mx-10"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <ThemeIcon width={16} height={16} color={iconColor} />
                <ThemedText className="text-base font-uber-move-medium tracking-wide ml-4">
                  App theme
                </ThemedText>
              </View>
              <BottomDropdownLabel
                selectedOption={
                  themeOptions.find((option) => option.value === selectedTheme)
                    ?.label || "System theme"
                }
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Manager Mode Toggle */}
        {isManager && (
          <>
            <Divider style={{ height: 8 }} />
            <View className="my-5">
              <ThemedTextSecondary className="text-xs font-uber-move-medium mb-5 uppercase tracking-wider">
                Role Switching
              </ThemedTextSecondary>
              <TouchableOpacity
                onPress={handleSwitchToManager}
                className="p-4 rounded-xl flex-row items-center"
                style={{ backgroundColor: colors.cardBackground }}
                activeOpacity={0.7}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.accent + "20" }}
                >
                  <SwapIcon width={20} height={20} color={colors.accent} />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-uber-move-medium">
                    Switch to Manager Mode
                  </ThemedText>
                  <Text
                    className="text-xs font-lato-regular mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Access society management features
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Divider style={{ height: 8 }} />

        {/* Notifications */}
        <View className="my-5 flex flex-col">
          <ThemedTextSecondary className="text-xs font-uber-move-medium mb-5 uppercase tracking-wider">
            Notifications & reminders
          </ThemedTextSecondary>
          <View style={{ gap: 16 }}>
            <SettingToggle
              label="Push notifications"
              Icon={NotificationIcon}
              value={pushEnabled}
              onValueChange={(value) =>
                handleNotificationPreferenceChange("push", value)
              }
            />
            <ThemedHR />

            <SettingToggle
              label="Email"
              Icon={EmailIcon}
              value={emailEnabled}
              onValueChange={(value) =>
                handleNotificationPreferenceChange("email", value)
              }
            />
            <ThemedHR />

            <SettingToggle
              label="SMS"
              Icon={SmsIcon}
              value={smsEnabled}
              onValueChange={(value) =>
                handleNotificationPreferenceChange("sms", value)
              }
            />
          </View>
        </View>

        <Divider style={{ height: 8 }} />

        {/* Privacy & About */}
        <View className="my-5">
          <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-5">
            Privacy and Security
          </ThemedTextSecondary>
          <View style={{ gap: 16 }} className="mb-5">
            <ListItemButton Icon={PrivacyIcon} label="Privacy & data" />
            <ThemedHR />
            <ListItemButton
              label="About Domus"
              Left={
                <Image
                  source={currentTheme === "dark" ? logo : logoDark}
                  style={{ width: 16, height: 16, borderRadius: 4 }}
                />
              }
            />
          </View>

          <WideButton
            className="mt-8"
            label={"Logout"}
            onPress={handleLogout}
          />
        </View>
      </ThemedScrollView>

      {/* Theme Bottom Sheet */}
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: themeColors[currentTheme].modal }}
          handleIndicatorStyle={{
            backgroundColor: themeColors[currentTheme].accent,
          }}
          containerStyle={{ paddingTop: 0, marginTop: 0 }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            style={{
              flex: 1,
              alignItems: "center",
              backgroundColor: themeColors[currentTheme].modal,
            }}
          >
            <ThemeModal
              onClose={() => toggleBottomSheet(false)}
              themeOptions={themeOptions}
              onThemeChange={handleThemeChange}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>

      {/* Avatar Picker Bottom Sheet */}
      <Portal>
        <BottomSheet
          ref={avatarBottomSheetRefInternal}
          index={-1}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: themeColors[currentTheme].modal }}
          handleIndicatorStyle={{
            backgroundColor: themeColors[currentTheme].accent,
          }}
          containerStyle={{ paddingTop: 0, marginTop: 0 }}
          backdropComponent={renderBackdrop}
          onClose={() => setIsAvatarSheetOpen(false)}
        >
          <BottomSheetView
            style={{
              flex: 1,
              backgroundColor: themeColors[currentTheme].modal,
            }}
          >
            {profile && isAvatarSheetOpen && (
              <AvatarPickerModal
                onSelect={handleAvatarSelect}
                currentAvatarUrl={profile.photo_url}
                gender={profile.gender || "unknown"}
                isLoading={isUpdatingAvatar}
              />
            )}
          </BottomSheetView>
        </BottomSheet>
      </Portal>

      {refreshing && <LoadingOverlay currentTheme={currentTheme} />}
    </ThemedView>
  );
};

export default ProfileScreen;

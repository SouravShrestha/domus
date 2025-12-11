import React, { useEffect, useState, useCallback } from "react";
import {
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import CustomToggle from "@/components/widgets/CustomToggle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
  ThemedHR,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import Divider from "@/components/widgets/Divider";
import {
  BadgeCheckIcon,
  AddVisitorIcon,
  AmenitiesIcon,
  ComplaintIcon,
  DeliveryIcon,
  ExitIcon,
  EmployeeManAltIcon,
  RefreshIcon,
  HoldingHandKeyIcon,
  SmilingBoyIcon,
  InfoIcon,
  LightIcon,
  HeartIcon,
  GiftIcon,
  ShippingFastIcon,
  ExitAltIcon,
  EngineWarningIcon,
  SettingsIcon,
  TriangleWarningIcon,
} from "@/components/icons";
import {
  MemberPermissions,
  PermissionKey,
  PERMISSION_INFO,
  DEFAULT_PERMISSIONS,
} from "@/types/models/memberPermissions";
import {
  getMemberPermissions,
  updateMemberPermissions,
  resetToRoleDefaults,
  updateMemberRole,
} from "@/api/services/memberPermissions.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";

type ScreenParams = {
  memberId: string;
  membershipId: string;
  memberName: string;
  memberPhone: string;
  memberPhotoUrl?: string;
  memberRole: string;
};

type FamilyRole = "owner" | "adult" | "kid";

const ICON_SIZE = 16;
const roleOptions: {
  value: FamilyRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "owner",
    label: "Owner",
    description: "Primary owner with full access",
    color: basicColors.gold,
    icon: (
      <HoldingHandKeyIcon
        color={basicColors.gold}
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    ),
  },
  {
    value: "adult",
    label: "Adult",
    description: "Family member with full resident rights",
    color: basicColors.blue,
    icon: (
      <EmployeeManAltIcon
        color={basicColors.blue}
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    ),
  },
  {
    value: "kid",
    label: "Kid",
    description: "Minor with limited access",
    color: basicColors.lightPink,
    icon: (
      <SmilingBoyIcon
        color={basicColors.lightPink}
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    ),
  },
];

const EditFamilyMemberPermissionsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { isOwner, currentResidence } = useResidence();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ScreenParams>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<MemberPermissions | null>(
    null
  );
  const [modifiedPermissions, setModifiedPermissions] = useState<
    Partial<Record<PermissionKey, boolean>>
  >({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedRole, setSelectedRole] = useState<FamilyRole>(
    params.memberRole as FamilyRole
  );
  const [roleChanged, setRoleChanged] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!params.membershipId) return;

    setIsLoading(true);
    try {
      const { data, error } = await getMemberPermissions(params.membershipId);
      if (error) {
        console.error("Error fetching permissions:", error);
        showErrorToast("Failed to load permissions");
        return;
      }
      setPermissions(data);
    } catch (error) {
      console.error("Error:", error);
      showErrorToast("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [params.membershipId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const getPermissionIcon = (key: PermissionKey): React.ReactNode => {
    const iconProps = { width: 16, height: 16, color: themedColors.text };
    switch (key) {
      case "can_invite_visitors":
        return <GiftIcon {...iconProps} />;
      case "can_approve_delivery":
        return <ShippingFastIcon {...iconProps} />;
      case "can_exit_society":
        return <ExitAltIcon {...iconProps} />;
      case "can_manage_staff":
        return <SettingsIcon {...iconProps} />;
      case "can_book_amenities":
        return <AmenitiesIcon {...iconProps} />;
      case "can_raise_complaints":
        return <EngineWarningIcon {...iconProps} />;
      default:
        return <SettingsIcon {...iconProps} />;
    }
  };

  const getRoleIcon = (role: string): React.ReactNode => {
    const iconProps = { width: 16, height: 16 };
    switch (role.toLowerCase()) {
      case "owner":
        return <HoldingHandKeyIcon {...iconProps} color={basicColors.gold} />;
      case "adult":
        return <EmployeeManAltIcon {...iconProps} color={basicColors.blue} />;
      case "kid":
        return <SmilingBoyIcon {...iconProps} color={basicColors.lightPink} />;
      default:
        return <BadgeCheckIcon {...iconProps} color={themedColors.accent} />;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case "owner":
        return basicColors.gold;
      case "adult":
        return basicColors.blue;
      case "kid":
        return basicColors.lightPink;
      default:
        return themedColors.accent;
    }
  };

  const handleTogglePermission = (key: PermissionKey, value: boolean) => {
    if (!isOwner || selectedRole === "owner") return;

    setModifiedPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleRoleChange = (role: FamilyRole) => {
    if (!isOwner || params.memberRole === "owner" || role === selectedRole)
      return;
    setSelectedRole(role);
    setRoleChanged(role !== params.memberRole);
    const roleDefaults = DEFAULT_PERMISSIONS[role] || {};
    setModifiedPermissions(
      roleDefaults as Partial<Record<PermissionKey, boolean>>
    );
    setHasChanges(true);
  };

  const getCurrentValue = (key: PermissionKey): boolean => {
    if (key in modifiedPermissions) {
      return modifiedPermissions[key] as boolean;
    }
    return permissions?.[key] ?? false;
  };

  const handleSaveChanges = async () => {
    if (!hasChanges || !params.membershipId) return;

    setIsSaving(true);
    try {
      if (roleChanged) {
        const { error: roleError } = await updateMemberRole(
          params.membershipId,
          selectedRole,
          profile?.id,
          currentResidence?.id,
          params.memberName,
          params.memberRole
        );
        if (roleError) {
          throw roleError;
        }
      }

      if (Object.keys(modifiedPermissions).length > 0) {
        const { error } = await updateMemberPermissions(
          params.membershipId,
          modifiedPermissions,
          profile?.id,
          currentResidence?.id,
          params.memberName
        );
        if (error) {
          throw error;
        }
      }

      showSuccessToast("Changes saved successfully");
      router.back();
    } catch (error) {
      console.error("Error saving changes:", error);
      showErrorToast("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      `Reset permissions to default ${capitalizeFirstLetterOfWords(
        selectedRole
      )} settings?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            setIsSaving(true);
            try {
              const { error } = await resetToRoleDefaults(
                params.membershipId,
                selectedRole,
                profile?.id,
                currentResidence?.id,
                params.memberName
              );
              if (error) throw error;
              showSuccessToast("Permissions reset to defaults");
              setModifiedPermissions({});
              setHasChanges(false);
              await fetchPermissions();
            } catch (error) {
              console.error("Error resetting permissions:", error);
              showErrorToast("Failed to reset permissions");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const isOwnerMember = params.memberRole === "owner";
  const canEdit = isOwner && !isOwnerMember;
  const roleColor = getRoleColor(selectedRole);

  const groupedPermissions = {
    visitors: PERMISSION_INFO.filter((p) => p.category === "visitors"),
    access: PERMISSION_INFO.filter((p) => p.category === "access"),
    society: PERMISSION_INFO.filter((p) => p.category === "society"),
    management: PERMISSION_INFO.filter((p) => p.category === "management"),
  };

  const renderPermissionItem = (info: (typeof PERMISSION_INFO)[0]) => {
    const isEnabled = getCurrentValue(info.key);

    return (
      <View
        key={info.key}
        className="flex-row justify-between items-center py-2"
      >
        <View className="flex-row items-center flex-1 mr-4">
          {getPermissionIcon(info.key)}
          <View className="ml-5 flex-1">
            <ThemedText className="text-base font-uber-move-medium tracking-wide">
              {info.label}
            </ThemedText>
            <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5">
              {info.description}
            </ThemedTextSecondary>
          </View>
        </View>
        {canEdit ? (
          <CustomToggle
            value={isEnabled}
            onValueChange={(value) => handleTogglePermission(info.key, value)}
          />
        ) : (
          <View style={{ opacity: 0.5 }}>
            <CustomToggle value={isEnabled} onValueChange={() => {}} />
          </View>
        )}
      </View>
    );
  };

  const renderSection = (
    title: string,
    permissions: typeof PERMISSION_INFO
  ) => {
    if (permissions.length === 0) return null;

    return (
      <View className="mb-6">
        <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider mb-5">
          {title}
        </ThemedTextSecondary>
        <View style={{ gap: 16 }}>
          {permissions.map((info, index) => (
            <React.Fragment key={info.key}>
              {renderPermissionItem(info)}
              {index < permissions.length - 1 && <ThemedHR />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <View className="pb-2 mx-3" style={{ paddingTop: insets.top + 16 }}>
        <ThemedHeaderWithBack
          onBackPress={() => router.back()}
          title="member permissions"
        />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <View className="mt-6 mb-4 rounded-md">
          <View className="flex-row items-center">
            <ProfileIcon
              username={params.memberName}
              avatarUrl={params.memberPhotoUrl}
              size={56}
            />
            <View className="flex-1 ml-4">
              <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                {params.memberName}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                {formatPhoneForDisplay(params.memberPhone)}
              </ThemedTextSecondary>
            </View>

            {!canEdit && (
              <View className="mt-4 flex-row items-center">
                <View
                  className="px-3 py-2 rounded-lg flex-row items-center"
                  style={{ backgroundColor: roleColor + "15" }}
                >
                  {getRoleIcon(selectedRole)}
                  <ThemedText
                    className="text-sm font-uber-move-medium ml-2"
                    style={{ color: roleColor }}
                  >
                    {capitalizeFirstLetterOfWords(selectedRole)}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {canEdit && (
            <View className="mt-6">
              <View className="flex-row space-x-3">
                {roleOptions.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => handleRoleChange(role.value)}
                    className="flex-1 rounded-md py-3 items-center justify-center border"
                    style={{
                      borderColor:
                        selectedRole === role.value
                          ? themedColors.accent
                          : themedColors.border,
                      borderWidth: selectedRole === role.value ? 2 : 1,
                      backgroundColor:
                        selectedRole === role.value
                          ? themedColors.accent + "10"
                          : themedColors.cardBackground,
                    }}
                  >
                    <View className="items-center space-y-3">
                      <View
                        className="w-12 h-12 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: role.color + "20",
                        }}
                      >
                        {role.icon}
                      </View>
                      <ThemedText className="font-uber-move-medium text-base">
                        {role.label}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <ThemedTextSecondary className="font-lato-regular text-sm mt-5 ml-1">
                {roleOptions.find((r) => r.value === selectedRole)?.description}
              </ThemedTextSecondary>
            </View>
          )}

          {isOwnerMember && (
            <View
              className="mt-6 py-2 px-3 rounded-lg flex-row items-center"
              style={{ backgroundColor: basicColors.gold + "15" }}
            >
              <TriangleWarningIcon
                width={15}
                height={15}
                color={basicColors.gold}
              />
              <ThemedText
                className="text-sm font-lato-regular ml-2.5 flex-1 tracking-wider"
                style={{ color: basicColors.gold }}
              >
                Owner permissions cannot be modified
              </ThemedText>
            </View>
          )}

          {!isOwner && !isOwnerMember && (
            <View
              className="mt-6 py-2 px-3 rounded-lg flex-row items-center"
              style={{ backgroundColor: basicColors.gold + "15" }}
            >
              <TriangleWarningIcon
                width={15}
                height={15}
                color={basicColors.gold}
              />
              <ThemedText
                className="text-sm font-lato-regular ml-2.5 flex-1 tracking-wider"
                style={{ color: basicColors.gold }}
              >
                Only owners can edit permissions
              </ThemedText>
            </View>
          )}
        </View>

        {canEdit && (
          <TouchableOpacity
            onPress={handleResetToDefaults}
            className="flex-row items-center self-end mt-4 py-2"
            activeOpacity={0.7}
          >
            <RefreshIcon width={13} height={13} color={basicColors.gold} />
            <ThemedText
              className="text-sm font-uber-move-medium ml-2"
              style={{ color: basicColors.gold }}
            >
              Reset permissions to {capitalizeFirstLetterOfWords(selectedRole)}{" "}
              defaults
            </ThemedText>
          </TouchableOpacity>
        )}

        <View className="mt-6 mx-0.5">
          {renderSection("Visitors & Deliveries", groupedPermissions.visitors)}
          <Divider style={{ height: 8, marginBottom: 20 }} />
          {renderSection("Access Control", groupedPermissions.access)}
          <Divider style={{ height: 8, marginBottom: 20 }} />
          {renderSection("Society Features", groupedPermissions.society)}
          <Divider style={{ height: 8, marginBottom: 20 }} />
          {renderSection("Management", groupedPermissions.management)}
        </View>
      </ScrollView>

      {canEdit && hasChanges && (
        <View
          className="absolute left-0 right-0 px-5"
          style={{
            bottom: insets.bottom + 16,
          }}
        >
          <TouchableOpacity
            onPress={handleSaveChanges}
            disabled={isSaving}
            className="rounded-xl py-4 items-center justify-center shadow-lg"
            style={{
              backgroundColor: themedColors.buttonBackground,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <ThemedText
              className="text-base font-uber-move-medium tracking-wide"
              style={{ color: themedColors.buttonText }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {(isLoading || isSaving) && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default EditFamilyMemberPermissionsScreen;

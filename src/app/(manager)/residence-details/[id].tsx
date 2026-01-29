import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { residenceRepository } from "@api/repositories/residence/residence.repository";
import { createResidenceInvite } from "@api/services/invitation.service";
import { ResidenceWithMembers } from "@api/interfaces/residence.interface";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay, formatPhoneForApi } from "@utils/phoneHelpers";
import { showSuccessToast, showErrorToast } from "@utils/toast";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";

const ResidenceDetailsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const residenceId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [residenceData, setResidenceData] =
    useState<ResidenceWithMembers | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  useEffect(() => {
    fetchResidenceDetails();
  }, [residenceId]);

  const fetchResidenceDetails = async () => {
    if (!residenceId) return;

    setIsLoading(true);
    const { data, error } = await residenceRepository.findByIdWithMembers(
      residenceId
    );

    if (error || !data) {
      console.error("Failed to fetch residence details:", error);
      showErrorToast("Failed to load residence details");
      setIsLoading(false);
      return;
    }

    setResidenceData(data);
    setIsLoading(false);
  };

  const handleInviteOwner = async () => {
    if (!ownerPhone.trim()) {
      showErrorToast("Please enter owner's phone number");
      return;
    }

    if (!user?.id || !residenceData) return;

    setIsInviting(true);

    try {
      const formattedPhone = formatPhoneForApi(ownerPhone);

      await createResidenceInvite(
        formattedPhone,
        residenceId,
        "owner",
        user.id,
        true,
        ownerName.trim() || undefined,
        residenceData.residence.short_name,
        residenceData.residence.society.name
      );

      showSuccessToast("Owner invitation sent successfully");
      setShowInviteForm(false);
      setOwnerName("");
      setOwnerPhone("");

      // Refresh data
      await fetchResidenceDetails();
    } catch (error: any) {
      console.error("Failed to invite owner:", error);
      showErrorToast(error.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const renderMemberItem = (member: any) => (
    <View
      key={member.id}
      className="p-4 rounded-xl mb-3"
      style={{
        backgroundColor: themedColors.cardBackground,
        borderWidth: 1,
        borderColor: themedColors.border,
      }}
    >
      <View className="flex-row items-center">
        <ProfileIcon username={member.user.name} size={48} />
        <View className="flex-1 ml-3">
          <ThemedText className="text-base font-uber-move-medium">
            {member.user.name}
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {formatPhoneForDisplay(member.user.phone)}
          </Text>
          <View
            className="self-start px-2 py-1 rounded mt-2"
            style={{ backgroundColor: themedColors.accent + "20" }}
          >
            <Text
              className="text-xs font-lato-bold uppercase"
              style={{ color: themedColors.accent }}
            >
              {member.role}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <ThemedStatusBar />
        <SafeAreaView className="flex-1">
          <ThemedHeaderWithBack title="Residence Details" />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={themedColors.accent} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!residenceData) {
    return (
      <ThemedView className="flex-1">
        <ThemedStatusBar />
        <SafeAreaView className="flex-1">
          <ThemedHeaderWithBack title="Residence Details" />
          <View className="flex-1 items-center justify-center px-6">
            <ThemedText className="text-lg font-uber-move-medium mb-2">
              Residence Not Found
            </ThemedText>
            <Text
              className="text-sm font-lato-regular text-center"
              style={{ color: themedColors.secondaryText }}
            >
              Unable to load residence details
            </Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const { residence, hasOwner, members } = residenceData;

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ThemedHeaderWithBack title="Residence Details" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1 px-4">
            {/* Residence Info */}
            <View
              className="p-4 rounded-xl mb-4 mt-4"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderWidth: 1,
                borderColor: themedColors.border,
              }}
            >
              <ThemedText className="text-2xl font-uber-move-medium mb-2">
                {residence.short_name}
              </ThemedText>

              <View className="flex-row items-center mb-1">
                <Text
                  className="text-sm font-lato-regular"
                  style={{ color: themedColors.secondaryText }}
                >
                  Flat: {residence.flat_number}
                </Text>
                {residence.block && (
                  <>
                    <Text
                      className="text-sm font-lato-regular mx-2"
                      style={{ color: themedColors.secondaryText }}
                    >
                      •
                    </Text>
                    <Text
                      className="text-sm font-lato-regular"
                      style={{ color: themedColors.secondaryText }}
                    >
                      Block: {residence.block}
                    </Text>
                  </>
                )}
                {residence.floor_number !== null && (
                  <>
                    <Text
                      className="text-sm font-lato-regular mx-2"
                      style={{ color: themedColors.secondaryText }}
                    >
                      •
                    </Text>
                    <Text
                      className="text-sm font-lato-regular"
                      style={{ color: themedColors.secondaryText }}
                    >
                      Floor: {residence.floor_number}
                    </Text>
                  </>
                )}
              </View>

              <View className="flex-row items-center mt-2">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      members.length > 0 ? "#26C281" : themedColors.disabled,
                  }}
                />
                <Text
                  className="text-sm font-lato-regular"
                  style={{ color: themedColors.secondaryText }}
                >
                  {members.length > 0 ? "Occupied" : "Vacant"}
                </Text>
              </View>
            </View>

            {/* Invite Owner Section */}
            {!hasOwner && (
              <View className="mb-4">
                {!showInviteForm ? (
                  <TouchableOpacity
                    onPress={() => setShowInviteForm(true)}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themedColors.accent,
                    }}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      className="text-center text-base font-uber-move-medium"
                      style={{ color: "#FFFFFF" }}
                    >
                      Invite Owner
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <View
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themedColors.cardBackground,
                      borderWidth: 1,
                      borderColor: themedColors.border,
                    }}
                  >
                    <ThemedText className="text-lg font-uber-move-medium mb-3">
                      Invite Owner
                    </ThemedText>

                    <Text
                      className="text-sm font-lato-regular mb-2"
                      style={{ color: themedColors.secondaryText }}
                    >
                      Owner Name (Optional)
                    </Text>
                    <TextInput
                      value={ownerName}
                      onChangeText={setOwnerName}
                      placeholder="Enter owner's name"
                      placeholderTextColor={themedColors.disabled}
                      className="p-3 rounded-lg mb-3 font-lato-regular"
                      style={{
                        backgroundColor: themedColors.background,
                        color: themedColors.text,
                        borderWidth: 1,
                        borderColor: themedColors.border,
                      }}
                    />

                    <Text
                      className="text-sm font-lato-regular mb-2"
                      style={{ color: themedColors.secondaryText }}
                    >
                      Owner Phone Number *
                    </Text>
                    <TextInput
                      value={ownerPhone}
                      onChangeText={setOwnerPhone}
                      placeholder="+91XXXXXXXXXX"
                      placeholderTextColor={themedColors.disabled}
                      keyboardType="phone-pad"
                      className="p-3 rounded-lg mb-4 font-lato-regular"
                      style={{
                        backgroundColor: themedColors.background,
                        color: themedColors.text,
                        borderWidth: 1,
                        borderColor: themedColors.border,
                      }}
                    />

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => {
                          setShowInviteForm(false);
                          setOwnerName("");
                          setOwnerPhone("");
                        }}
                        className="flex-1 p-3 rounded-lg"
                        style={{
                          backgroundColor: themedColors.background,
                          borderWidth: 1,
                          borderColor: themedColors.border,
                        }}
                        activeOpacity={0.7}
                      >
                        <ThemedText className="text-center text-base font-uber-move-medium">
                          Cancel
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleInviteOwner}
                        disabled={isInviting}
                        className="flex-1 p-3 rounded-lg"
                        style={{
                          backgroundColor: themedColors.accent,
                          opacity: isInviting ? 0.5 : 1,
                        }}
                        activeOpacity={0.7}
                      >
                        <ThemedText
                          className="text-center text-base font-uber-move-medium"
                          style={{ color: "#FFFFFF" }}
                        >
                          {isInviting ? "Sending..." : "Send Invite"}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Members List */}
            <View className="mb-4">
              <ThemedText className="text-lg font-uber-move-medium mb-3">
                Members ({members.length})
              </ThemedText>

              {members.length === 0 ? (
                <View
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor: themedColors.border,
                  }}
                >
                  <Text
                    className="text-sm font-lato-regular text-center"
                    style={{ color: themedColors.secondaryText }}
                  >
                    No members yet
                  </Text>
                </View>
              ) : (
                members.map(renderMemberItem)
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {isInviting && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
};

export default ResidenceDetailsScreen;

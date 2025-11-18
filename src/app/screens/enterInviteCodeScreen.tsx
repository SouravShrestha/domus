import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  searchInviteCode,
  acceptResidenceInvitation,
  rejectResidenceInvitation,
} from "@/api/residence.service";
import { useAuth } from "@/contexts/authContext";
import { router } from "expo-router";
import ArrowIcon from "@/components/icons/ArrowIcon";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import ResidenceInviteDetailsBottomSheet, {
  ResidenceInviteDetailsBottomSheetRef,
} from "@/components/widgets/ResidenceInviteDetailsBottomSheet";
import { InviteResponse } from "@/types/api/response/invite";
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import BottomSheet from "@gorhom/bottom-sheet";

const EnterInviteCodeScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null);
  const { profile, user } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCodeSubmit = useCallback(
    async (code: string) => {
      if (!profile?.phone) {
        console.error("User phone number not available");
        showErrorToast("Phone number is required to search invite codes");
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await searchInviteCode(code, profile.phone);
        if (error) {
          throw new Error(error.message);
        } else if (data) {
          setInviteData(data);
          bottomSheetRef.current?.expand();
        }
      } catch {
        showErrorToast("Invalid invite code");
      } finally {
        setIsLoading(false);
      }
    },
    [profile?.phone]
  );

  const handleAcceptInvite = useCallback(async () => {
    if (!inviteData || !user?.id || !profile?.phone) {
      showErrorToast("Missing required information");
      return;
    }

    setIsActionLoading(true);
    try {
      const { data, error } = await acceptResidenceInvitation(
        inviteData.id,
        user.id,
        profile.phone
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        showSuccessToast("Invitation accepted successfully!");
        bottomSheetRef.current?.collapse();
        setInviteData(null);
        setCode("");
        // Navigate to home or refresh the app
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    } finally {
      setIsActionLoading(false);
    }
  }, [inviteData, user?.id, profile?.phone]);

  const handleRejectInvite = useCallback(async () => {
    if (!inviteData || !profile?.phone) {
      showErrorToast("Missing required information");
      return;
    }

    setIsActionLoading(true);
    try {
      const { data, error } = await rejectResidenceInvitation(
        inviteData.id,
        profile.phone
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        showSuccessToast("Invitation declined");
        bottomSheetRef.current?.close();
        setInviteData(null);
        setCode("");
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to decline invitation"
      );
    } finally {
      setIsActionLoading(false);
    }
  }, [inviteData, profile?.phone]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
        onPress={() => {
          Keyboard.dismiss();
        }}
      />
    ),
    []
  );

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          className="flex-1"
          style={{ paddingBottom: insets.bottom, paddingTop: insets.top + 4 }}
        >
          <View className="px-6 pt-0">
            <View className="flex-row items-center gap-x-1 justify-start px-0">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-start justify-center pt-0.5"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ transform: [{ rotate: "0deg" }] }}
              >
                <ArrowIcon width={28} height={28} stroke={themedColors.text} />
              </TouchableOpacity>
            </View>

            <ThemedText className="text-2xl font-uber-move-medium tracking-wider mt-4 mx-1.5">
              Only one step away from getting your invite!
            </ThemedText>
            <View className="flex-row items-center justify-between px-1 w-full mt-8">
              <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider">
                Enter your unique invite code to get your invite.
              </ThemedTextSecondary>
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={setCode}
              placeholder="XXXXXXX"
              placeholderTextColor={themedColors.placeholderText}
              className="text-base font-uber-move-medium rounded-md px-4 border mt-4 tracking-widest"
              style={{
                height: 50,
                fontSize: 20,
                color: themedColors.text,
                backgroundColor: themedColors.inputBackground,
                borderColor: themedColors.border,
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              onSubmitEditing={() => handleCodeSubmit(code)}
              returnKeyType="search"
            />

            <TouchableOpacity
              onPress={() => handleCodeSubmit(code)}
              disabled={isLoading || code.trim().length === 0}
              className="p-4 rounded-lg items-center mt-8"
              style={{
                backgroundColor: themedColors.buttonBackground,
                opacity: isLoading || code.trim().length === 0 ? 0.6 : 1,
              }}
            >
              <Text
                className="text-base font-uber-move-medium tracking-wider"
                style={{ color: themedColors.buttonText }}
              >
                Fetch Invite
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {isLoading && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
      <Portal hostName="global">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          enableHandlePanningGesture={true}
          onChange={(index) => setBottomSheetIndex(index)}
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          containerStyle={{
            paddingTop: 0,
            marginTop: 0,
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1"
            style={{ backgroundColor: themedColors.modal }}
          >
            <ResidenceInviteDetailsBottomSheet
              invite={inviteData}
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
              isLoading={isActionLoading}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default EnterInviteCodeScreen;

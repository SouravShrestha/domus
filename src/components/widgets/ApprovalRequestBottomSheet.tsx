import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import { View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/authContext";
import {
  getWalkInLogById,
  approveWalkInEntry,
  rejectWalkInEntry,
} from "@/api/services/walkInVisitor.service";
import { WalkInVisitorLogWithDetails } from "@/types/models/visitor";
import { MotiView } from "moti";
import PhoneIcon from "../icons/PhoneIcon";
import basicColors from "@/themes/colors";
import { CheckIcon, CrossCircleIcon } from "../icons";
import LottieView from "lottie-react-native";
import successAnimation from "@/assets/animations/check-success.json";

export interface ApprovalRequestBottomSheetRef {
  open: (logId: string) => void;
  close: () => void;
}

interface ApprovalRequestBottomSheetProps {
  onComplete?: () => void;
}

const ApprovalRequestBottomSheet = forwardRef<
  ApprovalRequestBottomSheetRef,
  ApprovalRequestBottomSheetProps
>(({ onComplete }, ref) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [walkInLog, setWalkInLog] =
    useState<WalkInVisitorLogWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const SkeletonContent = () => (
    <View className="w-full">
      {/* Header Skeleton */}
      <View className="flex-row items-center mb-6">
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: themedColors.border,
            marginRight: 16,
          }}
        />
        <View className="flex-1">
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
            style={{
              width: "60%",
              height: 20,
              borderRadius: 4,
              backgroundColor: themedColors.border,
              marginBottom: 8,
            }}
          />
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
            style={{
              width: "40%",
              height: 14,
              borderRadius: 4,
              backgroundColor: themedColors.border,
            }}
          />
        </View>
      </View>

      {/* Details Skeleton */}
      <View
        className="rounded-lg mb-6 overflow-hidden border"
        style={{
          borderColor: themedColors.border,
          backgroundColor: themedColors.cardBackground,
        }}
      >
        {[1, 2, 3].map((item, index) => (
          <View
            key={item}
            className={
              "flex-row items-center p-4 border-b" +
              (index === 2 ? " border-b-0" : "")
            }
            style={{ borderColor: themedColors.border }}
          >
            <MotiView
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: themedColors.border,
                marginRight: 14,
              }}
            />
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 1000,
                  loop: true,
                }}
                style={{
                  width: "30%",
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: themedColors.border,
                  marginBottom: 6,
                }}
              />
              <MotiView
                from={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 1000,
                  loop: true,
                }}
                style={{
                  width: "70%",
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: themedColors.border,
                }}
              />
            </View>
          </View>
        ))}
        {/* Last Item separate to avoid border bottom if needed, or just keep simple loop */}
      </View>

      {/* Buttons Skeleton */}
      <View className="flex-row gap-3">
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 8,
            backgroundColor: themedColors.border,
          }}
        />
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 8,
            backgroundColor: themedColors.border,
          }}
        />
      </View>
    </View>
  );

  const loadWalkInLog = useCallback(async (logId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await getWalkInLogById(logId);
      if (data) {
        setWalkInLog(data);
        // We do not set isSuccess(true) here anymore, to show details for already approved requests
      } else {
        Alert.alert("Error", error?.message || "Failed to load request");
        bottomSheetRef.current?.close();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message || "Failed to load request");
      } else {
        Alert.alert("Error", "Failed to load request");
      }
      bottomSheetRef.current?.close();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    open: (logId: string) => {
      setIsSuccess(false); // Reset success state on open
      loadWalkInLog(logId);
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
      setWalkInLog(null);
      setIsSuccess(false);
    },
  }));

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.5}
    />
  );

  const handleApprove = async () => {
    if (!walkInLog || !profile) return;

    setIsProcessing(true);
    try {
      const { error } = await approveWalkInEntry(
        walkInLog.id,
        profile.id,
        walkInLog.residence_id,
        walkInLog.visitor_name
      );

      if (error) {
        Alert.alert("Error", error.message || "Failed to approve entry");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        bottomSheetRef.current?.close();
        onComplete?.();
        // Reset state after closing animation
        setTimeout(() => {
          setWalkInLog(null);
          setIsSuccess(false);
        }, 500);
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message || "Failed to approve entry");
      } else {
        Alert.alert("Error", "Failed to approve entry");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!walkInLog || !profile) return;

    Alert.alert("Deny Entry", `Deny entry for ${walkInLog.visitor_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deny",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true);
          try {
            const { error } = await rejectWalkInEntry(
              walkInLog.id,
              profile.id,
              walkInLog.residence_id,
              walkInLog.visitor_name
            );

            if (error) {
              Alert.alert("Error", error.message || "Failed to deny entry");
              return;
            }

            bottomSheetRef.current?.close();
            setWalkInLog(null);
            onComplete?.();
          } catch (error: unknown) {
            if (error instanceof Error) {
              Alert.alert("Error", error.message || "Failed to deny entry");
            } else {
              Alert.alert("Error", "Failed to deny entry");
            }
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{
        backgroundColor: themedColors.modal,
      }}
      handleIndicatorStyle={{
        backgroundColor: themedColors.accent,
      }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ backgroundColor: themedColors.modal }}>
        <View
          className="px-5"
          style={{
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            minHeight: 200, // Ensure minimum height for smooth transitions
          }}
        >
          {isLoading ? (
            <SkeletonContent />
          ) : isSuccess ? (
            <View className="items-center justify-center py-8">
              <View style={{ width: 150, height: 150, marginBottom: 16 }}>
                <LottieView
                  source={successAnimation}
                  autoPlay
                  loop={false}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <ThemedText className="text-2xl font-uber-move-bold text-center">
                Entry Approved
              </ThemedText>
              <ThemedTextSecondary className="text-base text-center mt-2 px-6">
                {walkInLog?.visitor_name || "Visitor"} has been authorized to
                enter
              </ThemedTextSecondary>
            </View>
          ) : walkInLog ? (
            <>
              {/* Header */}
              <View className="mb-8">
                <ThemedText className="text-2xl font-uber-move-medium">
                  {walkInLog.visitor_name} is waiting for your approval at the
                  gate
                </ThemedText>
              </View>

              {/* Details */}
              <View className="mb-8 gap-y-6">
                {/* Phone */}
                {walkInLog.visitor_phone && (
                  <View className="flex-row items-center gap-x-3">
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: themedColors.border + "40" }}
                    >
                      <PhoneIcon size={16} color={themedColors.text} />
                    </View>
                    <ThemedText className="text-base font-uber-move-medium tracking-wider">
                      {walkInLog.visitor_phone}
                    </ThemedText>
                  </View>
                )}

                {/* Purpose */}
                {walkInLog.purpose && (
                  <View className="gap-y-2">
                    <ThemedTextSecondary className="text-sm font-uber-move-medium">
                      Purpose of visit
                    </ThemedTextSecondary>
                    <ThemedText className="text-base font-uber-move-medium">
                      {walkInLog.purpose}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Footer Section: Actions or Status */}
              {walkInLog.approval_status === "pending" ? (
                <View className="flex-row justify-center" style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleDeny}
                    disabled={isProcessing}
                    className="flex-row py-4 rounded-md items-center justify-center gap-x-3 w-1/2"
                    style={{
                      borderColor: basicColors.red,
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                    activeOpacity={0.7}
                  >
                    <CrossCircleIcon
                      width={20}
                      height={20}
                      color={basicColors.red}
                    />
                    <ThemedText
                      className="font-uber-move-bold text-base"
                      style={{ color: basicColors.red }}
                    >
                      Deny
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleApprove}
                    disabled={isProcessing}
                    className="flex-row py-4 rounded-md items-center justify-center w-1/2"
                    style={{
                      backgroundColor: themedColors.accent,
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator
                        size="small"
                        color={themedColors.textOnAccent}
                      />
                    ) : (
                      <View className="flex-row items-center flex-1 justify-center gap-x-2">
                        <CheckIcon
                          width={20}
                          height={20}
                          color={themedColors.textOnAccent}
                        />
                        <ThemedText
                          className="font-uber-move-bold text-base"
                          style={{ color: themedColors.textOnAccent }}
                        >
                          Approve
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : walkInLog.approval_status === "approved" ? (
                <View className="flex-row items-center justify-center p-4 rounded-lg">
                  <CheckIcon width={16} height={16} color={basicColors.green} />
                  <ThemedText
                    className="font-uber-move-medium text-base ml-3"
                    style={{ color: basicColors.green }}
                  >
                    This entry has already been approved
                  </ThemedText>
                </View>
              ) : walkInLog.approval_status === "rejected" ? (
                <View className="flex-row items-center justify-center p-4 rounded-lg">
                  <CrossCircleIcon
                    width={24}
                    height={24}
                    color={basicColors.red}
                  />
                  <ThemedText
                    className="font-uber-move-bold text-lg ml-3"
                    style={{ color: basicColors.red }}
                  >
                    This entry has been denied
                  </ThemedText>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

ApprovalRequestBottomSheet.displayName = "ApprovalRequestBottomSheet";

export default ApprovalRequestBottomSheet;

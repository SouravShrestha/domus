import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import {
  getWalkInLogById,
  approveWalkInEntry,
  rejectWalkInEntry,
} from "@/api/services/walkInVisitor.service";
import { WalkInVisitorLogWithDetails } from "@/types/models/visitor";
import { Ionicons } from "@expo/vector-icons";

const ApprovalRequestScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useAuth();

  const logId = params.logId as string;

  const [walkInLog, setWalkInLog] =
    useState<WalkInVisitorLogWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadWalkInLog();
  }, [logId]);

  const loadWalkInLog = async () => {
    if (!logId) {
      Alert.alert("Error", "Invalid approval request");
      router.back();
      return;
    }

    try {
      const { data, error } = await getWalkInLogById(logId);
      if (data) {
        setWalkInLog(data);
      } else {
        Alert.alert(
          "Error",
          error?.message || "Failed to load approval request"
        );
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load approval request");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!walkInLog || !profile) return;

    Alert.alert("Approve Entry", `Allow ${walkInLog.visitor_name} to enter?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
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

            Alert.alert(
              "Entry Approved",
              "The visitor has been allowed to enter.",
              [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]
            );
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to approve entry");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
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

            Alert.alert("Entry Denied", "The visitor has been denied entry.", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to deny entry");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <ThemedStatusBar />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themedColors.accent} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!walkInLog) {
    return null;
  }

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={themedColors.text} />
          </TouchableOpacity>
          <ThemedText className="text-2xl font-uber-move-medium">
            Visitor Approval
          </ThemedText>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Alert Banner */}
          <View
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: `${themedColors.accent}20` }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="alert-circle"
                size={24}
                color={themedColors.accent}
                style={{ marginRight: 12 }}
              />
              <View className="flex-1">
                <Text
                  className="text-base font-uber-move-medium"
                  style={{ color: themedColors.text }}
                >
                  Approval Required
                </Text>
                <Text
                  className="text-sm font-lato-regular mt-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  A visitor is waiting at the gate
                </Text>
              </View>
            </View>
          </View>

          {/* Visitor Details */}
          <View
            className="p-6 rounded-xl mb-6"
            style={{ backgroundColor: themedColors.card }}
          >
            <Text
              className="text-sm font-lato-regular mb-4"
              style={{ color: themedColors.secondaryText }}
            >
              Visitor Information
            </Text>

            <View className="mb-4">
              <Text
                className="text-sm font-lato-regular mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                Name
              </Text>
              <ThemedText className="text-lg font-uber-move-medium">
                {walkInLog.visitor_name}
              </ThemedText>
            </View>

            {walkInLog.visitor_phone && (
              <View className="mb-4">
                <Text
                  className="text-sm font-lato-regular mb-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  Phone Number
                </Text>
                <ThemedText className="text-base font-uber-move-medium">
                  {walkInLog.visitor_phone}
                </ThemedText>
              </View>
            )}

            {walkInLog.purpose && (
              <View className="mb-4">
                <Text
                  className="text-sm font-lato-regular mb-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  Purpose of Visit
                </Text>
                <ThemedText className="text-base font-uber-move-medium">
                  {walkInLog.purpose}
                </ThemedText>
              </View>
            )}

            {walkInLog.vehicle_number && (
              <View className="mb-4">
                <Text
                  className="text-sm font-lato-regular mb-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  Vehicle Number
                </Text>
                <ThemedText className="text-base font-uber-move-medium">
                  {walkInLog.vehicle_number}
                </ThemedText>
              </View>
            )}

            <View>
              <Text
                className="text-sm font-lato-regular mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                Request Time
              </Text>
              <ThemedText className="text-base font-uber-move-medium">
                {formatTime(walkInLog.entry_time)}
              </ThemedText>
            </View>
          </View>

          {/* Guard Information */}
          {walkInLog.recorded_by_guard && (
            <View
              className="p-6 rounded-xl mb-6"
              style={{ backgroundColor: themedColors.card }}
            >
              <Text
                className="text-sm font-lato-regular mb-4"
                style={{ color: themedColors.secondaryText }}
              >
                Requested By
              </Text>

              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themedColors.background }}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={themedColors.accent}
                  />
                </View>
                <View>
                  <ThemedText className="text-base font-uber-move-medium">
                    {walkInLog.recorded_by_guard.user?.name || "Security Guard"}
                  </ThemedText>
                  {walkInLog.recorded_by_guard.user?.phone && (
                    <Text
                      className="text-sm font-lato-regular"
                      style={{ color: themedColors.secondaryText }}
                    >
                      {walkInLog.recorded_by_guard.user.phone}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View
          className="px-4 pb-4 pt-2"
          style={{ backgroundColor: themedColors.background }}
        >
          <TouchableOpacity
            onPress={handleApprove}
            disabled={isProcessing}
            className="py-4 rounded-xl mb-3"
            style={{
              backgroundColor: themedColors.accent,
              opacity: isProcessing ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color={themedColors.textOnAccent} />
            ) : (
              <Text
                className="text-center text-base font-uber-move-medium"
                style={{ color: themedColors.textOnAccent }}
              >
                Approve Entry
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReject}
            disabled={isProcessing}
            className="py-4 rounded-xl border"
            style={{
              borderColor: "#EF4444",
              opacity: isProcessing ? 0.6 : 1,
            }}
            activeOpacity={0.7}
          >
            <Text
              className="text-center text-base font-uber-move-medium"
              style={{ color: "#EF4444" }}
            >
              Deny Entry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ApprovalRequestScreen;

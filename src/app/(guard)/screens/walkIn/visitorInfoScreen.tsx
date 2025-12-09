import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { useGuard } from "@contexts/guardContext";
import { createWalkInEntry } from "@/api/services/walkInVisitor.service";
import { Ionicons } from "@expo/vector-icons";

const VisitorInfoScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { guardInfo } = useGuard();
  const router = useRouter();
  const params = useLocalSearchParams();

  const residenceId = params.residenceId as string;
  const residenceName = params.residenceName as string;
  const flatNumber = params.flatNumber as string;
  const block = params.block as string;

  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!visitorName.trim()) {
      Alert.alert("Required Field", "Please enter visitor name");
      return false;
    }
    return true;
  };

  const handleAllowEntry = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await createWalkInEntry({
        residence_id: residenceId,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim() || undefined,
        purpose: purpose.trim() || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        recorded_by_guard_id: guardInfo?.id,
        approval_status: "not_required",
      });

      if (error) {
        Alert.alert("Error", error.message || "Failed to create entry");
        return;
      }

      if (data) {
        router.replace({
          pathname: "/(guard)/screens/walkIn/entryConfirmationScreen",
          params: {
            logId: data.id,
            visitorName: data.visitor_name,
            residenceName,
            flatNumber,
            block,
            tempPassCode: data.temp_pass_code || "",
          },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestApproval = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await createWalkInEntry({
        residence_id: residenceId,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim() || undefined,
        purpose: purpose.trim() || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        recorded_by_guard_id: guardInfo?.id,
        approval_status: "pending",
      });

      if (error) {
        Alert.alert("Error", error.message || "Failed to request approval");
        return;
      }

      if (data) {
        Alert.alert(
          "Approval Requested",
          "Resident has been notified. Please wait for approval.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to request approval");
    } finally {
      setIsLoading(false);
    }
  };

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
          <View className="flex-1">
            <ThemedText className="text-2xl font-uber-move-medium">
              Visitor Information
            </ThemedText>
            <Text
              className="text-sm font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              {residenceName} ({block ? `${block}-` : ""}
              {flatNumber})
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Visitor Name - Required */}
          <View className="mb-4">
            <Text
              className="text-sm font-uber-move-medium mb-2"
              style={{ color: themedColors.text }}
            >
              Visitor Name <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              value={visitorName}
              onChangeText={setVisitorName}
              placeholder="Enter visitor name"
              placeholderTextColor={themedColors.secondaryText}
              className="px-4 py-3 rounded-xl font-lato-regular text-base"
              style={{
                backgroundColor: themedColors.card,
                color: themedColors.text,
              }}
              autoCapitalize="words"
            />
          </View>

          {/* Visitor Phone - Optional but recommended */}
          <View className="mb-4">
            <Text
              className="text-sm font-uber-move-medium mb-2"
              style={{ color: themedColors.text }}
            >
              Phone Number{" "}
              <Text style={{ color: themedColors.secondaryText }}>
                (recommended)
              </Text>
            </Text>
            <TextInput
              value={visitorPhone}
              onChangeText={setVisitorPhone}
              placeholder="Enter phone number"
              placeholderTextColor={themedColors.secondaryText}
              className="px-4 py-3 rounded-xl font-lato-regular text-base"
              style={{
                backgroundColor: themedColors.card,
                color: themedColors.text,
              }}
              keyboardType="phone-pad"
            />
          </View>

          {/* Purpose - Optional */}
          <View className="mb-4">
            <Text
              className="text-sm font-uber-move-medium mb-2"
              style={{ color: themedColors.text }}
            >
              Purpose of Visit{" "}
              <Text style={{ color: themedColors.secondaryText }}>
                (optional)
              </Text>
            </Text>
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g., Personal visit, Delivery, etc."
              placeholderTextColor={themedColors.secondaryText}
              className="px-4 py-3 rounded-xl font-lato-regular text-base"
              style={{
                backgroundColor: themedColors.card,
                color: themedColors.text,
              }}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Vehicle Number - Optional */}
          <View className="mb-6">
            <Text
              className="text-sm font-uber-move-medium mb-2"
              style={{ color: themedColors.text }}
            >
              Vehicle Number{" "}
              <Text style={{ color: themedColors.secondaryText }}>
                (optional)
              </Text>
            </Text>
            <TextInput
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="e.g., DL 01 AB 1234"
              placeholderTextColor={themedColors.secondaryText}
              className="px-4 py-3 rounded-xl font-lato-regular text-base"
              style={{
                backgroundColor: themedColors.card,
                color: themedColors.text,
              }}
              autoCapitalize="characters"
            />
          </View>

          {/* Info Box */}
          <View
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: themedColors.card }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color={themedColors.accent}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text
                className="flex-1 text-sm font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                You can either allow entry immediately or request approval from
                the resident.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View
          className="px-4 pb-4 pt-2"
          style={{ backgroundColor: themedColors.background }}
        >
          <TouchableOpacity
            onPress={handleAllowEntry}
            disabled={isLoading}
            className="py-4 rounded-xl mb-3"
            style={{
              backgroundColor: themedColors.accent,
              opacity: isLoading ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={themedColors.textOnAccent} />
            ) : (
              <Text
                className="text-center text-base font-uber-move-medium"
                style={{ color: themedColors.textOnAccent }}
              >
                Allow Entry Now
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRequestApproval}
            disabled={isLoading}
            className="py-4 rounded-xl border"
            style={{
              borderColor: themedColors.border,
              opacity: isLoading ? 0.6 : 1,
            }}
            activeOpacity={0.7}
          >
            <Text
              className="text-center text-base font-uber-move-medium"
              style={{ color: themedColors.text }}
            >
              Request Approval
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default VisitorInfoScreen;

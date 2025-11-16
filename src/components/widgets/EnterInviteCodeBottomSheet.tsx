import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface EnterInviteCodeBottomSheetProps {
  onCodeSubmit: (code: string) => void;
  isLoading?: boolean;
  onClose: () => void;
}

const EnterInviteCodeBottomSheet: React.FC<EnterInviteCodeBottomSheetProps> = ({
  onCodeSubmit,
  isLoading = false,
  onClose,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    const trimmedCode = code.trim();
    if (trimmedCode.length > 0) {
      onCodeSubmit(trimmedCode);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <View className="px-6 pt-6">
          <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-2">
            Enter Invite Code
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mb-6">
            Please enter your unique invite code to view invitation details.
          </ThemedTextSecondary>

          <View
            className="rounded-lg border px-4 mb-4"
            style={{
              backgroundColor: themedColors.inputBackground,
              borderColor: themedColors.border,
            }}
          >
            <BottomSheetTextInput
              value={code}
              onChangeText={setCode}
              placeholder="XXXXXXXX"
              placeholderTextColor={themedColors.placeholderText}
              className="text-base font-lato-regular"
              style={{
                height: 48,
                fontSize: 16,
                color: themedColors.text,
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || code.trim().length === 0}
            className="p-4 rounded-lg items-center"
            style={{
              backgroundColor: themedColors.buttonBackground,
              opacity: isLoading || code.trim().length === 0 ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={themedColors.buttonText} />
            ) : (
              <Text
                className="text-base font-uber-move-medium tracking-wider"
                style={{ color: themedColors.buttonText }}
              >
                Fetch Invite
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EnterInviteCodeBottomSheet;

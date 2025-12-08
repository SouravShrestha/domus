import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from '@themes/themedComponents';
import { useTheme } from '@contexts/themeContext';
import { useResidence } from '@contexts/residenceContext';
import { useAuth } from '@contexts/authContext';
import { createGuardInvite } from '@/api/services/guard.service';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { formatPhoneForDisplay } from '@/utils/phoneHelpers';

const AddGuardScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  console.log('Current Residence:', currentResidence);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Guard name is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGuard = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentResidence?.society_id) {
      showErrorToast('No society selected');
      return;
    }

    if (!user?.id) {
      showErrorToast('User not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await createGuardInvite(
        currentResidence.society_id,
        phone.trim(),
        name.trim(),
        user.id
      );

      if (error) {
        showErrorToast(error.message);
        return;
      }

      showSuccessToast(
        `Guard invite sent to ${formatPhoneForDisplay(phone.trim())}`
      );
      router.back();
    } catch (error) {
      showErrorToast('Failed to add guard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-4 py-3">
              <ThemedText className="text-2xl font-uber-move-medium mb-2">
                Add Security Guard
              </ThemedText>
              <Text
                className="text-sm font-lato-regular"
                style={{ color: themedColors.secondaryText }}
              >
                Invite a security guard to manage gate access
              </Text>
            </View>

            <View className="px-4 py-4">
              <View className="mb-4">
                <Text
                  className="text-sm font-uber-move-medium mb-2"
                  style={{ color: themedColors.text }}
                >
                  Guard Name
                </Text>
                <TextInput
                  className="px-4 py-3 rounded-xl font-lato-regular"
                  style={{
                    backgroundColor: themedColors.cardBackground,
                    color: themedColors.text,
                  }}
                  placeholder="Enter guard's full name"
                  placeholderTextColor={themedColors.secondaryText}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                  editable={!isLoading}
                />
                {errors.name && (
                  <Text
                    className="text-xs font-lato-regular mt-1 ml-1"
                    style={{ color: themedColors.error }}
                  >
                    {errors.name}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text
                  className="text-sm font-uber-move-medium mb-2"
                  style={{ color: themedColors.text }}
                >
                  Phone Number
                </Text>
                <TextInput
                  className="px-4 py-3 rounded-xl font-lato-regular"
                  style={{
                    backgroundColor: themedColors.cardBackground,
                    color: themedColors.text,
                  }}
                  placeholder="Enter phone number"
                  placeholderTextColor={themedColors.secondaryText}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ''));
                    if (errors.phone) {
                      setErrors({ ...errors, phone: undefined });
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!isLoading}
                />
                {errors.phone && (
                  <Text
                    className="text-xs font-lato-regular mt-1 ml-1"
                    style={{ color: themedColors.error }}
                  >
                    {errors.phone}
                  </Text>
                )}
                <Text
                  className="text-xs font-lato-regular mt-2 ml-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  The guard will receive an invitation to join
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{ backgroundColor: themedColors.cardBackground }}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text
                    className="text-base font-uber-move-medium"
                    style={{ color: themedColors.text }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddGuard}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: isLoading
                      ? themedColors.accent + '80'
                      : themedColors.accent,
                  }}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={themedColors.textOnAccent} />
                  ) : (
                    <Text
                      className="text-base font-uber-move-medium"
                      style={{ color: themedColors.textOnAccent }}
                    >
                      Send Invite
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default AddGuardScreen;

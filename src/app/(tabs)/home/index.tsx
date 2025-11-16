import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, ThemedScrollView, ThemedStatusBar } from "@themes/themedComponents";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";

const Home: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { themedColors } = useTheme();

  const handleLogout = async () => {
    await signOut();
    router.replace(ROUTES.AUTH.WELCOME);
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ThemedScrollView className="flex-1">
          <View className="px-4 py-6">
            <ThemedText className="text-2xl font-uber-move-bold mb-2">
              Welcome Home
            </ThemedText>
            {profile && (
              <ThemedText className="text-base font-lato-regular mb-6">
                {profile.name || user?.email}
              </ThemedText>
            )}
            
            <TouchableOpacity
              activeOpacity={0.8}
              className="rounded-lg px-4 py-3.5 items-center"
              onPress={handleLogout}
              style={{ backgroundColor: themedColors.buttonBackground }}
            >
              <ThemedText
                className="font-uber-move-medium tracking-wide text-base"
                style={{ color: themedColors.buttonText }}
              >
                Logout
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default Home;


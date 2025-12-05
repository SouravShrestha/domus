import React, { useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, ThemedScrollView, ThemedStatusBar } from "@themes/themedComponents";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import ResidenceSwitcher, {
  ResidenceSwitcherSheet,
  ResidenceSwitcherSheetRef,
} from "@components/widgets/ResidenceSwitcher";
import { Portal } from "@gorhom/portal";

const Home: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { themedColors } = useTheme();
  const residenceSwitcherSheetRef = useRef<ResidenceSwitcherSheetRef>(null);

  const handleLogout = async () => {
    await signOut();
    router.replace(ROUTES.AUTH.WELCOME);
  };

  const handleOpenResidenceSwitcher = () => {
    residenceSwitcherSheetRef.current?.open();
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ThemedScrollView className="flex-1">
          <View className="px-4 py-3">
            <ResidenceSwitcher onPress={handleOpenResidenceSwitcher} />
          </View>
        </ThemedScrollView>
      </SafeAreaView>
      <Portal name="global">
        <ResidenceSwitcherSheet ref={residenceSwitcherSheetRef} />
      </Portal>
    </ThemedView>
  );
};

export default Home;


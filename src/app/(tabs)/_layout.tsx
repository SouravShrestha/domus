import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@contexts/authContext";
import { fetchUserMemberships } from "@api/services/user.service";
import Loader from "@components/widgets/Loader";
import { ThemedView, ThemedText, ThemedStatusBar } from "@themes/themedComponents";
import { SafeAreaView } from "react-native-safe-area-context";
import NoMembershipScreen from "@screens/noMembership";
import { ROUTES } from "@constants/routes";

const TabsLayout: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [hasMembership, setHasMembership] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkMembership = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await fetchUserMemberships(user.id);

      if (error) {
        console.error("Error fetching memberships:", error);
        setHasMembership(false);
      } else {
        setHasMembership(data && data.length > 0);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
      setHasMembership(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      checkMembership();
    } else if (!isAuthLoading && !user) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [user, isAuthLoading, router, checkMembership]);

  if (isAuthLoading || isLoading) {
    return <Loader />;
  }

  if (hasMembership === false) {
    return <NoMembershipScreen />;
  }

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ThemedText className="text-xl font-uber-move-medium">
            Tabs will be rendered here
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default TabsLayout;


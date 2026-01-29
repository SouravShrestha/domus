import React, { useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";

import { ROUTES } from "@constants/routes";
import { HomeIcon } from "@/components/icons";
import Loader from "@/components/widgets/Loader";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const GuardTabsLayout: React.FC = () => {
  const { themedColors } = useTheme();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    activeViewMode,
  } = useAuth();
  const router = useRouter();

  const iconSize = 20;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [user, isAuthLoading, isAuthenticated, activeViewMode, router]);

  if (isAuthLoading) {
    return <Loader />;
  }

  const tabs: TabItem[] = [
    { name: "home/index", title: "Home", Icon: HomeIcon },
  ];

  return (
    <Animated.View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themedColors.accent,
          tabBarInactiveTintColor: themedColors.inactiveTint,
          tabBarStyle: {
            backgroundColor: themedColors.background,
            borderTopColor: themedColors.lightBorder,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 3,
            fontFamily: "UberMoveMedium",
            letterSpacing: 0.2,
            width: "100%",
          },
        }}
      >
        {tabs.map(({ name, title, Icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color }) => (
                <Icon color={color} width={iconSize} height={iconSize} />
              ),
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...{ ...props, ref: undefined }}
                  onPress={(event) => props.onPress?.(event)}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </Animated.View>
  );
};

export default GuardTabsLayout;

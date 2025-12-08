import React, { useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { useResidence } from "@contexts/residenceContext";

import DashboardIcon from "@components/icons/DashboardIcon";
import UsersIcon from "@components/icons/UsersIcon";
import ShieldIcon from "@components/icons/ShieldIcon";
import ProfileIcon from "@components/icons/ProfileIcon";

import Loader from "@components/widgets/Loader";
import { ROUTES } from "@constants/routes";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const ManagerTabsLayout: React.FC = () => {
  const { themedColors } = useTheme();
  const { user, isAuthenticated, isLoading: isAuthLoading, userType } = useAuth();
  const { isLoading, loadResidences } = useResidence();
  const router = useRouter();

  const iconSize = 20;

  useEffect(() => {
    if (!isAuthLoading && user?.id && userType === "manager") {
      loadResidences(user.id, "manager");
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [user, isAuthLoading, isAuthenticated, userType, router, loadResidences]);

  if (isAuthLoading || isLoading) {
    return <Loader />;
  }

  const tabs: TabItem[] = [
    { name: "dashboard/index", title: "Dashboard", Icon: DashboardIcon },
    { name: "residents/index", title: "Residences", Icon: UsersIcon },
    { name: "guards/index", title: "Guards", Icon: ShieldIcon },
    { name: "profile/index", title: "Account", Icon: ProfileIcon },
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
            borderTopColor: themedColors.border,
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

export default ManagerTabsLayout;


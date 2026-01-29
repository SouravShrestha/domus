import React, { useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { useResidence } from "@contexts/residenceContext";

import PeopleIcon from "@components/icons/PeopleIcon";

import { ROUTES } from "@constants/routes";
import {
  AdminDashboardIcon,
  AdminServicesIcon,
  BoltIcon,
  BoltSlashIcon,
  DoorOpenIcon,
  DoorWindowIcon,
  HeartIcon,
  HomeIcon,
  KeyHomeIcon,
  KeyIcon,
  LightIcon,
  MenuCategoryIcon,
  ProfileIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/icons";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import Loader from "@/components/widgets/Loader";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const ManagerTabsLayout: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    userType,
  } = useAuth();
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
    { name: "dashboard/index", title: "Home", Icon: HomeIcon },
    { name: "services/index", title: "Services", Icon: MenuCategoryIcon },
    { name: "residences/index", title: "Residences", Icon: DoorWindowIcon },
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

export default ManagerTabsLayout;

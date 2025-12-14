import React, { useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { useResidence } from "@contexts/residenceContext";

import HomeIcon from "@components/icons/HomeIcon";
import ActivityIcon from "@components/icons/ActivityIcon";
import VisitorsIcon from "@components/icons/VisitorsIcon";

import Loader from "@components/widgets/Loader";
import { ROUTES } from "@constants/routes";
import NoMembershipScreen from "@screens/membership/noMembership";
import { MenuCategoryIcon } from "@/components/icons";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const TabsLayout: React.FC = () => {
  const { themedColors } = useTheme();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    userType,
  } = useAuth();
  const { isLoading, hasMembership, loadResidences } = useResidence();
  const router = useRouter();

  const iconSize = 20;

  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      loadResidences(user.id, userType);
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [user, isAuthLoading, isAuthenticated, userType, router, loadResidences]);

  if (isAuthLoading || isLoading) {
    return <Loader />;
  }

  if (!hasMembership) {
    return <NoMembershipScreen />;
  }

  const tabs: TabItem[] = [
    { name: "home/index", title: "Home", Icon: HomeIcon },
    { name: "services/index", title: "Services", Icon: MenuCategoryIcon },
    { name: "visitors/index", title: "Visitors", Icon: VisitorsIcon },
    { name: "activities/index", title: "Activity", Icon: ActivityIcon },
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

export default TabsLayout;

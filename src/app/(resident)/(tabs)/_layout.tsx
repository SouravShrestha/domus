import React, { useEffect } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";

import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { useResidence } from "@contexts/residenceContext";

import HomeIcon from "@components/icons/HomeIcon";
import ActivityIcon from "@components/icons/ActivityIcon";
import ProfileIcon from "@components/icons/ProfileIcon";
import ServicesIcon from "@components/icons/ServicesIcon";

import Loader from "@components/widgets/Loader";
import { ROUTES } from "@constants/routes";
import NoMembershipScreen from "@screens/membership/noMembership";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const TabsLayout: React.FC = () => {
  const { themedColors } = useTheme();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading, hasMembership, loadResidences } = useResidence();
  const router = useRouter();

  const iconSize = 20;

  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      loadResidences(user.id);
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [user, isAuthLoading, isAuthenticated, router, loadResidences]);

  if (isAuthLoading || isLoading) {
    return <Loader />;
  }

  if (!hasMembership) {
    return <NoMembershipScreen />;
  }

  const tabs: TabItem[] = [
    { name: "home/index", title: "Home", Icon: HomeIcon },
    { name: "services/index", title: "Services", Icon: ServicesIcon },
    { name: "activities/index", title: "Activities", Icon: ActivityIcon },
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

export default TabsLayout;


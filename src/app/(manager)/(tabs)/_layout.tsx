import React from "react";
import { Animated, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";

import { useTheme } from "@contexts/themeContext";

import DashboardIcon from "@components/icons/DashboardIcon";
import UsersIcon from "@components/icons/UsersIcon";
import ShieldIcon from "@components/icons/ShieldIcon";
import ProfileIcon from "@components/icons/ProfileIcon";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
}

const ManagerTabsLayout: React.FC = () => {
  const { themedColors } = useTheme();

  const iconSize = 20;

  const tabs: TabItem[] = [
    { name: "dashboard/index", title: "Dashboard", Icon: DashboardIcon },
    { name: "residents/index", title: "Residents", Icon: UsersIcon },
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


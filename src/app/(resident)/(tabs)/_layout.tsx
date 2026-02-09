import React, { useEffect, useRef } from "react";
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
import {
  MenuCategoryIcon,
  HouseFilledIcon,
  ExploreFilledIcon,
  VisitorFilledIcon,
} from "@/components/icons";

export interface TabItem {
  name: string;
  title: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
  ActiveIcon: React.FC<{ color: string; width: number; height: number }>;
}

const AnimatedTabIcon: React.FC<{
  focused: boolean;
  color: string;
  Icon: React.FC<{ color: string; width: number; height: number }>;
  ActiveIcon: React.FC<{ color: string; width: number; height: number }>;
  size: number;
  pressTrigger: number;
}> = ({ focused, color, Icon, ActiveIcon, size, pressTrigger }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pressTrigger > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 150,
        }),
      ]).start();
    }
  }, [pressTrigger, scaleAnim]);

  const IconComponent = focused ? ActiveIcon : Icon;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <IconComponent color={color} width={size} height={size} />
    </Animated.View>
  );
};

const TabsLayout: React.FC = () => {
  const { themedColors } = useTheme();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    activeViewMode,
  } = useAuth();
  const { isLoading, hasMembership, loadResidences } = useResidence();
  const router = useRouter();

  const iconSize = 20;
  const pressTriggers = useRef<{ [key: string]: number }>({}).current;

  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      loadResidences(user.id, activeViewMode === "manager");
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  }, [
    user,
    isAuthLoading,
    isAuthenticated,
    activeViewMode,
    router,
    loadResidences,
  ]);

  if (isAuthLoading || isLoading) {
    return <Loader />;
  }

  if (!hasMembership) {
    return <NoMembershipScreen />;
  }

  const tabs: TabItem[] = [
    {
      name: "home/index",
      title: "Home",
      Icon: HomeIcon,
      ActiveIcon: HouseFilledIcon,
    },
    {
      name: "services/index",
      title: "Services",
      Icon: MenuCategoryIcon,
      ActiveIcon: ExploreFilledIcon,
    },
    {
      name: "visitors/index",
      title: "Visitors",
      Icon: VisitorsIcon,
      ActiveIcon: VisitorFilledIcon,
    },
    {
      name: "activities/index",
      title: "Activity",
      Icon: ActivityIcon,
      ActiveIcon: ActivityIcon,
    },
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
        {tabs.map(({ name, title, Icon, ActiveIcon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color, focused }) => (
                <AnimatedTabIcon
                  focused={focused}
                  color={color}
                  Icon={Icon}
                  ActiveIcon={ActiveIcon}
                  size={iconSize}
                  pressTrigger={pressTriggers[name] || 0}
                />
              ),
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...{ ...props, ref: undefined }}
                  onPress={(event) => {
                    pressTriggers[name] = Date.now();
                    props.onPress?.(event);
                  }}
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

import React from "react";
import { View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedScrollView, ThemedView } from "@themes/themedComponents";
import SearchBar from "@components/widgets/SearchBar";
import AnimatedVerticalActionList from "@components/widgets/AnimatedVerticalActionList";
import ImageActionCardRow from "@components/widgets/ImageActionCardRow";
import CommunityCardGrid from "@components/widgets/ImageActionCardGrid";
import HelpSecurityCardRow from "@components/widgets/HelpSecurityCardRow";
import { QRIcon } from "@components/icons";

import {
  ServiceHomeImage,
  ServiceKeyImage,
  ServiceStaffImage,
  ServiceNoticeImage,
  ServiceMaintenanceImage,
  ServiceEventsImage,
  ServiceParkingImage,
  ServiceAmenityImage,
  ServiceMyBookingsImage,
  ServiceRulesImage,
  ServiceServiceRequestsImage,
  ServiceContactsImage,
} from "@assets/image-icons";

import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useRouter } from "expo-router";
import basicColors, { themeColors } from "@themes/colors";
import { ROUTES } from "@constants/routes";
import { PermissionKey } from "@/types/models/memberPermissions";

interface ServiceLink {
  label: string;
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  screen?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  requiredPermission?: PermissionKey;
}

const Services: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const { permissions, isOwner } = useResidence();
  const router = useRouter();
  const colors = themeColors[currentTheme];

  const checkPermissionAndExecute = (
    action: () => void,
    permission?: PermissionKey
  ) => {
    if (permission) {
      if (isOwner || (permissions && permissions[permission])) {
        action();
      } else {
        Alert.alert(
          "Access Denied",
          "You do not have permission to access this service."
        );
      }
    } else {
      action();
    }
  };

  const peopleAndRolesColor = basicColors.lightPink;

  const peopleAndRolesLinks = [
    {
      label: "manage\nfamily",
      image: ServiceHomeImage,
      imageSize: 36,
      imageBackgroundColor: peopleAndRolesColor,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_FAMILY),
      textColor: colors.text,
    },
    {
      label: "manage\ntenants",
      image: ServiceKeyImage,
      imageSize: 36,
      imageBackgroundColor: basicColors.gold,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_TENANTS),
      textColor: colors.text,
    },
    {
      label: "staff &\nworkers",
      image: ServiceStaffImage,
      imageSize: 36,
      imageBackgroundColor: basicColors.lightBlue,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_STAFF),
          "can_manage_staff"
        ),
      textColor: colors.text,
    },
  ];

  const myActionsColor = basicColors.lightGray;

  const myActionsLinks: ServiceLink[] = [
    {
      label: "add another\nresidence",
      icon: QRIcon,
      onPress: () => router.push(ROUTES.SCREENS.QR.SCANNER),
      backgroundColor: colors.cardBackground,
      iconColor: myActionsColor,
      iconBackgroundColor: myActionsColor + "50",
      textColor: colors.text,
    },
  ];

  const myCommunityLinks = [
    {
      label: "book\nparking",
      image: ServiceParkingImage,
      imageSize: 32,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.BOOK_PARKING),
    },
    {
      label: "book\namenity",
      image: ServiceAmenityImage,
      imageSize: 30,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.COMMUNITY.BOOK_AMENITY),
          "can_book_amenities"
        ),
    },
    {
      label: "my\nbookings",
      image: ServiceMyBookingsImage,
      imageSize: 32,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.COMMUNITY.MY_BOOKINGS),
          "can_book_amenities"
        ),
    },
    {
      label: "rules &\nguidelines",
      image: ServiceRulesImage,
      imageSize: 28,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.RULES_AND_GUIDELINES),
    },
    {
      label: "notice\nboard",
      image: ServiceNoticeImage,
      imageSize: 32,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.NOTICE_BOARD),
    },
    {
      label: "maintenace\nupdates",
      image: ServiceMaintenanceImage,
      imageSize: 32,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.MAINTENANCE_UPDATES),
    },
    {
      label: "society\nevents",
      image: ServiceEventsImage,
      imageSize: 28,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.SOCIETY_EVENTS),
    },
  ];

  const helpSecurityLinks = [
    {
      label: "service requests",
      image: ServiceServiceRequestsImage,
      imageSize: 28,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.RAISE_COMPLAINT),
    },
    {
      label: "society contacts",
      image: ServiceContactsImage,
      imageSize: 24,
      onPress: () => router.push(ROUTES.SCREENS.HELP_SECURITY.SOCIETY_CONTACTS),
    },
  ];

  return (
    <ThemedView className="flex-1 relative">
      <ThemedScrollView
        className="flex-1 pt-5"
        style={{ marginTop: insets.top }}
      >
        <View className="px-5 mb-4">
          <SearchBar
            prompt="search services"
            value=""
            onChangeText={() => console.log("Searched")} // eslint-disable-line no-console
          />
        </View>

        <View className="mt-5" />

        {/* People and Roles Section */}
        <ImageActionCardRow
          title="PEOPLE & ROLES"
          actions={peopleAndRolesLinks}
        />

        <View className="mt-7 mb-4" />

        {/* My Community Section */}
        <CommunityCardGrid title="MY COMMUNITY" actions={myCommunityLinks} />

        <View className="mt-7 mb-2" />

        {/* Help & Security Section */}
        <HelpSecurityCardRow
          title="HELP & SECURITY"
          actions={helpSecurityLinks}
        />

        <View className="mt-7 mb-5" />

        {/* My Actions Section */}
        <AnimatedVerticalActionList
          title="MY ACTIONS"
          actions={myActionsLinks}
        />

        <View className="mt-7 mb-5" />
      </ThemedScrollView>
    </ThemedView>
  );
};

export default Services;

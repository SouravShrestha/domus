import React from "react";
import { View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedScrollView,
  ThemedText,
  ThemedView,
} from "@themes/themedComponents";
import SearchBar from "@components/widgets/SearchBar";
import AnimatedVerticalActionList from "@components/widgets/AnimatedVerticalActionList";
import ImageActionCardRow from "@components/widgets/ImageActionCardRow";
import CommunityCardGrid from "@components/widgets/ImageActionCardGrid";
import { QRIcon } from "@components/icons";

const ServiceHomeImage = require("@assets/image-icons/service-home.png");
const ServiceKeyImage = require("@assets/image-icons/service-key.png");
const ServiceStaffImage = require("@assets/image-icons/service-staff.png");
const ServiceNoticeImage = require("@assets/image-icons/service-notice.png");
const ServiceIssuesImage = require("@assets/image-icons/service-issues.png");
const ServiceMaintenanceImage = require("@assets/image-icons/service-maintenance.png");
const ServiceEventsImage = require("@assets/image-icons/service-events.png");
const ServiceParkingImage = require("@assets/image-icons/service-parking.png");
const ServiceAmenityImage = require("@assets/image-icons/service-amenity.png");
const ServiceMyBookingsImage = require("@assets/image-icons/service-my-bookings.png");
const ServiceRulesImage = require("@assets/image-icons/service-rules.png");
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
      imageBackgroundColor: peopleAndRolesColor,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_FAMILY),
      backgroundColor: colors.cardBackground,
      textColor: colors.text,
    },
    {
      label: "manage\ntenants",
      image: ServiceKeyImage,
      imageBackgroundColor: basicColors.gold,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_TENANTS),
      backgroundColor: colors.cardBackground,
      textColor: colors.text,
    },
    {
      label: "staff &\nworkers",
      image: ServiceStaffImage,
      imageBackgroundColor: basicColors.lightBlue,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_STAFF),
          "can_manage_staff"
        ),
      backgroundColor: colors.cardBackground,
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
      label: "notice\nboard",
      image: ServiceNoticeImage,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.NOTICE_BOARD),
    },
    {
      label: "complaints\n& issues",
      image: ServiceIssuesImage,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.COMMUNITY.RAISE_COMPLAINT),
          "can_raise_complaints"
        ),
    },
    {
      label: "maintenace\nupdates",
      image: ServiceMaintenanceImage,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.MAINTENANCE_UPDATES),
    },
    {
      label: "society\nevents",
      image: ServiceEventsImage,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.SOCIETY_EVENTS),
    },
    {
      label: "book\nparking",
      image: ServiceParkingImage,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.BOOK_PARKING),
    },
    {
      label: "book\namenity",
      image: ServiceAmenityImage,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.COMMUNITY.BOOK_AMENITY),
          "can_book_amenities"
        ),
    },
    {
      label: "my\nbookings",
      image: ServiceMyBookingsImage,
      onPress: () =>
        checkPermissionAndExecute(
          () => router.push(ROUTES.SCREENS.COMMUNITY.MY_BOOKINGS),
          "can_book_amenities"
        ),
    },
    {
      label: "rules &\nguidelines",
      image: ServiceRulesImage,
      onPress: () => router.push(ROUTES.SCREENS.COMMUNITY.RULES_AND_GUIDELINES),
    },
  ];

  return (
    <ThemedView className="flex-1 relative">
      <ThemedScrollView
        className="flex-1 pt-5"
        style={{ marginTop: insets.top }}
      >
        <View className="px-5 mb-4">
          {/* Top Heading */}
          <ThemedText className="text-4xl font-uber-move-medium mb-4 tracking-wide">
            explore services
          </ThemedText>
          <SearchBar
            prompt="what are you looking for?"
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

        <View className="mt-7 mb-5" />

        {/* My Community Section */}
        <CommunityCardGrid title="MY COMMUNITY" actions={myCommunityLinks} />

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

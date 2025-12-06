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
import {
  HistoryIcon,
  QRIcon,
  ApprovalIcon,
  AddVisitorIcon,
  BookingsIcon,
  AmenitiesIcon,
  RulesIcon,
  MaintenanceIcon,
  TicketIcon,
  NoticeBoardIcon,
  ComplaintIcon,
  HomeWithHeartIcon,
  KeyHomeIcon,
  BroomIcon,
} from "@components/icons";
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

  const checkPermissionAndExecute = (action: () => void, permission?: PermissionKey) => {
    if (permission) {
      if (isOwner || (permissions && permissions[permission])) {
        action();
      } else {
        Alert.alert("Access Denied", "You do not have permission to access this service.");
      }
    } else {
      action();
    }
  };

  const visitorColor = basicColors.blue;

  const visitorLinks: ServiceLink[] = [
    {
      label: "invite \na guest",
      icon: AddVisitorIcon,
      onPress: () => checkPermissionAndExecute(
        () => router.push(ROUTES.SCREENS.VISITORS.INVITE_GUEST),
        "can_invite_visitors"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: visitorColor,
      iconBackgroundColor: visitorColor + "50",
      textColor: colors.text,
      requiredPermission: "can_invite_visitors",
    },
    {
      label: "invites & \napprovals",
      icon: ApprovalIcon,
      onPress: () => checkPermissionAndExecute(
        () => router.push(ROUTES.SCREENS.VISITORS.MANAGE_VISITORS),
        "can_invite_visitors"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: visitorColor,
      iconBackgroundColor: visitorColor + "50",
      textColor: colors.text,
      requiredPermission: "can_invite_visitors",
    },
    {
      label: "my guest \nhistory",
      icon: HistoryIcon,
      onPress: () => router.push(ROUTES.SCREENS.VISITORS.VISITOR_HISTORY),
      backgroundColor: colors.cardBackground,
      iconColor: visitorColor,
      iconBackgroundColor: visitorColor + "50",
      textColor: colors.text,
    },
  ];

  const peopleAndRolesColor = basicColors.lightPink;

  const peopleAndRolesLinks: ServiceLink[] = [
    {
      label: "manage \nmy family",
      icon: HomeWithHeartIcon,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_FAMILY),
      backgroundColor: colors.cardBackground,
      iconColor: peopleAndRolesColor,
      iconBackgroundColor: peopleAndRolesColor + "50",
      textColor: colors.text,
    },
    {
      label: "manage \ntenants",
      icon: KeyHomeIcon,
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_TENANTS),
      backgroundColor: colors.cardBackground,
      iconColor: peopleAndRolesColor,
      iconBackgroundColor: peopleAndRolesColor + "50",
      textColor: colors.text,
    },
    {
      label: "staffs & \nworkers",
      icon: BroomIcon,
      onPress: () => checkPermissionAndExecute(
        () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_STAFF),
        "can_manage_staff"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: peopleAndRolesColor,
      iconBackgroundColor: peopleAndRolesColor + "50",
      textColor: colors.text,
      requiredPermission: "can_manage_staff",
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
    }
  ];

  const amenityColor = basicColors.green;

  const amenityLinks: ServiceLink[] = [
    {
      label: "book an \namenity",
      icon: AmenitiesIcon,
      screen: "BookAmenity",
      onPress: () => checkPermissionAndExecute(
        () => console.log("Navigate to BookAmenity"), // eslint-disable-line no-console
        "can_book_amenities"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: amenityColor,
      iconBackgroundColor: amenityColor + "50",
      textColor: colors.text,
      requiredPermission: "can_book_amenities",
    },
    {
      label: "my \nbookings",
      icon: BookingsIcon,
      screen: "MyBookings",
      onPress: () => checkPermissionAndExecute(
        () => console.log("Navigate to MyBookings"), // eslint-disable-line no-console
        "can_book_amenities"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: amenityColor,
      iconBackgroundColor: amenityColor + "50",
      textColor: colors.text,
      requiredPermission: "can_book_amenities",
    },
    {
      label: "rules & \ntimings",
      icon: RulesIcon,
      screen: "AmenityRules",
      onPress: () => console.log("Navigate to AmenityRules"), // eslint-disable-line no-console
      backgroundColor: colors.cardBackground,
      iconColor: amenityColor,
      iconBackgroundColor: amenityColor + "50",
      textColor: colors.text,
    },
  ];

  const communityColor = basicColors.purple;

  const communityLinks: ServiceLink[] = [
    {
      label: "raise a \ncomplaint",
      icon: ComplaintIcon,
      screen: "RaiseComplaint",
      onPress: () => checkPermissionAndExecute(
        () => console.log("Navigate to RaiseComplaint"), // eslint-disable-line no-console
        "can_raise_complaints"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
      requiredPermission: "can_raise_complaints",
    },
    {
      label: "notice \nboard",
      icon: NoticeBoardIcon,
      screen: "NoticeBoard",
      onPress: () => console.log("Navigate to NoticeBoard"), // eslint-disable-line no-console
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
    },
    {
      label: "my \ntickets",
      icon: TicketIcon,
      screen: "MyTickets",
      onPress: () => checkPermissionAndExecute(
        () => console.log("Navigate to MyTickets"), // eslint-disable-line no-console
        "can_raise_complaints"
      ),
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
      requiredPermission: "can_raise_complaints",
    },
    {
      label: "maintenance \nupdates",
      icon: MaintenanceIcon,
      screen: "MaintenanceUpdates",
      onPress: () => console.log("Navigate to MaintenanceUpdates"), // eslint-disable-line no-console
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
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
          <AnimatedVerticalActionList
            title="PEOPLE & ROLES"
            actions={peopleAndRolesLinks}
          />

          <View className="mt-7 mb-5" />

          {/* Visitor Management Section */}
          <AnimatedVerticalActionList
            title="VISITOR MANAGEMENT"
            actions={visitorLinks}
          />

          <View className="mt-7 mb-5" />

          {/* Community Section */}
          <AnimatedVerticalActionList
            title="COMMUNITY"
            actions={communityLinks}
          />

          <View className="mt-7 mb-5" />

          {/* Amenity Booking Section */}
          <AnimatedVerticalActionList
            title="AMENITY BOOKING"
            actions={amenityLinks}
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

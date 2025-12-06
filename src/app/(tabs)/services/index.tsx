import React from "react";
import { View } from "react-native";
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
  FriendHostIcon,
  PreApprovedIcon,
  FriendsIcon,
  SocietiesIcon,
  BookingsIcon,
  AmenitiesIcon,
  RulesIcon,
  MaintenanceIcon,
  TicketIcon,
  NoticeBoardIcon,
  ComplaintIcon,
  HomeHeartIcon,
  HomeWithHeartIcon,
  KeyIcon,
  KeyHomeIcon,
  BroomIcon,
} from "@components/icons";
import { useTheme } from "@contexts/themeContext";
import { useRouter } from "expo-router";
import basicColors, { themeColors } from "@themes/colors";
import { ROUTES } from "@constants/routes";
import QRCode from "react-native-qrcode-svg";

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
}

const Services: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { themedColors, currentTheme } = useTheme();
  const router = useRouter();
  const colors = themeColors[currentTheme];

  const visitorColor = basicColors.blue;

  const visitorLinks: ServiceLink[] = [
    {
      label: "invite \na guest",
      icon: AddVisitorIcon,
      onPress: () => router.push(ROUTES.SCREENS.VISITORS.INVITE_GUEST),
      backgroundColor: colors.cardBackground,
      iconColor: visitorColor,
      iconBackgroundColor: visitorColor + "50",
      textColor: colors.text,
    },
    {
      label: "invites & \napprovals",
      icon: ApprovalIcon,
      onPress: () => router.push(ROUTES.SCREENS.VISITORS.MANAGE_VISITORS),
      backgroundColor: colors.cardBackground,
      iconColor: visitorColor,
      iconBackgroundColor: visitorColor + "50",
      textColor: colors.text,
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
      onPress: () => router.push(ROUTES.SCREENS.PEOPLE.MANAGE_STAFF),
      backgroundColor: colors.cardBackground,
      iconColor: peopleAndRolesColor,
      iconBackgroundColor: peopleAndRolesColor + "50",
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
    }
  ];

  const amenityColor = basicColors.green;

  const amenityLinks: ServiceLink[] = [
    {
      label: "book an \namenity",
      icon: AmenitiesIcon,
      screen: "BookAmenity",
      backgroundColor: colors.cardBackground,
      iconColor: amenityColor,
      iconBackgroundColor: amenityColor + "50",
      textColor: colors.text,
    },
    {
      label: "my \nbookings",
      icon: BookingsIcon,
      screen: "MyBookings",
      backgroundColor: colors.cardBackground,
      iconColor: amenityColor,
      iconBackgroundColor: amenityColor + "50",
      textColor: colors.text,
    },
    {
      label: "rules & \ntimings",
      icon: RulesIcon,
      screen: "AmenityRules",
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
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
    },
    {
      label: "notice \nboard",
      icon: NoticeBoardIcon,
      screen: "NoticeBoard",
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
    },
    {
      label: "my \ntickets",
      icon: TicketIcon,
      screen: "MyTickets",
      backgroundColor: colors.cardBackground,
      iconColor: communityColor,
      iconBackgroundColor: communityColor + "50",
      textColor: colors.text,
    },
    {
      label: "maintenance \nupdates",
      icon: MaintenanceIcon,
      screen: "MaintenanceUpdates",
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

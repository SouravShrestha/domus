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
} from "@components/icons";
import EmptyStateView from "@components/widgets/EmptyStateView";
import { useTheme } from "@contexts/themeContext";
import { Image } from "react-native";
import WideButton from "@/components/widgets/WideButton";
import { router } from "expo-router";
import sadnessImage from "@assets/images/sadness.png";
import { ROUTES } from "@/constants/routes";

interface ServiceLink {
  label: string;
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  screen: string;
}

const Services: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { themedColors } = useTheme();

  const visitorLinks: ServiceLink[] = [
    { label: "add \nnew visitor", icon: AddVisitorIcon, screen: "AddVisitor" },
    {
      label: "invites & \napprovals",
      icon: ApprovalIcon,
      screen: "ManageVisitors",
    },
    { label: "quick invite \nQR", icon: QRIcon, screen: "QuickInvite" },
    {
      label: "my guest \nhistory",
      icon: HistoryIcon,
      screen: "VisitorHistory",
    },
  ];

  const myVisitLinks: ServiceLink[] = [
    {
      label: "ask a friend \nto host me",
      icon: FriendHostIcon,
      screen: "AskFriendHost",
    },
    {
      label: "pre-approved \nvisits for me",
      icon: PreApprovedIcon,
      screen: "DiscoverSocieties",
    },
    {
      label: "find friends \non platform",
      icon: FriendsIcon,
      screen: "FindFriends",
    },
    {
      label: "discover \nsocieties",
      icon: SocietiesIcon,
      screen: "DiscoverSocieties",
    },
    {
      label: "my visit \nhistory",
      icon: HistoryIcon,
      screen: "VisitorHistory",
    },
  ];

  const amenityLinks: ServiceLink[] = [
    { label: "book an \namenity", icon: AmenitiesIcon, screen: "BookAmenity" },
    { label: "my \nbookings", icon: BookingsIcon, screen: "MyBookings" },
    { label: "rules & \ntimings", icon: RulesIcon, screen: "AmenityRules" },
  ];

  const communityLinks: ServiceLink[] = [
    {
      label: "raise a \ncomplaint",
      icon: ComplaintIcon,
      screen: "RaiseComplaint",
    },
    { label: "notice \nboard", icon: NoticeBoardIcon, screen: "NoticeBoard" },
    { label: "my \ntickets", icon: TicketIcon, screen: "MyTickets" },
    {
      label: "maintenance \nupdates",
      icon: MaintenanceIcon,
      screen: "MaintenanceUpdates",
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

          {/* My Visit Section */}
          <AnimatedVerticalActionList
            title="MY VISITS"
            actions={myVisitLinks}
          />

          <View className="mt-7 mb-5" />
        </ThemedScrollView>
    </ThemedView>
  );
};

export default Services;

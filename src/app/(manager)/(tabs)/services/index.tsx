import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedScrollView, ThemedView } from "@themes/themedComponents";
import SearchBar from "@components/widgets/SearchBar";
import CommunityCardGrid from "@components/widgets/ImageActionCardGrid";
import HelpSecurityCardRow from "@components/widgets/HelpSecurityCardRow";

import {
  ServiceNoticeImage,
  ServiceParkingImage,
  ServiceAmenityImage,
  ServiceRulesImage,
  ServiceServiceRequestsImage,
  ServiceContactsImage,
  ServiceStaffImage,
  ServiceGuardImage,
  ServiceFamilyImage,
  ServiceGuestsImage,
} from "@assets/image-icons";

import { useRouter } from "expo-router";
import { ROUTES } from "@constants/routes";

const ManagerServicesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const communityManagementLinks = [
    {
      label: "notice\nboard",
      image: ServiceNoticeImage,
      imageSize: 32,
      onPress: () => router.push(ROUTES.MANAGER.SCREENS.SERVICES.NOTICE_BOARD),
    },
  ];

  const amenitiesLinks = [
    {
      label: "manage\nparking",
      image: ServiceParkingImage,
      imageSize: 32,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.MANAGE_PARKING),
    },
    {
      label: "manage\namenity",
      image: ServiceAmenityImage,
      imageSize: 30,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.MANAGE_AMENITY),
    },
    {
      label: "rules &\nguidelines",
      image: ServiceRulesImage,
      imageSize: 28,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.RULES_AND_GUIDELINES),
    },
  ];

  const peopleLinks = [
    {
      label: "society\nvisitors",
      image: ServiceGuestsImage,
      imageSize: 40,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.MANAGE_PARKING),
    },
    {
      label: "society\nresidents",
      image: ServiceFamilyImage,
      imageSize: 38,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.MANAGE_AMENITY),
    },
    {
      label: "manage\nstaffs",
      image: ServiceStaffImage,
      imageSize: 38,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.RULES_AND_GUIDELINES),
    },
    {
      label: "manage\nguards",
      image: ServiceGuardImage,
      imageSize: 34,
      onPress: () => router.push(ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.INDEX),
    },
  ];

  const helpSecurityLinks = [
    {
      label: "service requests",
      image: ServiceServiceRequestsImage,
      imageSize: 28,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.SERVICE_REQUESTS),
    },
    {
      label: "society contacts",
      image: ServiceContactsImage,
      imageSize: 24,
      onPress: () =>
        router.push(ROUTES.MANAGER.SCREENS.SERVICES.SOCIETY_CONTACTS),
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
            onChangeText={() => console.log("Searched")}
          />
        </View>

        <View className="mt-5" />

        <CommunityCardGrid
          title="COMMUNITY MANAGEMENT"
          actions={communityManagementLinks}
        />

        <View className="mt-5 mb-2" />

        <CommunityCardGrid
          title="PARKING & AMENITIES"
          actions={amenitiesLinks}
        />

        <View className="mt-5 mb-2" />

        <HelpSecurityCardRow
          title="HELP & SECURITY"
          actions={helpSecurityLinks}
        />

        <View className="mt-9 mb-2" />

        <CommunityCardGrid title="MANAGE PEOPLE" actions={peopleLinks} />

        <View className="mt-7 mb-5" />
      </ThemedScrollView>
    </ThemedView>
  );
};

export default ManagerServicesScreen;

import React from "react";
import {
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  ThemedScrollView,
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import boy1Png from "@images/boy-1.png";
import { getGreetingTime } from "@utils/textHelpers";
import FakeInputButton from "@components/widgets/FakeInputButton";
import { FilledHeartIcon, FilledQrIcon, HeartIcon } from "@components/icons";
import ActionButton from "@components/widgets/ActionButton";
import basicColors from "@themes/colors";
import girl1Png from "@images/girl-1.png";
import girl2Png from "@images/girl-2.png";
import WideButton from "@/components/widgets/WideButton";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import snowfallJson from "@assets/animations/snowfall.json";
import InviteLinkGuidelinesBottomSheet, { InviteLinkGuidelinesBottomSheetRef } from "@/components/widgets/InviteLinkGuidelinesBottomSheet";


const NoMembershipScreen: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inviteGuidelinesSheetRef = React.useRef<InviteLinkGuidelinesBottomSheetRef>(null);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const { themedColors, currentTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "default" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace(ROUTES.AUTH.WELCOME);
        },
      },
    ]);
  };

  const handleJoinWithInviteCode = () => {
    router.push(ROUTES.SCREENS.ENTER_INVITE_CODE);
  };

  const handleWhyChooseUs = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(ROUTES.SCREENS.WHY_CHOOSE_US);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleOnboardSociety = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(ROUTES.SCREENS.ONBOARD_SOCIETY);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="light-content" animated />
      <View
        className="h-52 w-full px-6 rounded-b-3xl"
        style={{
          backgroundColor: themedColors.primary,
          paddingTop: insets.top,
        }}
      >
        <View className="absolute top-0 left-0 right-0 bottom-0 rounded-b-3xl overflow-hidden">
          <LottieView
            source={snowfallJson}
            autoPlay
            loop
            speed={0.3}
            style={{ width: "100%", height: "100%" }}
          />
          <View
            className="absolute top-0 left-0 right-0 bottom-0 rounded-b-3xl"
            style={{
              backgroundColor: themedColors.primary,
              opacity: currentTheme === "dark" ? 0.7 : 0.2,
            }}
          />
        </View>
        <View className="flex-1 justify-end items-start pt-4 mr-32 mb-5">
          <Text
            className="text-3xl font-uber-move-bold tracking-wider"
            style={{ color: basicColors.white }}
          >
            Good {"\n" + getGreetingTime()},
          </Text>
          <Text
            className="text-lg font-lato-bold tracking-wider mt-2"
            style={{ color: basicColors.white }}
          >
            Let's get you started!
          </Text>
        </View>

        <Image
          source={boy1Png}
          className="h-32 w-40 absolute bottom-0 right-2"
          contentFit="contain"
          transition={300}
        />
      </View>

      <ThemedScrollView
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
      >
        <ThemedText className="text-base font-lato-regular text-center leading-8">
          Looks like you are new to Domus. {"\n"} You can start by joining your
          residence.
        </ThemedText>

        <View className="my-4" />

        <FakeInputButton
          phrases={[
            "Enter invite code . .",
            "Join your society . .",
            "Access your residence . .",
            "Your code goes here . .",
            "Let's get you inside . .",
          ]}
          onPress={handleJoinWithInviteCode}
          buttonText="Join"
        />

        <View className="my-4" />

        <View className="flex-1">
          <ThemedText className="text-xs font-uber-move-medium tracking-wider leading-8 uppercase">
            OTHER WAYS TO JOIN
          </ThemedText>

          <View className="my-1" />

          <View className="mb-5 flex flex-row justify-start mt-2">
            <ActionButton
              icon={FilledQrIcon}
              label="join with QR code"
              backgroundColor={themedColors.cardBackground}
              iconColor={basicColors.brightGreen}
              iconBackgroundColor={basicColors.brightGreen + "50"}
              textColor={themedColors.text}
              onPress={() => router.push(ROUTES.SCREENS.QR_SCANNER)}
            />
            <ActionButton
              icon={HeartIcon}
              label="got a magic invite link?"
              backgroundColor={themedColors.cardBackground}
              iconColor={basicColors.lightPink}
              iconBackgroundColor={basicColors.lightPink + "50"}
              textColor={themedColors.text}
              onPress={() => inviteGuidelinesSheetRef.current?.open()}
            />
          </View>

          <View className="my-2" />

          <TouchableOpacity
            className="-mx-6 px-7 py-2 justify-start items-center flex-row"
            style={{ backgroundColor: themedColors.cardBackground }}
            onPress={() => router.push(ROUTES.SCREENS.MEMBERSHIP_STATUS)}
          >
            <ThemedText className="text-sm font-lato-regular tracking-wider text-right ml-2">
              Already requested an approval?
            </ThemedText>
            <ThemedText
              className="text-sm font-lato-regular tracking-wider ml-2 mr-1"
              style={{ color: themedColors.accent }}
            >
              Track status here
            </ThemedText>
          </TouchableOpacity>

          <View className="my-4" />

          <TouchableOpacity
            className="items-start pl-5 border rounded-lg py-7 flex-row justify-between"
            style={{ borderColor: themedColors.border }}
            onPress={handleWhyChooseUs}
            disabled={isNavigating}
          >
            <View className="items-start w-[63%]">
              <ThemedText className="text-base font-uber-move-medium tracking-wider text-center">
                Why choose us?
              </ThemedText>
              <View className="my-2" />
              <ThemedText className="text-sm font-lato-regular tracking-wide text-start">
                Domus keeps society life simple, fast, and drama-free.
              </ThemedText>
              <View className="my-1" />
              <ThemedText
                className="text-sm font-lato-regular tracking-wide text-start border-b-[0.8px]"
                style={{ borderBottomColor: themedColors.text }}
              >
                Find out more.
              </ThemedText>
            </View>

            <Image
              source={girl1Png}
              className="w-32 h-32 absolute -right-6 -bottom-0 rounded-lg"
              contentFit="cover"
              transition={300}
            />
          </TouchableOpacity>

          <View className="my-4" />

          <TouchableOpacity
            className="items-start pr-5 border rounded-lg py-7 flex-row justify-end"
            style={{ borderColor: themedColors.border }}
            onPress={handleOnboardSociety}
            disabled={isNavigating}
          >
            <Image
              source={girl2Png}
              className="w-32 h-32 absolute -left-6 -bottom-0 rounded-lg"
              contentFit="cover"
              transition={300}
            />
            <View className="items-start w-[63%]">
              <ThemedText className="text-base font-uber-move-medium tracking-wider text-center">
                Onboard your society
              </ThemedText>
              <View className="my-2" />
              <ThemedText className="text-sm font-lato-regular tracking-wide text-start">
                Bring Domus to your society, we'll help you set it up.
              </ThemedText>
              <View className="my-1" />
              <ThemedText
                className="text-sm font-lato-regular tracking-wide text-start border-b-[0.8px]"
                style={{ borderBottomColor: themedColors.text }}
              >
                Connect with us.
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View className="my-6" />

        <View className="px-2">
          <Text
            className="text-4xl font-lato-black tracking-wider text-left"
            style={{ color: themedColors.disabled }}
          >
            TRULY
          </Text>
          <Text
            className="text-4xl font-lato-black tracking-wider text-left mt-1"
            style={{ color: themedColors.disabled }}
          >
            INDIAN
          </Text>
          <Text
            className="text-4xl font-lato-black tracking-wider text-left mt-1"
            style={{ color: themedColors.disabled }}
          >
            APP
          </Text>
          <View className="flex-row mt-4 items-center">
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider text-left mr-1.5 uppercase">
              Crafted with
            </ThemedTextSecondary>
            <FilledHeartIcon width={16} height={16} color={basicColors.red} />
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider text-left ml-1.5 uppercase">
              in India
            </ThemedTextSecondary>
          </View>
          <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider text-left uppercase mt-3">
            App version 1.1.2.0
          </ThemedTextSecondary>
        </View>

        <WideButton
          className="mt-10 mb-5"
          label={"Logout"}
          onPress={handleLogout}
        />
      </ThemedScrollView>
      <InviteLinkGuidelinesBottomSheet ref={inviteGuidelinesSheetRef} />
    </ThemedView>
  );
};
export default NoMembershipScreen;

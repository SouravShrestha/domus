import React, { useEffect } from "react";
import {
    BackHandler,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    ThemedText,
    ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import welcomeAboardImage from "@assets/images/welcome-aboard.png";
import LottieView from "lottie-react-native";
import confettiAnimation from "@assets/animations/confetti.json";
import { ROUTES } from "@/constants/routes";

const InviteSuccessScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();

    // Prevent back navigation
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => true // Return true to prevent default back behavior
        );

        return () => backHandler.remove();
    }, []);

    const handleGetStarted = () => {
        router.dismissAll();
        router.replace(ROUTES.TABS.HOME);
    };

    return (
        <ThemedView className="flex-1">
            <StatusBar barStyle="default" animated />

            <View
                className="flex-1 justify-center items-center px-8"
                style={{
                    paddingBottom: insets.bottom + 24,
                    paddingTop: insets.top + 64,
                }}
            >
                <View className="absolute top-0 left-8 right-0 h-[50vh] w-full rounded-full overflow-hidden opacity-59 ">
                    <LottieView
                        source={confettiAnimation}
                        autoPlay
                        loop={false}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </View>
                <View
                    className="w-48 h-48 rounded-full items-center justify-center ml-4"
                >
                    <Image
                        source={welcomeAboardImage}
                        className="w-full h-full"
                    />
                </View>

                {/* Success Title */}
                <ThemedText className="text-3xl font-uber-move-bold tracking-wider text-center mb-4 mt-4">
                    Welcome Aboard!
                </ThemedText>

                {/* Success Message */}
                <ThemedText className="text-base font-lato-regular text-center leading-7 mb-3 px-4">
                    Invitation has been accepted successfully
                </ThemedText>

                <ThemedText
                    className="text-sm font-lato-regular text-center leading-6 mb-8 px-6"
                    style={{ color: themedColors.secondaryText }}
                >
                    You're now part of your residence community. Let's get you started on your journey with Domus.
                </ThemedText>

                {/* Decorative Spacer */}
                <View className="flex-1" />

                {/* Get Started Button */}
                <TouchableOpacity
                    onPress={handleGetStarted}
                    className="w-full py-4 rounded-2xl items-center shadow-lg"
                    style={{
                        backgroundColor: themedColors.buttonBackground,
                    }}
                >
                    <Text
                        className="text-lg font-uber-move-medium tracking-wider"
                        style={{ color: themedColors.buttonText }}
                    >
                        Let's Go
                    </Text>
                </TouchableOpacity>

                {/* Helper Text */}
                <ThemedText
                    className="text-xs font-lato-regular text-center mt-6 px-8 leading-5"
                    style={{ color: themedColors.secondaryText }}
                >
                    Explore your residence, connect with neighbors, and manage everything from one place
                </ThemedText>
            </View>
        </ThemedView>
    );
};

export default InviteSuccessScreen;

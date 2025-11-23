import React from "react";
import { StatusBar, View, Image, Linking } from "react-native";
import {
    ThemedView,
    ThemedText,
    ThemedTextSecondary,
    ThemedScrollView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useRouter } from "expo-router";
import WideButton from "@components/widgets/WideButton";
import societyPng from "@assets/images/society.png";
import basicColors from "@themes/colors";
import BackButton from "@/components/widgets/BackButton";

const OnboardSocietyScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const router = useRouter();

    const handleContactUs = () => {
        Linking.openURL("mailto:hello@domus.app?subject=Onboard My Society");
    };

    return (
        <ThemedView className="flex-1 pt-4">
            <StatusBar barStyle="light-content" animated />
            <View
                className="flex-row items-center justify-between w-12 ml-2"
                style={{ transform: [{ rotate: "-90deg" }] }}
            >
                <BackButton onPress={() => router.back()} color={themedColors.text} />
            </View>
            <ThemedScrollView className="flex-1 px-3">
                <View className="h-52 w-full items-center justify-end">
                    <Image
                        source={societyPng}
                        className="w-full h-72 absolute"
                        resizeMode="contain"
                    />
                </View>

                <View className="px-3 -mt-10">
                    <ThemedView
                        className="p-6 pb-5 rounded-lg shadow-sm border"
                        style={{ borderColor: themedColors.border }}
                    >
                        <ThemedText className="text-2xl font-uber-move-medium text-center mb-4">
                            Bring Domus to Your Society
                        </ThemedText>

                        <ThemedTextSecondary className="text-base font-lato-regular text-center leading-6 mb-6">
                            Transform your residential experience with our comprehensive management solution.
                        </ThemedTextSecondary>

                        <View className="space-y-4">
                            <BenefitRow text="Streamlined visitor management" />
                            <BenefitRow text="Automated billing & payments" />
                            <BenefitRow text="Digital notice board & polls" />
                            <BenefitRow text="Dedicated support team" />
                        </View>
                    </ThemedView>

                    <View className="mt-8 mb-4">
                        <ThemedText className="text-lg font-uber-move-medium text-center mb-2">
                            Ready to upgrade?
                        </ThemedText>
                        <ThemedTextSecondary className="text-sm text-center mb-6">
                            Our team will help you set up everything from scratch. No technical knowledge required.
                        </ThemedTextSecondary>

                        <WideButton
                            label="Get in Touch"
                            onPress={handleContactUs}
                        />
                    </View>
                </View>
            </ThemedScrollView>
        </ThemedView>
    );
};

const BenefitRow: React.FC<{ text: string }> = ({ text }) => {
    useTheme();
    return (
        <View className="flex-row items-center mb-3">
            <View
                className="w-6 h-6 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: basicColors.brightGreen + '20' }}
            >
                <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: basicColors.brightGreen }}
                />
            </View>
            <ThemedText className="text-sm font-lato-regular flex-1">
                {text}
            </ThemedText>
        </View>
    );
};

export default OnboardSocietyScreen;

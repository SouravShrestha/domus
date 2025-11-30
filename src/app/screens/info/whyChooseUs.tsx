import React from "react";
import { StatusBar, View } from "react-native";
import { Image } from "expo-image";
import {
    ThemedView,
    ThemedText,
    ThemedTextSecondary,
    ThemedScrollView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import basicColors from "@themes/colors";
import BackButton from "@/components/widgets/BackButton";

import GirlSimple from "@assets/images/girl-simple.png";
import BoyFast from "@assets/images/boy-fast.png";
import GirlPrivacy from "@assets/images/girl-privacy.png";
import BoysCommunity from "@assets/images/boys-community.png";

const WhyChooseUsScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const features = [
        {
            title: "Simple & Intuitive",
            description:
                "No more complex menus. We are designed to be used by everyone, from tech-savvy teens to grandparents.",
            image: GirlSimple,
        },
        {
            title: "Lightning Fast",
            description:
                "Get things done in seconds. Whether it's approving a guest or paying maintenance, we value your time.",
            image: BoyFast,
        },
        {
            title: "Privacy First",
            description:
                "Your data stays yours. We use industry-standard encryption to ensure your personal information is safe.",
            image: GirlPrivacy,
        },
        {
            title: "Community Focused",
            description:
                "Built to foster better relationships within your society. Connect with neighbors and stay updated on events.",
            image: BoysCommunity,
        },
    ];

    return (
        <ThemedView className="flex-1 pt-4">
            <StatusBar barStyle="light-content" animated />
            <View
                className="flex-row items-center justify-between mb-4 w-12 ml-2"
                style={{ transform: [{ rotate: "-90deg" }] }}
            >
                <BackButton onPress={() => router.back()} color={themedColors.text} />
            </View>
            <ThemedScrollView className="flex-1 px-3">
                {/* Header Section */}
                <View className="w-full pb-8 z-10">
                    <View className="items-start mb-2 px-3">
                        <ThemedText className="text-3xl font-uber-move-medium tracking-wide">
                            Why Domus?
                        </ThemedText>
                        <ThemedTextSecondary className="text-base mt-2">
                            Redefining modern society living with simplicity and elegance.
                        </ThemedTextSecondary>
                    </View>
                </View>

                <View className="flex-1 px-3" style={{ paddingBottom: insets.bottom }}>
                    <View>
                        {features.map((feature, index) => (
                            <View
                                key={index}
                                className={`mb-6 rounded-md border w-full ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                                    }`}
                                style={{
                                    backgroundColor: themedColors.cardBackground,
                                    borderColor: themedColors.border,
                                }}
                            >
                                <View
                                    className="items-center justify-end w-1/3 h-36"
                                >
                                    <Image
                                        source={feature.image}
                                        className="absolute -bottom-2.5 h-40 w-44"
                                        contentFit="contain"
                                        transition={200}
                                    />
                                </View>
                                <View className="flex-1 p-5">
                                    <ThemedText className="text-lg font-uber-move-medium mb-1 tracking-wide">
                                        {feature.title}
                                    </ThemedText>
                                    <ThemedTextSecondary className="text-sm font-lato-regular leading-5 text-start mt-2">
                                        {feature.description}
                                    </ThemedTextSecondary>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ThemedScrollView>
        </ThemedView>
    );
};

export default WhyChooseUsScreen; // Exported as default

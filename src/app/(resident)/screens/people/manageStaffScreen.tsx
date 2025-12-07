import React from "react";
import {
    StatusBar,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { router } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { PlusIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

const ManageStaffScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <ThemedView className="flex-1">
            <StatusBar barStyle="default" animated />
            <View
                className="pb-2 mx-3"
                style={{
                    paddingTop: insets.top + 16,
                }}
            >
                <ThemedHeaderWithBack
                    onBackPress={() => router.back()}
                    title="manage staffs & workers"
                />
            </View>

            <TouchableOpacity
                onPress={() => router.push({
                    pathname: ROUTES.SCREENS.PEOPLE.ADD_MEMBER,
                    params: { type: "staff" }
                })}
                className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
                style={{
                    backgroundColor: themedColors.accent,
                    bottom: insets.bottom + 24
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <PlusIcon width={20} height={20} color={themedColors.background} />
            </TouchableOpacity>
        </ThemedView>
    );
};

export default ManageStaffScreen;

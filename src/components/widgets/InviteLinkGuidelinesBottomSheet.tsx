import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
} from "react";
import { View, TouchableOpacity } from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CopyIcon, PaperPlaneIcon, SmsIcon } from "@components/icons";

export interface InviteLinkGuidelinesBottomSheetRef {
    open: () => void;
    close: () => void;
}

const InviteLinkGuidelinesBottomSheet = forwardRef<
    InviteLinkGuidelinesBottomSheetRef,
    object
>((_, ref) => {
    const { themedColors, currentTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
        open: () => bottomSheetRef.current?.expand(),
        close: () => bottomSheetRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
                opacity={0.5}
            />
        ),
        []
    );

    const steps = [
        {
            icon: SmsIcon,
            title: "Check your messages",
            description: "Look for an invite link sent via SMS, WhatsApp, or Email.",
        },
        {
            icon: PaperPlaneIcon,
            title: "Tap the link",
            description: "Clicking the link should automatically open the Domus app.",
        },
        {
            icon: CopyIcon,
            title: "App not opening?",
            description: "If the link doesn't work, copy the code from the message and enter it manually.",
        },
    ];

    return (
        <Portal hostName="global">
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                enablePanDownToClose
                enableDynamicSizing
                backgroundStyle={{
                    backgroundColor: themedColors.modal,
                }}
                handleIndicatorStyle={{
                    backgroundColor: themedColors.accent,
                }}
                containerStyle={{
                    paddingTop: 0,
                    marginTop: 0,
                    zIndex: 9999,
                }}
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView
                    style={{
                        backgroundColor: themedColors.modal,
                        paddingBottom: insets.bottom,
                    }}
                >
                    <View className="px-6 pt-6">
                        <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-2">
                            Join via Invite Link
                        </ThemedText>
                        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide leading-5 mb-6">
                            Follow these steps to join your residence using a magic invite link.
                        </ThemedTextSecondary>

                        <View className="space-y-6">
                            {steps.map((step, index) => (
                                <View key={index} className="flex-row items-start">
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-4 mt-1"
                                        style={{
                                            backgroundColor:
                                                currentTheme === "dark"
                                                    ? themedColors.border + "30"
                                                    : themedColors.border + "20",
                                        }}
                                    >
                                        <step.icon
                                            width={20}
                                            height={20}
                                            color={themedColors.text}
                                        />
                                    </View>
                                    <View className="flex-1 pr-4">
                                        <ThemedText className="text-base font-uber-move-medium tracking-wide mb-1">
                                            {step.title}
                                        </ThemedText>
                                        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide leading-5">
                                            {step.description}
                                        </ThemedTextSecondary>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => bottomSheetRef.current?.close()}
                            className="mt-8 p-4 rounded-lg items-center mb-6"
                            style={{
                                backgroundColor: themedColors.buttonBackground,
                            }}
                        >
                            <ThemedText
                                className="text-base font-uber-move-medium tracking-wider"
                                style={{ color: themedColors.buttonText }}
                            >
                                Got it
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </Portal>
    );
});

InviteLinkGuidelinesBottomSheet.displayName = "InviteLinkGuidelinesBottomSheet";

export default InviteLinkGuidelinesBottomSheet;

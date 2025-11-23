import React, { useState, useEffect } from "react";
import { Text, View, Button, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowIcon } from "@/components/icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QRScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            setScanned(false);
        }, [])
    );

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-center pb-2.5 text-white">We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        // Parse the data
        // Expected format: domus://join?type=residence&id=... or domus://join?type=invite&code=...
        try {
            const url = new URL(data);
            if (url.protocol === "domus:" && url.host === "join") {
                const type = url.searchParams.get("type");
                const id = url.searchParams.get("id");
                const code = url.searchParams.get("code");

                if (type === "residence" && id) {
                    router.push({
                        pathname: "/screens/qrConfirmation",
                        params: { residenceId: id, type: "public" },
                    });
                } else if (type === "invite" && code) {
                    router.push({
                        pathname: "/screens/qrConfirmation",
                        params: { inviteCode: code, type: "invite" },
                    });
                } else {
                    alert(`Invalid QR Code format: ${data}`);
                    setScanned(false);
                }
            } else {
                alert(`Invalid QR Code: ${data}`);
                setScanned(false);
            }
        } catch {
            alert(`Error parsing QR Code: ${data}`);
            setScanned(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center p-4 absolute top-10 left-0 right-0 z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/50 rounded-full mt-2">
                    <ArrowIcon width={24} height={24} stroke="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-4 mt-2" style={{ textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 }}>Scan QR Code</Text>
            </View>
            <CameraView
                className="flex-1"
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="w-[275px] h-[275px] border-2 border-white bg-transparent rounded-md" />
                    <Text className="text-white mt-5 text-base text-center">
                        Align the QR code within the frame to scan
                    </Text>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ArrowIcon,
  BoltSlashIcon,
  FilledBoltIcon,
  FilledPictureIcon,
} from "@components/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraPermission from "@components/widgets/CameraPermission";
import { ThemedView } from "@/themes/themedComponents";
import { ROUTES } from "@constants/routes";
import basicColors from "@/themes/colors";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/themeContext";
import SplashIconLight from "@assets/icons/splash-icon-light.png";

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x, 2x, 3x
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themedColors } = useTheme();

  // QR Scanner corner marker dimensions
  const cornerOffset = 10;
  const cornerSize = 5;
  const cornerBorderWidth = 2;

  const openCameraSettings = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      try {
        await Linking.openURL("app-settings:");
      } catch {
        await Linking.openURL("android-settings://settings");
      }
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required!",
          "Camera access is required to scan QR codes. Would you like to open settings to enable it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: openCameraSettings,
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
    }, [])
  );

  const toggleZoom = () => {
    setZoomLevel((current) => {
      return current >= 3 ? 1 : current + 1;
    });
  };

  const normalizedZoom = zoomLevel === 1 ? 0 : zoomLevel === 2 ? 0.1 : 0.2;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <CameraPermission
        onRequestPermission={handleRequestPermission}
        onCancel={() => router.back()}
      />
    );
  }

  const handleBarCodeScanned = ({
    type: _type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
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
          router.replace({
            pathname: "/screens/qrConfirmation",
            params: { residenceId: id, type: "public" },
          });
        } else if (type === "invite" && code) {
          router.replace({
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
    <ThemedView className="flex-1">
      <StatusBar barStyle="light-content" animated />
      <CameraView
        className="flex-1"
        facing="back"
        enableTorch={flash}
        zoom={normalizedZoom}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {/* Overlay */}
      <View className="absolute inset-0 pointer-events-none w-full h-full">
        {/* Top Section */}
        <View
          className="flex-1 w-full items-center justify-center"
          style={{ backgroundColor: themedColors.overlay.background }}
        >
          <View
            style={{ position: "absolute", top: insets.top + 10, left: 20 }}
            className="pointer-events-auto"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-black/20"
            >
              <ArrowIcon width={24} height={24} stroke="white" />
            </TouchableOpacity>
          </View>

          <View className="items-center mt-10">
            <Image source={SplashIconLight} style={{ width: 72, height: 72 }} />
            <Text
              className="font-uber-move-medium text-lg mt-1 tracking-wider"
              style={{ color: basicColors.white }}
            >
              Scan QR Code
            </Text>
            <Text
              className="text-sm mt-2 font-lato-regular tracking-wide"
              style={{ color: basicColors.white + "99" }}
            >
              Align the QR code within the frame
            </Text>
          </View>
        </View>

        {/* Middle Section */}
        <View className="flex-row h-[280px]">
          <View
            className="flex-1"
            style={{ backgroundColor: themedColors.overlay.background }}
          />
          <View className="w-[280px] h-[280px] bg-transparent relative justify-center items-center z-10">
            {/* Corner Markers */}
            <View
              className="absolute border-t border-l border-b-0 border-r-0 border-white rounded-tl-sm"
              style={{
                top: -cornerOffset,
                left: -cornerOffset,
                width: cornerSize * 4,
                height: cornerSize * 4,
                borderWidth: cornerBorderWidth,
              }}
            />
            <View
              className="absolute border-t border-r border-b-0 border-l-0 border-white rounded-tr-sm"
              style={{
                top: -cornerOffset,
                right: -cornerOffset,
                width: cornerSize * 4,
                height: cornerSize * 4,
                borderWidth: cornerBorderWidth,
              }}
            />
            <View
              className="absolute border-b border-l border-t-0 border-r-0 border-white rounded-bl-sm"
              style={{
                bottom: -cornerOffset,
                left: -cornerOffset,
                width: cornerSize * 4,
                height: cornerSize * 4,
                borderWidth: cornerBorderWidth,
              }}
            />
            <View
              className="absolute border-b border-r border-t-0 border-l-0 border-white rounded-br-sm"
              style={{
                bottom: -cornerOffset,
                right: -cornerOffset,
                width: cornerSize * 4,
                height: cornerSize * 4,
                borderWidth: cornerBorderWidth,
              }}
            />

            {/* Flash and Gallery Buttons */}
            <View
              className="absolute flex-row justify-center bottom-2 pointer-events-auto space-x-3.5 px-1 py-2 rounded-full h-9 items-center"
              style={{ backgroundColor: "#00000020" }}
            >
              <TouchableOpacity
                onPress={() => setFlash(!flash)}
                className="items-center"
              >
                <View className="p-2 rounded-full bg-black/70">
                  {flash ? (
                    <FilledBoltIcon width={14} height={14} color="white" />
                  ) : (
                    <BoltSlashIcon width={14} height={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Gallery feature is under development."
                  )
                }
                className="items-center"
              >
                <View className="p-2 rounded-full bg-black/70">
                  <FilledPictureIcon width={14} height={14} color="white" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleZoom}
                className="items-center"
              >
                <View className="p-[5px] rounded-full bg-black/70 h-8 w-8 items-center justify-center">
                  <Text
                    className="text-sm font-uber-move-bold tracking-widest"
                    style={{ color: basicColors.gold }}
                  >
                    {zoomLevel}x
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            className="flex-1"
            style={{ backgroundColor: themedColors.overlay.background }}
          />
        </View>

        {/* Bottom Section */}
        <View
          className="flex-1 w-full items-center justify-start pt-16"
          style={{
            backgroundColor: themedColors.overlay.background,
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace(ROUTES.SCREENS.ENTER_INVITE_CODE)}
            className="items-center flex-row justify-center gap-x-2"
          >
            {/* Invite Code Section */}
            <Text className="text-white/90 text-base font-uber-move-medium tracking-wide">
              Have an invite code?
            </Text>
            <Text className="text-white/90 text-base font-uber-move-medium tracking-wide border-b border-white/90">
              Join here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

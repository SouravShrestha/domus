import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfilePassDto } from "@/types/api/response/profilePass";
import avatarImage from "@assets/images/0.png";
import { BadgeCheckIcon, CopyIcon, QRIcon } from "../icons";
import { showSuccessToast } from "@/utils/toast";

interface QRCodeBottomSheetProps {
  passData: ProfilePassDto | null;
  qrCodeUrl: string | null;
  isLoading?: boolean;
  onClose: () => void;
}

const QRCodeBottomSheet: React.FC<QRCodeBottomSheetProps> = ({
  passData,
  qrCodeUrl,
  isLoading: _isLoading = false,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

  const handleQRCodePress = () => {
    if (qrCodeUrl) {
      setIsFullScreenVisible(true);
    }
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenVisible(false);
  };

  const handleCopyCode = async () => {
    if (passData?.domusId) {
      await Clipboard.setStringAsync(passData.domusId);
      showSuccessToast("Code copied", null, 2000);
    }
  };

  return (
    <>
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <View className="px-6 pt-6">
          {/* Pass Details Section */}
          <View className="">
            <View className="flex-row items-start">
              {/* <ProfileIcon
                  username={passData.sharedData.name}
                  avatarUrl={passData.sharedData.photoUrl}
                  size={48}
                /> */}
              <View className="relative w-14 h-14 rounded-xl">
                <View
                  className="absolute top-0 left-0 w-14 h-14 rounded-xl"
                  style={{ backgroundColor: themedColors.border }}
                />
                <Image source={{ uri: passData?.sharedData.photoUrl }} className="w-14 h-14 rounded-xl" />
              </View>

              {passData ? (
                <View className="flex ml-4">
                  <View className="flex-row items-center">
                    <ThemedText className="text-lg font-uber-move-bold tracking-wider mr-2">
                      {passData.sharedData.name}
                    </ThemedText>
                    <View className="mb-0.5">
                      <BadgeCheckIcon
                        width={16}
                        height={16}
                        color={themedColors.accent}
                      />
                    </View>
                  </View>
                  <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider mt-0.5">
                    {passData.sharedData.phone}
                  </ThemedTextSecondary>
                </View>
              ) : (
                <View className="flex ml-4 w-full">
                  <View className="w-1/3 h-4 rounded-md" style={{ backgroundColor: themedColors.border }}/>
                  <View className="w-1/4 h-4 rounded-md mt-2" style={{ backgroundColor: themedColors.border }}/>
                </View>
              )}
            </View>
          </View>

          <ThemedHR style={{ marginBottom: 20, marginTop: 28 }}/>

          <View className="flex-row items-center">
            <QRIcon width={20} height={20} color={themedColors.text} />
            <ThemedText className="text-lg font-uber-move-medium tracking-wider ml-3">
              Scan QR Code
            </ThemedText>
          </View>

          <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider mt-2">
            Scan the QR code or manually share the code.
          </ThemedTextSecondary>

          <View
            className="mt-4 py-4 px-2 rounded-lg flex flex-row items-center"
          >
            <TouchableOpacity
              onPress={handleQRCodePress}
              activeOpacity={0.8}
              className="relative"
              style={{ width: 125, height: 125 }}
            >
              <View
                className="absolute rounded-lg"
                style={{
                  width: 125,
                  height: 125,
                  backgroundColor: themedColors.border,
                }}
              />
              <Image
                source={{ uri: qrCodeUrl }}
                style={{ width: 125, height: 125 }}
                resizeMode="contain"
                className="rounded-lg"
              />
            </TouchableOpacity>
            <View className="ml-7 justify-between flex">
              <View className="flex">
                <ThemedText className="text-base font-uber-move-medium tracking-wider">
                  Can't scan?
                </ThemedText>
                <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider">
                  Enter the code manually
                </ThemedTextSecondary>
              </View>
              <TouchableOpacity
                className="flex-row items-center mt-3 border px-2 py-1 rounded-md"
                style={{ borderColor: themedColors.border }}
                onPress={handleCopyCode}
                activeOpacity={0.4}
              >
                <ThemedText className="text-base font-uber-move-medium tracking-wider mr-2">
                  {passData?.domusId || "XXXXXXXXXXX"}
                </ThemedText>
                <CopyIcon width={16} height={16} color={themedColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Full Screen QR Code Modal */}
      <Modal
        visible={isFullScreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseFullScreen}
      >
        <TouchableOpacity
          style={styles.fullScreenBackdrop}
          activeOpacity={1}
          onPress={handleCloseFullScreen}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {qrCodeUrl && (
                <View
                  style={[styles.fullScreenQRContainer]}
                  className="rounded-lg flex items-center justify-center"
                >
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={styles.fullScreenQR}
                    resizeMode="contain"
                    className="rounded-lg"
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FULL_SCREEN_QR_SIZE = Math.min(SCREEN_WIDTH * 0.8, 400);

const styles = StyleSheet.create({
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullScreenQRContainer: {
    padding: 24,
    borderRadius: 16,
    maxWidth: "90%",
    maxHeight: "90%",
  },
  fullScreenQR: {
    width: FULL_SCREEN_QR_SIZE,
    height: FULL_SCREEN_QR_SIZE,
  },
});

export default QRCodeBottomSheet;

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SocietyPassDto } from "@/types/api/response/societyPass";
import avatarImage from "@assets/images/0.png";
import { BadgeCheckIcon, CopyIcon, QRIcon } from "../icons";
import { showSuccessToast } from "@/utils/toast";
import { format } from "date-fns";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface SocietyPassQRCodeBottomSheetProps {
  societyPassData: SocietyPassDto | null;
  qrCodeUrl: string | null;
  isLoading?: boolean;
  onClose: () => void;
}

const SocietyPassQRCodeBottomSheet: React.FC<
  SocietyPassQRCodeBottomSheetProps
> = ({
  societyPassData,
  qrCodeUrl,
  isLoading: _isLoading = false,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return "xxxx";
    }

    try {
      return format(new Date(value), "dd MMM, yyyy - hh:mm a");
    } catch {
      return value;
    }
  };

  const renderInfoTable = (rows: { label: string; value: string }[]) => (
    <View
      className="rounded-lg overflow-hidden border"
      style={{
        borderColor: themedColors.border,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={row.label}
          className="px-3 py-2.5 flex-row items-center justify-between"
          style={{
            borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
            borderColor: themedColors.border,
          }}
        >
          <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider uppercase items-left leading-5">
            {row.label}
          </ThemedTextSecondary>
          <ThemedText
            className="text-sm font-uber-move-medium tracking-wider text-right leading-6 flex-1 flex-wrap"
          >
            {row.value || "xxxxx"}
          </ThemedText>
        </View>
      ))}
    </View>
  );

  const renderSkeletonTable = (rowsCount: number) => (
    <View
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: themedColors.border }}
    >
      {Array.from({ length: rowsCount }).map((_, index) => (
        <View
          key={index}
          className="px-4 py-3"
          style={{
            borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
            borderColor: themedColors.border,
          }}
        >
          <View
            className="w-1/3 h-3 rounded-md"
            style={{ backgroundColor: themedColors.border }}
          />
          <View
            className="w-1/2 h-4 rounded-md mt-3 self-end"
            style={{ backgroundColor: themedColors.border }}
          />
        </View>
      ))}
    </View>
  );

  const addressValue = societyPassData?.society?.address
    ? `${societyPassData.society.address.street || "xxxxxx"} \n${societyPassData.society.address.city || "xxxxxx"}, ${societyPassData.society.address.state || "xxxxxx"} - ${societyPassData.society.address.zipCode || "xxxxxx"}`
    : "xxxxxx";

  const societyInfoRows = [
    {
      label: "Address",
      value: `${societyPassData?.society?.name || "xxxx"} \n${addressValue}`,
    }
  ];

  const passInfoRows = [
    {
      label: "Status",
      value: capitalizeFirstLetterOfWords(societyPassData?.status || "xxxx"),
    },
    {
      label: "Residence No.",
      value: societyPassData?.society?.code || "xxxx",
    },
  ];

  const handleQRCodePress = () => {
    if (qrCodeUrl) {
      setIsFullScreenVisible(true);
    }
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenVisible(false);
  };

  const handleCopyCode = async () => {
    if (societyPassData?.passCode) {
      await Clipboard.setStringAsync(societyPassData.passCode);
      showSuccessToast("Code copied", null, 2000);
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1 max-h-[85vh]"
        style={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={contentHeight > containerHeight}
        onLayout={({ nativeEvent }) =>
          setContainerHeight(nativeEvent.layout.height)
        }
        onContentSizeChange={(_, height) => setContentHeight(height)}
      >
        <View className="px-6 pt-6">
          {/* Pass Details Section */}
          <View className="">
            <View className="flex-row items-start">
              <View className="relative w-14 h-14 rounded-xl">
                <View
                  className="absolute top-0 left-0 w-14 h-14 rounded-xl"
                  style={{ backgroundColor: themedColors.border }}
                />
                <Image
                  source={
                    societyPassData?.sharedData?.photoUrl
                      ? { uri: societyPassData.sharedData.photoUrl }
                      : avatarImage
                  }
                  className="w-14 h-14 rounded-xl"
                  contentFit="cover"
                  transition={300}
                />
              </View>

              {societyPassData ? (
                <View className="flex ml-4">
                  <View className="flex-row items-center">
                    <ThemedText className="text-lg font-uber-move-bold tracking-wider mr-2">
                      {societyPassData.sharedData.name}
                    </ThemedText>
                    <View className="mb-0.5">
                      <BadgeCheckIcon
                        width={16}
                        height={16}
                        color={themedColors.accent}
                      />
                    </View>
                  </View>
                  {societyPassData.sharedData?.phone && (
                    <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider mt-0.5">
                      {societyPassData.sharedData.phone}
                    </ThemedTextSecondary>
                  )}
                </View>
              ) : (
                <View className="flex ml-4 w-full">
                  <View
                    className="w-1/3 h-4 rounded-md"
                    style={{ backgroundColor: themedColors.border }}
                  />
                  <View
                    className="w-1/4 h-4 rounded-md mt-2"
                    style={{ backgroundColor: themedColors.border }}
                  />
                </View>
              )}
            </View>
          </View>

          <View className="mt-2">
            <View className="">
              <View className="mt-3">
                {societyPassData
                  ? renderInfoTable(passInfoRows)
                  : renderSkeletonTable(passInfoRows.length)}
              </View>
            </View>
            <ThemedText className="text-xs font-uber-move-medium tracking-wider uppercase mt-5">
              Society Details
            </ThemedText>
            <View className="mt-3">
              {societyPassData
                ? renderInfoTable(societyInfoRows)
                : renderSkeletonTable(societyInfoRows.length)}
            </View>
          </View>

          <ThemedHR style={{ marginBottom: 20, marginTop: 24 }} />

          <View className="flex-row items-center">
            <QRIcon width={20} height={20} color={themedColors.text} />
            <ThemedText className="text-lg font-uber-move-medium tracking-wider ml-3">
              Scan QR Code
            </ThemedText>
          </View>

          <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider mt-1.5">
            Scan the QR code or manually share the code.
          </ThemedTextSecondary>

          <View className="mt-2 py-3 px-2 rounded-lg flex flex-row items-center">
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
                contentFit="contain"
                className="rounded-lg"
                transition={300}
              />
            </TouchableOpacity>
            <View className="ml-6 justify-between flex">
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
                  {societyPassData?.passCode}
                </ThemedText>
                <CopyIcon width={16} height={16} color={themedColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
                    contentFit="contain"
                    className="rounded-lg"
                    transition={300}
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

export default SocietyPassQRCodeBottomSheet;


import React, { useState, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StaffWithAssignment,
  STAFF_CATEGORIES,
  SHORT_DAY_NAMES,
  StaffCategory,
} from "@/types/models/staff";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import {
  CopyIcon,
  QRIcon,
  BoltIcon,
  BoltSlashIcon,
  ClockIcon,
  SettingsIcon,
  DownloadIcon,
  PaperPlaneIcon,
  EditIcon,
  PencilIcon,
} from "../../../../../components/icons";
import {
  AvatarCook,
  AvatarDriver,
  AvatarNanny,
  AvatarMaid,
  AvatarStaff,
} from "@/assets/image-icons";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import {
  shareQRCodeImage,
  shareUniversal,
  saveImageToGallery,
} from "@/utils/qrHelpers";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import logoImage from "@assets/icons/splash-icon-light.png";
import basicColors from "@/themes/colors";
import IconTagPill from "@/components/widgets/IconTagPill";

interface StaffQRCodeBottomSheetProps {
  staff: StaffWithAssignment | null;
  onEditPress?: () => void;
  canManageStaff?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.35, 140);
const FULL_SCREEN_QR_SIZE = Math.min(SCREEN_WIDTH * 0.75, 350);

const StaffQRCodeBottomSheet: React.FC<StaffQRCodeBottomSheetProps> = ({
  staff,
  onEditPress,
  canManageStaff = false,
}) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const qrRef = useRef<ViewShot>(null);

  const qrValue = useMemo(() => {
    if (!staff?.assignment.id) return "";
    return `domus://staff/${staff.assignment.id}`;
  }, [staff?.assignment.id]);

  if (!staff) return null;

  const getCategoryLabel = (category: string) => {
    return (
      STAFF_CATEGORIES.find((c) => c.value === category)?.label || category
    );
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      maid: basicColors.lightPink,
      cook: basicColors.orange,
      driver: basicColors.blue,
      nanny: basicColors.lightPink,
      other: basicColors.gray,
    };
    return colors[category] || basicColors.gray;
  };

  const getCategoryAvatar = (category: StaffCategory) => {
    const avatars: Record<string, any> = {
      maid: AvatarMaid,
      cook: AvatarCook,
      driver: AvatarDriver,
      nanny: AvatarNanny,
    };
    return avatars[category] || AvatarStaff;
  };

  const getScheduleSummary = (): string => {
    const activeSchedules = staff.schedules.filter((s) => s.is_active);
    if (activeSchedules.length === 0) return "No schedule set";
    if (activeSchedules.length === 7) return "Every day";

    const days = activeSchedules.map((s) => SHORT_DAY_NAMES[s.day_of_week]);
    return days.join(", ");
  };

  const getTimingInfo = (): string => {
    const activeSchedule = staff.schedules.find((s) => s.is_active);
    if (!activeSchedule) return "No timing set";

    const formatTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.slice(0, 5).split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    return `${formatTo12Hour(activeSchedule.start_time)} - ${formatTo12Hour(activeSchedule.end_time)}`;
  };

  const accessDisabled = staff.is_access_disabled || false;
  const isInactive = staff.assignment.status === "inactive" || accessDisabled;
  const categoryColor = getCategoryColor(staff.category);

  const handleCopyCode = async () => {
    if (staff.helper_code) {
      await Clipboard.setStringAsync(staff.helper_code);
      showSuccessToast("Staff code copied", null, 2000);
    }
  };

  const handleQRCodePress = () => {
    setIsFullScreenVisible(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenVisible(false);
  };

  const handleShare = async () => {
    try {
      if (qrRef.current?.capture) {
        const uri = await qrRef.current.capture();
        const message = buildStaffShareMessage();
        await shareQRCodeImage(uri, message);
      }
    } catch {
      const message = buildStaffShareMessage();
      await shareUniversal("Domus Staff Pass", message);
    }
  };

  const handleSave = async () => {
    try {
      if (qrRef.current?.capture) {
        const uri = await qrRef.current.capture();
        const success = await saveImageToGallery(uri);
        if (success) {
          showSuccessToast("QR code saved to gallery", null, 2000);
        } else {
          showErrorToast("Failed to save QR code", null, 2000);
        }
      }
    } catch {
      showErrorToast("Failed to save QR code", null, 2000);
    }
  };

  const buildStaffShareMessage = (): string => {
    return `${staff.name}\n${getCategoryLabel(staff.category)}\n\nStaff Pass Code: ${staff.helper_code}\n\nPowered by Domus`;
  };

  return (
    <>
      <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="px-6 pt-4">
          <View className="flex-row items-center mb-4">
            <Image
              source={
                staff.image_url
                  ? { uri: staff.image_url }
                  : getCategoryAvatar(staff.category)
              }
              className="w-[52px] h-[52px] rounded-full"
              contentFit="cover"
            />
            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                  {staff.name}
                </ThemedText>
              </View>
              <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
                {formatPhoneForDisplay(staff.phone)}
              </ThemedTextSecondary>
            </View>

            <IconTagPill
              iconKey={getCategoryLabel(staff.category).toLowerCase()}
              label={getCategoryLabel(staff.category)}
            />
          </View>

          {isInactive && (
            <View
              className="mb-4 p-3 rounded-md flex-row items-center"
              style={{
                backgroundColor: themedColors.error + "15",
                borderWidth: 1,
                borderColor: themedColors.error + "30",
              }}
            >
              <BoltSlashIcon
                width={16}
                height={16}
                color={themedColors.error}
              />
              <ThemedText
                className="font-uber-move-medium text-sm ml-2 tracking-wider"
                style={{ color: themedColors.error }}
              >
                Access currently disabled
              </ThemedText>
            </View>
          )}

          <View
            className="rounded-md overflow-hidden"
            style={{
              backgroundColor: themedColors.cardBackground,
              borderWidth: 1,
              borderColor:
                currentTheme === "dark"
                  ? themedColors.border + "30"
                  : themedColors.border,
            }}
          >
            <View
              className="flex-row items-center justify-between py-3 px-4"
              style={{
                borderBottomWidth: 1,
                borderColor:
                  currentTheme === "dark"
                    ? themedColors.border + "30"
                    : themedColors.border,
              }}
            >
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Schedule
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-lato-regular">
                {getScheduleSummary()}
              </ThemedText>
            </View>

            <View className="flex-row items-center justify-between py-3 px-4">
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Timing
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-lato-regular">
                {getTimingInfo()}
              </ThemedText>
            </View>
          </View>

          <View
            className="rounded-md p-4 flex-row items-center mt-4"
            style={{
              backgroundColor: themedColors.cardBackground,
              borderWidth: 1,
              borderColor:
                currentTheme === "dark"
                  ? themedColors.border + "30"
                  : themedColors.border,
            }}
          >
            <ViewShot ref={qrRef} options={{ format: "png", quality: 1 }}>
              <TouchableOpacity
                onPress={handleQRCodePress}
                activeOpacity={0.8}
                className="rounded-sm overflow-hidden p-2"
                style={{
                  backgroundColor: themedColors.qrBackground,
                  borderColor: themedColors.border,
                }}
              >
                <QRCode
                  value={qrValue}
                  size={QR_SIZE}
                  logo={logoImage}
                  logoSize={39}
                  logoBackgroundColor={
                    currentTheme === "dark"
                      ? themedColors.qrBackground
                      : themedColors.text
                  }
                  logoMargin={14}
                  logoBorderRadius={0}
                  color={themedColors.text}
                  backgroundColor={"transparent"}
                />
              </TouchableOpacity>
            </ViewShot>

            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <QRIcon width={16} height={16} color={themedColors.text} />
                <ThemedText className="text-sm font-uber-move-medium tracking-wide ml-2">
                  Scan for Entry
                </ThemedText>
              </View>
              <ThemedTextSecondary className="text-xs font-lato-regular tracking-wide mt-1">
                Show at the gate for entry
              </ThemedTextSecondary>

              <TouchableOpacity
                className="flex-row items-center mt-3 border px-3 py-2 rounded-md"
                style={{ borderColor: themedColors.border }}
                onPress={handleCopyCode}
                activeOpacity={0.6}
              >
                <ThemedText
                  className="text-base font-uber-move-medium tracking-widest flex-1"
                  numberOfLines={1}
                >
                  {staff.helper_code}
                </ThemedText>
                <CopyIcon width={14} height={14} color={themedColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row mt-4" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center py-3 rounded-md"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderWidth: 1,
                borderColor:
                  currentTheme === "dark"
                    ? themedColors.border + "50"
                    : themedColors.border,
              }}
            >
              <DownloadIcon width={16} height={16} color={themedColors.text} />
              <Text
                className="text-sm font-uber-move-medium ml-2"
                style={{ color: themedColors.text }}
              >
                Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center py-3 rounded-md"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderWidth: 1,
                borderColor:
                  currentTheme === "dark"
                    ? themedColors.border + "50"
                    : themedColors.border,
              }}
            >
              <PaperPlaneIcon
                width={14}
                height={14}
                color={themedColors.text}
              />
              <Text
                className="text-sm font-uber-move-medium ml-2"
                style={{ color: themedColors.text }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {canManageStaff && onEditPress && (
            <TouchableOpacity
              onPress={onEditPress}
              activeOpacity={0.7}
              className="flex-row items-center justify-center py-4 rounded-md mt-4"
              style={{
                backgroundColor: themedColors.buttonBackground,
              }}
            >
              <PencilIcon
                width={14}
                height={14}
                color={themedColors.buttonText}
              />
              <Text
                className="text-sm font-uber-move-medium ml-2 tracking-wide"
                style={{ color: themedColors.buttonText }}
              >
                Edit details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
              <View
                className="rounded-md p-6"
                style={{
                  ...styles.fullScreenQRContainer,
                  backgroundColor: themedColors.qrBackground,
                  borderColor: themedColors.border,
                }}
              >
                <QRCode
                  value={qrValue}
                  size={FULL_SCREEN_QR_SIZE}
                  logo={logoImage}
                  logoSize={60}
                  logoBackgroundColor={
                    currentTheme === "dark"
                      ? themedColors.qrBackground
                      : themedColors.text
                  }
                  logoMargin={14}
                  logoBorderRadius={0}
                  color={themedColors.text}
                  backgroundColor={"transparent"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
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
  },
});

export default StaffQRCodeBottomSheet;

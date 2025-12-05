import { Share, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

export interface QRCodeOptions {
  size?: number;
  logo?: string;
  logoSize?: number;
  logoBackgroundColor?: string;
  backgroundColor?: string;
  color?: string;
}

export const defaultQROptions: QRCodeOptions = {
  size: 200,
  logoSize: 40,
  logoBackgroundColor: "#ffffff",
  backgroundColor: "#ffffff",
  color: "#000000",
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
};

export const shareViaSms = async (
  phone: string,
  message: string
): Promise<boolean> => {
  try {
    const smsUrl = Platform.select({
      ios: `sms:${phone}&body=${message}`,
      android: `sms:${phone}?body=${message}`,
    });

    if (smsUrl) {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const shareUniversal = async (
  title: string,
  message: string
): Promise<boolean> => {
  try {
    const result = await Share.share({
      title,
      message,
    });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
};

export const buildInviteMessage = (
  name: string,
  role: string,
  inviteCode: string,
  appLink: string = "https://domus.app"
): string => {
  return `Hi ${name}! You've been invited to join our residence on Domus. Use this invite code to get started: ${inviteCode}\n\nDownload Domus: ${appLink}`;
};

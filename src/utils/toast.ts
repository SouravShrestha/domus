import { ToastTypeEnum } from "@/types/common/enums";
import Toast from "react-native-toast-message";

type ToastType = ToastTypeEnum;

interface ShowToastOptions {
  type: ToastType;
  text1: string;
  text2?: string;
  visibilityTime?: number;
  position?: "top" | "bottom";
}

export const showToast = ({
  type,
  text1,
  text2,
  visibilityTime = 3000,
  position = "top",
}: ShowToastOptions) => {
  Toast.show({
    type,
    text1,
    text2,
    position,
    visibilityTime,
    autoHide: true,
    topOffset: 60,
  });
};

export const showSuccessToast = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: ToastTypeEnum.SUCCESS, text1, text2, visibilityTime });

export const showErrorToast = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: ToastTypeEnum.ERROR, text1, text2, visibilityTime });

export const showInfoToast = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: ToastTypeEnum.INFO, text1, text2, visibilityTime });

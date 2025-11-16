import React from "react";
import { View, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";
import { themeColors } from "@themes/colors";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/configs/toastConfig";
import loadForDarkJson from "@assets/animations/load-for-dark.json";
import loadForLightJson from "@assets/animations/load-for-light.json";

interface LoadingOverlayProps {
  currentTheme: "light" | "dark";
  withToast?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ currentTheme, withToast = false }) => {
  const backgroundColor = themeColors[currentTheme]?.backdrop || "#000";

  return (
    <View
      style={{
        backgroundColor,
        zIndex: 10000,
        elevation: 10000,
      }}
      className="absolute justify-center items-center w-full h-full"
      pointerEvents="auto"
    >
      {withToast && <Toast position="top" config={toastConfig}/>}
      <LottieView
        source={
          currentTheme === "dark"
            ? loadForDarkJson
            : loadForLightJson
        }
        autoPlay
        loop
        speed={1}
        resizeMode="cover"
        style={{ width: 100, height: 100 } as ViewStyle}
      />
    </View>
  );
};

export default LoadingOverlay;

import { useEffect } from "react";
import { StatusBar, ColorSchemeName } from "react-native";
import { useTheme } from "@/contexts/themeContext";

type StatusBarMode = "auto" | "light" | "dark";

/**
 * Custom hook to set the status bar style based on the current theme
 * @param mode - "auto" to follow theme, "light" for light content, "dark" for dark content
 */
export const useStatusBarStyle = (mode: StatusBarMode = "auto"): void => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    let barStyle: "light-content" | "dark-content" | "default" = "default";

    if (mode === "auto") {
      barStyle = currentTheme === "dark" ? "light-content" : "dark-content";
    } else if (mode === "light") {
      barStyle = "light-content";
    } else if (mode === "dark") {
      barStyle = "dark-content";
    }

    StatusBar.setBarStyle(barStyle, true);
  }, [currentTheme, mode]);
};

export default useStatusBarStyle;

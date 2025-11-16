import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewProps,
  TextProps,
  ScrollViewProps,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { StatusBarStyle } from "react-native";

import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ThemedComponentProps {
  style?: object;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const ThemedView: React.FC<ThemedComponentProps & ViewProps> = ({
  style,
  children,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const backgroundColor = themeColors[currentTheme]?.background ?? "#fff";

  return (
    <View style={[{ backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
};

export const ThemedDarkView: React.FC<ThemedComponentProps & ViewProps> = ({
  style,
  children,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const backgroundColor = themeColors[currentTheme]?.darkBackground ?? "#000";

  return (
    <View style={[{ backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
};

export const ThemedText: React.FC<ThemedComponentProps & TextProps> = ({
  style,
  children,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const color = themeColors[currentTheme]?.text ?? "#000";

  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
};

export const ThemedTextSecondary: React.FC<
  ThemedComponentProps & TextProps
> = ({ style, children, ...props }) => {
  const { currentTheme } = useTheme();
  const color = themeColors[currentTheme]?.secondaryText ?? "#6b7280";

  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
};

export const ThemedSafeAreaView: React.FC<
  ThemedComponentProps & SafeAreaViewProps
> = ({ style, children, ...props }) => {
  const { currentTheme } = useTheme();
  const backgroundColor = themeColors[currentTheme]?.background ?? "#fff";

  return (
    <SafeAreaView style={[{ backgroundColor }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

export const ThemedScrollView: React.FC<
  ThemedComponentProps & ScrollViewProps
> = ({ style, children, ...props }) => {
  const { currentTheme } = useTheme();
  const backgroundColor = themeColors[currentTheme]?.background ?? "#fff";

  return (
    <ScrollView
      style={[{ backgroundColor }, style]}
      {...props}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

interface ThemedHRProps {
  style?: object;
  thickness?: number;
  color?: string;
  [key: string]: unknown;
}

export const ThemedHR: React.FC<ThemedHRProps> = ({
  style,
  thickness = StyleSheet.hairlineWidth,
  color,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const defaultColor = color ?? themeColors[currentTheme]?.line ?? "#ccc";

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: defaultColor,
          width: "100%",
          alignSelf: "stretch",
        },
        style,
      ]}
      {...props}
    />
  );
};

interface ThemedStatusBarProps {
  mode?: "auto" | "light" | "dark";
  [key: string]: unknown;
}

export const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({
  mode = "auto",
  ...props
}) => {
  const { currentTheme } = useTheme();

  const _barStyle: StatusBarStyle =
    mode === "auto"
      ? currentTheme === "dark"
        ? "light-content"
        : "dark-content"
      : "default";

  return <StatusBar barStyle={_barStyle} {...props} />;
};

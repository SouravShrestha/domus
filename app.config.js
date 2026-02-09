import { config } from "dotenv";
import path from "path";

const APP_ENV = process.env.APP_ENV || "development";
const envFile = `.env.${APP_ENV}`;

config({ path: path.resolve(process.cwd(), envFile) });

const envConfig = {
  development: {
    name: "Domus-dev",
    bundleIdentifier: "com.souravshrestha.domus.dev",
    package: "com.souravshrestha.domus.dev",
    icon: "./src/assets/icons/icon-ios-dev.icon",
  },
  preview: {
    name: "Domus-preview",
    bundleIdentifier: "com.souravshrestha.domus.preview",
    package: "com.souravshrestha.domus.preview",
    icon: "./src/assets/icons/icon-ios-preview.icon",
  },
  production: {
    name: "Domus",
    bundleIdentifier: "com.souravshrestha.domus",
    package: "com.souravshrestha.domus",
    icon: "./src/assets/icons/icon-ios.icon",
  },
};

const currentEnv = envConfig[APP_ENV] || envConfig.development;

export default {
  expo: {
    name: currentEnv.name,
    slug: "Domus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/icons/ios-dark.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "domus",
    ios: {
      supportsTablet: true,
      bundleIdentifier: currentEnv.bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "We need access to your camera to scan QR codes for joining residences.",
      },
      icon: currentEnv.icon,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/icons/adaptive-icon.png",
        monochromeImage: "./src/assets/icons/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: currentEnv.package,
    },
    web: {
      favicon: "./src/assets/icons/adaptive-icon.png",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0062E3",
          image: "./src/assets/icons/splash-icon-light.png",
          dark: {
            image: "./src/assets/icons/splash-icon-light.png",
            backgroundColor: "#000B13",
          },
          imageWidth: 200,
        },
      ],
      "expo-router",
      "./plugins/withRemoveiOSNotificationEntitlement",
    ],
    extra: {
      eas: {
        projectId: "4c656a86-faf4-4ce7-9527-517a4a8674a0",
      },
      APP_ENV,
    },
    owner: "souravshrestha",
  },
};

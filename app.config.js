import "dotenv/config";

export default {
  expo: {
    name: "Domus",
    slug: "Domus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/icons/ios-dark.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "domus",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.souravshrestha.domus",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      icon: {
        dark: "./src/assets/icons/ios-dark.png",
        light: "./src/assets/icons/ios-light.png",
        tinted: "./src/assets/icons/ios-tinted.png",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/icons/adaptive-icon.png",
        monochromeImage: "./src/assets/icons/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.souravshrestha.domus",
    },
    web: {
      favicon: "./src/assets/icons/adaptive-icon.png",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0058da",
          image: "./src/assets/icons/splash-icon-light.png",
          dark: {
            image: "./src/assets/icons/splash-icon-light.png",
            backgroundColor: "#000B13",
          },
          imageWidth: 200,
        },
      ],
      "expo-router",
    ],
    extra: {
      eas: {
        projectId: "4c656a86-faf4-4ce7-9527-517a4a8674a0",
      },
    },
    owner: "souravshrestha",
  },
};

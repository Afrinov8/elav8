import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Elav8",
  slug: "elev8",
  owner: "afrinov8i",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "elav8",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.elav8.mobile",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#F7F1E7",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.elav8.mobile",
    permissions: [],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-skyline.jpg",
        imageWidth: 900,
        resizeMode: "cover",
        backgroundColor: "#24211D",
        dark: {
          backgroundColor: "#24211D",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  // The EAS project auto-created for this repo (@afrinov8i/elev8) — `eas
  // init` normally writes this, but can't in non-interactive builds, and
  // can't write into a .ts config anyway, so it's pinned here directly.
  extra: {
    eas: {
      projectId: "23cbda73-7244-4daa-a2d5-fb04f3f177a1",
    },
  },
};

export default config;

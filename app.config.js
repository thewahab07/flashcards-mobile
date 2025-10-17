import "dotenv/config";
export default ({ config }) => ({
  ...config,
  name: "Flash",
  slug: "flashcards",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
  },

  android: {
    versionCode: 4,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.orion.flash",
    googleServicesFile: "./android/app/google-services.json",
    intentFilters: [
      {
        action: "VIEW",
        data: {
          scheme: "myapp",
        },
        category: ["DEFAULT", "BROWSABLE"],
      },
    ],
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: process.env.ADMOB_APP_ID,
      },
    ],
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#000000",
        sounds: [],
        mode: "production",
        useNextNotificationsApi: true,
      },
    ],
    "expo-font",
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "61bc47ba-079d-4195-a00b-983b243226a1",
    },
    admobBannerId: process.env.ADMOB_BANNER_ID,
    admobInterstitialId: process.env.ADMOB_INTERSTITIAL_ID,
    admobRewardedInterstitialId: process.env.ADMOB_REWARDED_INTERSTITIAL_ID,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },
});

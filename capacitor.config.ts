
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stckr.keeptrack',
  appName: 'STCKR - Keep Track',
  webDir: 'dist',
  // Remove server config for production builds
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    },
    StatusBar: {
      style: "default",
      backgroundColor: "#ffffff"
    },
    App: {
      handleUrl: {
        customScheme: 'stckr'
      }
    }
  }
};

export default config;


import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stckr.keeptrack',
  appName: 'STCKR - Keep Track',
  webDir: 'dist',
  // Remove server config for production builds
  ios: {
    contentInset: 'automatic',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to take photos of your items for easy identification and organization.',
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to let you select and attach photos to your items for better organization.',
      NSPhotoLibraryAddUsageDescription: 'This app saves photos you take to your photo library for backup and easy access.'
    }
  },
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
    },
    Browser: {
      // OAuth redirect handling
    },
    Camera: {
      // Use default camera for better iOS compatibility
      iosUseDefaultImagePicker: false,
      // Enhanced permissions for iOS
      enableBackup: false,
      permissions: ['camera', 'photos']
    },
    Purchases: {
      // RevenueCat configuration
    },
    SignInWithApple: {
      clientId: 'com.stckr.supabase.oauth',
      redirectURI: 'https://cudftlquaydissmvqjmv.supabase.co/auth/v1/callback'
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_GOOGLE_CLIENT_ID',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;

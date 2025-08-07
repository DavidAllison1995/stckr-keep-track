
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stckr.keeptrack',
  appName: 'STCKR - Keep Track',
  webDir: 'dist',
  // Remove server config for production builds
  ios: {
    contentInset: 'automatic',
    infoPlist: {
      NSCameraUsageDescription: 'STCKR uses the camera to take photos of your items for easy identification, organization, and QR code scanning to track your belongings.',
      NSPhotoLibraryUsageDescription: 'STCKR accesses your photo library to let you select and attach photos to your items for better organization and visual identification of your belongings.',
      NSPhotoLibraryAddUsageDescription: 'STCKR saves photos you take to your photo library for backup and easy access to your item documentation.',
      NSLocationWhenInUseUsageDescription: 'STCKR may use your location to help organize items by location for better tracking and management.',
      NSMicrophoneUsageDescription: 'STCKR may access the microphone for camera functionality when taking photos of your items.',
      NSContactsUsageDescription: 'STCKR may access contacts to enable sharing item information with trusted contacts.',
      NSCalendarsUsageDescription: 'STCKR accesses your calendar to schedule and track maintenance reminders for your items.',
      NSRemindersUsageDescription: 'STCKR accesses reminders to create maintenance alerts and notifications for your tracked items.',
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'STCKR OAuth',
          CFBundleURLSchemes: ['stckr', 'com.stckr.keeptrack']
        }
      ]
    }
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1049043334764-p0c5vpjqt1n2nvddvo9lbdbdnfnuafnq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      redirectUri: 'com.stckr.keeptrack://callback'
    },
    SignInWithApple: {
      clientId: 'com.stckr.keeptrack.service',
      redirectUri: 'com.stckr.keeptrack://callback'
    },
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
        customScheme: 'com.stckr.keeptrack'
      }
    },
    Browser: {
      // OAuth redirect handling for web fallback
    },
    Camera: {
      iosUseDefaultImagePicker: false,
      enableBackup: false,
      permissions: ['camera', 'photos']
    },
    Purchases: {
      // RevenueCat configuration
    }
  },
  cordova: {
    preferences: {
      AndroidScheme: 'com.stckr.keeptrack',
      IOSUrlScheme: 'com.stckr.keeptrack'
    }
  }
};

export default config;

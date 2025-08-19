
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stckr.keeptrack',
  appName: 'STCKR - Keep Track',
  webDir: 'dist',
  // Remove server config for production builds
  ios: {
    contentInset: 'automatic',
    infoPlist: {
      NSCameraUsageDescription: 'STCKR uses the camera to take photos of your items for easy identification, organization, and QR code scanning to track your belongings. Camera access enables you to capture high-quality images for item documentation and maintenance records. The app may use camera reaction effects (AVCaptureDevice.reactionEffectGesturesEnabled) to enhance the photo-taking experience.',
      NSPhotoLibraryUsageDescription: 'STCKR accesses your photo library to let you select existing photos and attach them to your items for better organization and visual identification of your belongings. This allows you to use photos you\'ve already taken to document your items without needing to retake them.',
      NSPhotoLibraryAddUsageDescription: 'STCKR saves photos you take of your items to your photo library for backup and easy access to your item documentation. This ensures your item photos are safely stored and accessible outside the app.',
      NSLocationWhenInUseUsageDescription: 'STCKR may use your location to help organize items by location for better tracking and management.',
      NSMicrophoneUsageDescription: 'STCKR may access the microphone for camera functionality when taking photos of your items.',
      NSContactsUsageDescription: 'STCKR may access contacts to enable sharing item information with trusted contacts.',
      NSCalendarsUsageDescription: 'STCKR accesses your calendar to schedule and track maintenance reminders for your items.',
      NSRemindersUsageDescription: 'STCKR accesses reminders to create maintenance alerts and notifications for your tracked items.',
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'STCKR OAuth',
          CFBundleURLSchemes: ['stckr', 'com.stckr.keeptrack', 'com.googleusercontent.apps.1004044323466-ij201m6vumudnmlj8k3dbrqp799g9vbn']
        },
        {
          CFBundleURLName: 'STCKR Deep Links',
          CFBundleURLSchemes: ['stckr']
        }
      ],
      com_apple_developer_associated_domains: ['applinks:stckr.io']
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

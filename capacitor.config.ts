
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
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1004044323466-qskm9l5081ithk4572h677kdh2soi8ar.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    SignInWithApple: {
      clientId: 'com.stckr.keeptrack',
      redirectURI: 'https://4823056e-21ba-4628-9925-ad01b2666856.lovableproject.com/dashboard'
    }
  }
};

export default config;

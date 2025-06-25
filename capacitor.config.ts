
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4823056e21ba46289925ad01b2666856',
  appName: 'stckr-keep-track',
  webDir: 'dist',
  server: {
    url: 'https://4823056e-21ba-4628-9925-ad01b2666856.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;

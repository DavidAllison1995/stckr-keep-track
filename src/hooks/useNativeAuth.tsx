import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export const useNativeAuth = () => {
  useEffect(() => {
    // Initialize GoogleAuth when the app starts
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: 'your-google-client-id.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);
};
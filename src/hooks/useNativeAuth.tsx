import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export const useNativeAuth = () => {
  useEffect(() => {
    // Initialize GoogleAuth when the app starts
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '1004044323466-qskm9l5081ithk4572h677kdh2soi8ar.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);
};
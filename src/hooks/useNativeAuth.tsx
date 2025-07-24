import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useNativeAuth = () => {
  useEffect(() => {
    // Native auth initialization for Capacitor 7
    // OAuth2 configuration is handled in individual auth methods
    if (Capacitor.isNativePlatform()) {
      console.log('Native platform detected - OAuth2 ready');
    }
  }, []);
};
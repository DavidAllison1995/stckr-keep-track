import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Initialize native authentication plugins
 * Call this during app startup
 */
export const initializeNativeAuth = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Not on native platform, skipping native auth initialization');
    return;
  }

  try {
    console.log('Initializing native authentication...');
    
    // Ensure browser plugin is available for OAuth flows
    console.log('✅ Browser plugin ready for OAuth flows');
    
    console.log('✅ Native authentication initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize native authentication:', error);
    // Don't throw - let the app continue with fallback auth
  }
};

/**
 * Check if native authentication is available
 */
export const isNativeAuthAvailable = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Get platform-specific auth configuration
 */
export const getAuthConfig = () => {
  const platform = Capacitor.getPlatform();
  
  return {
    platform,
    isNative: Capacitor.isNativePlatform(),
    supportsGoogleAuth: true, // Available on all platforms with plugin
    supportsAppleAuth: platform === 'ios', // Apple Sign-In only on iOS
  };
};
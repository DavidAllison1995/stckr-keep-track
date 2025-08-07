import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';

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
    
    // Initialize Google Auth
    await GoogleAuth.initialize({
      clientId: '1049043334764-p0c5vpjqt1n2nvddvo9lbdbdnfnuafnq.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    console.log('✅ GoogleAuth plugin initialized');
    
    // Initialize Apple Sign-In (iOS only)
    if (Capacitor.getPlatform() === 'ios') {
      console.log('✅ AppleSignIn plugin enabled');
    }
    
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
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * Comprehensive camera permission handler for both iOS and Android
 */
export const checkAndRequestCameraPermissions = async (): Promise<PermissionResult> => {
  console.log('CameraPermissions: Starting permission check...');
  console.log('CameraPermissions: Platform info:', {
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform()
  });

  if (!Capacitor.isNativePlatform()) {
    console.log('CameraPermissions: Web platform detected, allowing browser to handle permissions');
    return { granted: true, message: 'Web platform - permissions handled by browser' };
  }

  try {
    console.log('CameraPermissions: Native platform detected, checking camera permissions...');
    
    // Check if Camera plugin is available
    if (!Camera) {
      console.error('CameraPermissions: Camera plugin not available');
      return { granted: false, message: 'Camera plugin not available. Please run "npx cap sync" to install native plugins.' };
    }

    // Check current permission status with timeout
    const permissionStatus = await Promise.race([
      Camera.checkPermissions(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permission check timeout')), 5000)
      )
    ]) as any;
    
    console.log('Current permission status:', permissionStatus);

    // If camera permission is already granted
    if (permissionStatus.camera === 'granted') {
      return { granted: true };
    }

    // If permission is denied or prompt needed, request it
    if (permissionStatus.camera === 'denied' || permissionStatus.camera === 'prompt' || permissionStatus.camera === 'prompt-with-rationale') {
      console.log('Requesting camera permissions...');
      
      // Request with timeout
      const requestResult = await Promise.race([
        Camera.requestPermissions({ permissions: ['camera'] }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Permission request timeout')), 10000)
        )
      ]) as any;
      
      console.log('Permission request result:', requestResult);

      if (requestResult.camera === 'granted') {
        return { granted: true };
      } else if (requestResult.camera === 'denied') {
        const platform = Capacitor.getPlatform();
        const settingsPath = platform === 'ios' 
          ? 'Settings > Privacy & Security > Camera' 
          : 'Settings > Apps > STCKR > Permissions > Camera';
        
        return {
          granted: false,
          message: `Camera permission denied. Please enable camera access in ${settingsPath} and restart the app.`
        };
      }
    }

    return {
      granted: false,
      message: 'Camera permission is required but could not be granted.'
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    
    // Handle specific error cases
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as { message: string }).message;
      
      if (errorMessage.includes('not implemented') || errorMessage.includes('not supported')) {
        console.log('Permission API not supported, assuming OS-level handling');
        return { granted: true, message: 'Permission handling delegated to OS' };
      }
      
      if (errorMessage.includes('timeout')) {
        return { 
          granted: false, 
          message: 'Camera permission check timed out. Please try again or check device settings.' 
        };
      }
    }

    return {
      granted: false,
      message: 'Unable to check camera permissions. Please ensure camera access is enabled in your device settings.'
    };
  }
};

/**
 * Test camera availability without taking a photo
 */
export const testCameraAvailability = async (): Promise<PermissionResult> => {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }

  try {
    // First check permissions
    const permissionResult = await checkAndRequestCameraPermissions();
    if (!permissionResult.granted) {
      return permissionResult;
    }

    console.log('Testing camera availability...');
    // We can't easily test camera without actually trying to use it
    // So we'll just return the permission result
    return { granted: true, message: 'Camera permissions verified' };
  } catch (error) {
    console.error('Camera availability test failed:', error);
    return {
      granted: false,
      message: 'Camera may not be available on this device or is currently in use.'
    };
  }
};
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
  if (!Capacitor.isNativePlatform()) {
    return { granted: true, message: 'Web platform - permissions handled by browser' };
  }

  try {
    console.log('Checking camera permissions...');
    
    // Check current permission status
    const permissionStatus = await Camera.checkPermissions();
    console.log('Current permission status:', permissionStatus);

    // If camera permission is already granted, check photos permission
    if (permissionStatus.camera === 'granted') {
      // Camera access is sufficient for capture. Photo Library is only needed when saving to or picking from Photos.
      // We won't request Photos here to avoid unnecessary prompts/crashes on some devices.
      return { granted: true };
    }

    // If permission is denied, request it
    if (permissionStatus.camera === 'denied' || permissionStatus.camera === 'prompt') {
      console.log('Requesting camera permissions...');
      const requestResult = await Camera.requestPermissions({ permissions: ['camera'] });
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
    
    // On older devices or platforms that don't support the permission API,
    // we'll assume permissions are handled at the OS level
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as { message: string }).message;
      if (errorMessage.includes('not implemented') || errorMessage.includes('not supported')) {
        console.log('Permission API not supported, assuming OS-level handling');
        return { granted: true, message: 'Permission handling delegated to OS' };
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
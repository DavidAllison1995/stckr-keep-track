import { Camera, CameraPermissionState } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export interface PermissionResult {
  granted: boolean;
  message?: string;
  state?: CameraPermissionState;
}

export const openAppSettings = async () => {
  try { 
    if (Capacitor.isNativePlatform() && 'openSettings' in App) {
      (App as any).openSettings(); 
    }
  } catch {}
};

const isGranted = (state?: CameraPermissionState) =>
  state === 'granted' || state === 'limited';

export const checkAndRequestCameraPermissions = async (): Promise<PermissionResult> => {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true, state: 'granted' };
  }

  try {
    const current = await Camera.checkPermissions();
    if (isGranted(current.camera)) {
      return { granted: true, state: current.camera };
    }
    const requested = await Camera.requestPermissions({ permissions: ['camera'] });
    if (isGranted(requested.camera)) {
      return { granted: true, state: requested.camera };
    }
    return {
      granted: false,
      state: requested.camera,
      message: 'Camera access is required. Please enable camera permissions in Settings.',
    };
  } catch (e) {
    return { granted: false, message: 'Unable to check/request camera permissions.' };
  }
};

export const testCameraAvailability = async (): Promise<PermissionResult> => {
  return checkAndRequestCameraPermissions();
};
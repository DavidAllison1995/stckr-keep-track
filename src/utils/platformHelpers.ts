import { Capacitor } from '@capacitor/core';

export const isLikelySimulator = () => {
  // Basic heuristic: iOS simulator lacks real camera
  return Capacitor.getPlatform() === 'ios' && !navigator.mediaDevices;
};
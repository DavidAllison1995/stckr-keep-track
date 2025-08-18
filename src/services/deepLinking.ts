import { Capacitor } from '@capacitor/core';

/**
 * Deep linking service for handling app/web universal links
 */
export const deepLinkingService = {
  /**
   * Check if we're running in a native app environment
   */
  isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Generate proper deep link URLs for QR codes
   */
  generateQRDeepLink(qrCode: string): string {
    return `https://stckr.io/qr/${qrCode}`;
  },

  /**
   * Generate proper deep link URLs for items
   */
  generateItemDeepLink(itemId: string): string {
    return `https://stckr.io/item/${itemId}`;
  },

  /**
   * Handle redirects with app preference on mobile
   */
  redirectToItem(itemId: string): void {
    const universalLink = this.generateItemDeepLink(itemId);
    
    if (this.isNativeApp()) {
      // In native app, use regular navigation
      window.location.href = `/items/${itemId}`;
    } else {
      // On web, redirect to universal link (works with or without app)
      window.location.href = universalLink;
    }
  },

  /**
   * Handle QR code redirects with proper deep linking
   */
  redirectToQR(qrCode: string): void {
    const qrLink = this.generateQRDeepLink(qrCode);
    
    if (this.isNativeApp()) {
      // In native app, use regular navigation
      window.location.href = `/qr/${qrCode}`;
    } else {
      // On web, redirect to universal link
      window.location.href = qrLink;
    }
  }
};
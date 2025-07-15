import { supabase } from '@/integrations/supabase/client';

export interface QRCodeData {
  userID: string;
  itemID: string;
  url: string;
  qrCodeImageUrl: string;
}

export const qrGenerator = {
  /**
   * Generate a QR code with direct userID+itemID format
   * Format: https://stckr.io/qr?userID={userID}&itemID={itemID}
   */
  generateDirectQRCode(userID: string, itemID: string): QRCodeData {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/qr?userID=${userID}&itemID=${itemID}`;
    const qrCodeImageUrl = this.generateQRCodeImage(url);
    
    return {
      userID,
      itemID,
      url,
      qrCodeImageUrl
    };
  },

  /**
   * Generate QR code image URL using qrserver.com API
   * Optimized for dark backgrounds with white foreground
   */
  generateQRCodeImage(url: string, size: number = 200): string {
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&color=000000&bgcolor=ffffff&margin=10&format=png`;
  },

  /**
   * Generate QR code for stckr.io domain (production)
   */
  generateProductionQRCode(userID: string, itemID: string): QRCodeData {
    const url = `https://stckr.io/qr?userID=${userID}&itemID=${itemID}`;
    const qrCodeImageUrl = this.generateQRCodeImage(url);
    
    return {
      userID,
      itemID,
      url,
      qrCodeImageUrl
    };
  },

  /**
   * Update item with QR code information
   */
  async updateItemWithQRCode(itemId: string, qrData: QRCodeData): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ 
        qr_code_id: `${qrData.userID}-${qrData.itemID}` // Store as reference
      })
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to update item with QR code');
    }
  },

  /**
   * Get QR code data for an item
   */
  getItemQRCode(userID: string, itemID: string): QRCodeData {
    // Use production domain for consistency
    return this.generateProductionQRCode(userID, itemID);
  }
};
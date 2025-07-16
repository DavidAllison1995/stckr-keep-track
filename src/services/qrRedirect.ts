import { supabase } from '@/integrations/supabase/client';

export interface QRResolutionResponse {
  success: boolean;
  assigned: boolean;
  item?: {
    id: string;
    name: string;
    userId: string;
  };
  qrCode?: string;
  error?: string;
  redirectUrl: string;
}

export const qrRedirectService = {
  /**
   * Resolve a QR code to determine if it's assigned to an item
   * and get the appropriate redirect URL
   */
  async resolveQRCode(qrCodeId: string): Promise<QRResolutionResponse> {
    try {
      console.log('=== QR REDIRECT SERVICE DEBUG ===');
      console.log('Resolving QR code ID:', qrCodeId);

      const { data, error } = await supabase.functions.invoke('qr-resolve', {
        body: { qrCodeId },
      });

      console.log('QR resolve function response:', { data, error });

      if (error) {
        console.error('Error resolving QR code:', error);
        return {
          success: false,
          assigned: false,
          error: 'Failed to resolve QR code',
          redirectUrl: 'https://stckr.io'
        };
      }

      return data as QRResolutionResponse;
    } catch (error) {
      console.error('Error calling qr-resolve function:', error);
      return {
        success: false,
        assigned: false,
        error: 'Network error',
        redirectUrl: 'https://stckr.io'
      };
    }
  },

  /**
   * Generate the appropriate QR code URL based on the format
   */
  generateQRCodeUrl(qrCodeId: string): string {
    return `https://stckr.io/qr/${qrCodeId}`;
  },

  /**
   * Generate deep link URL for items
   */
  generateItemUrl(itemId: string): string {
    return `https://stckr.io/item/${itemId}`;
  }
};
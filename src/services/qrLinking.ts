import { supabase } from '@/integrations/supabase/client';

export interface QRLinkStatus {
  isLinked: boolean;
  itemId?: string;
  itemName?: string;
  qrCodeId?: string;
  imageUrl?: string;
}

export interface QRLink {
  id: string;
  user_id: string;
  qr_code_id: string;
  item_id: string;
  assigned_at: string;
  qr_code?: {
    id: string;
    code: string;
    image_url: string;
  };
  item?: {
    id: string;
    name: string;
  };
}

export const qrLinkingService = {
  /**
   * Check if a QR code is linked to an item for the current user
   */
  async getUserQRLink(qrCode: string, userId: string): Promise<QRLinkStatus> {
    try {
      // First find the QR code by its code
      const { data: qrCodeData, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, code, image_url')
        .eq('code', qrCode)
        .single();

      if (qrError) {
        console.error('Error finding QR code:', qrError);
        return { isLinked: false };
      }

      if (!qrCodeData) {
        return { isLinked: false };
      }

      // Check if this QR code is linked to any item for this user
      const { data: linkData, error: linkError } = await supabase
        .from('user_qr_links')
        .select(`
          id,
          item_id,
          item:items(id, name)
        `)
        .eq('qr_code_id', qrCodeData.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (linkError) {
        console.error('Error checking QR link:', linkError);
        return { isLinked: false };
      }

      if (linkData && linkData.item) {
        return {
          isLinked: true,
          itemId: linkData.item.id,
          itemName: linkData.item.name,
          qrCodeId: qrCodeData.id,
          imageUrl: qrCodeData.image_url
        };
      }

      return { 
        isLinked: false, 
        qrCodeId: qrCodeData.id,
        imageUrl: qrCodeData.image_url 
      };
    } catch (error) {
      console.error('Error in getUserQRLink:', error);
      return { isLinked: false };
    }
  },

  /**
   * Check if an item has a QR code linked to it for the current user
   */
  async getItemQRLink(itemId: string, userId: string): Promise<QRLinkStatus> {
    try {
      const { data: linkData, error } = await supabase
        .from('user_qr_links')
        .select(`
          id,
          qr_code_id,
          qr_code:qr_codes(id, code, image_url)
        `)
        .eq('item_id', itemId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking item QR link:', error);
        return { isLinked: false };
      }

      if (linkData && linkData.qr_code) {
        return {
          isLinked: true,
          qrCodeId: linkData.qr_code.id,
          imageUrl: linkData.qr_code.image_url
        };
      }

      return { isLinked: false };
    } catch (error) {
      console.error('Error in getItemQRLink:', error);
      return { isLinked: false };
    }
  },

  /**
   * Link a QR code to an item for the current user
   */
  async linkQRToItem(qrCode: string, itemId: string, userId: string): Promise<void> {
    try {
      console.log('=== QR LINKING DEBUG ===');
      console.log('QR Code:', qrCode);
      console.log('Item ID:', itemId);
      console.log('User ID:', userId);

      // Use the new edge function for better server-side debugging
      const { data, error } = await supabase.functions.invoke('qr-claim', {
        body: { codeId: qrCode, itemId },
      });

      console.log('QR assign function response:', { data, error });

      if (error) {
        console.error('Error from qr-assign function:', error);
        throw new Error(error.message || 'QR assignment failed');
      }

      if (!data?.success) {
        console.error('QR assignment failed:', data?.error);
        throw new Error(data?.error || 'QR assignment failed');
      }

      console.log('QR linking completed successfully');
    } catch (error) {
      console.error('Error in linkQRToItem:', error);
      throw error;
    }
  },

  /**
   * Remove QR link from an item for the current user
   */
  async unlinkQRFromItem(itemId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_qr_links')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', userId);

      if (error) {
        throw new Error('Failed to unlink QR code');
      }
    } catch (error) {
      console.error('Error in unlinkQRFromItem:', error);
      throw error;
    }
  },

  /**
   * Get all QR links for the current user
   */
  async getUserQRLinks(userId: string): Promise<QRLink[]> {
    try {
      const { data, error } = await supabase
        .from('user_qr_links')
        .select(`
          id,
          user_id,
          qr_code_id,
          item_id,
          assigned_at,
          qr_code:qr_codes(id, code, image_url),
          item:items(id, name)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error getting user QR links:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserQRLinks:', error);
      return [];
    }
  }
};
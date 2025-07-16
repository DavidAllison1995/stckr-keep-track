
import { supabase } from '@/integrations/supabase/client';
import { qrLinkingService } from './qrLinking';

export interface QrCodeStatus {
  isAssigned: boolean;
  itemId?: string;
  itemName?: string;
}

export const qrService = {
  async getStatus(code: string): Promise<QrCodeStatus> {
    // For backward compatibility, check if any user has this QR code linked
    const { data, error } = await supabase
      .from('user_qr_links')
      .select(`
        id,
        item_id,
        item:items(id, name)
      `)
      .eq('qr_code_id', (
        await supabase
          .from('qr_codes')
          .select('id')
          .eq('code', code)
          .single()
      ).data?.id)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Failed to check QR code status');
    }

    if (data && data.item) {
      return {
        isAssigned: true,
        itemId: data.item.id,
        itemName: data.item.name,
      };
    }

    return { isAssigned: false };
  },

  // Legacy methods - now use qrLinkingService instead
  async assignToItem(code: string, itemId: string): Promise<void> {
    throw new Error('Legacy method - use qrLinkingService.linkQRToItem instead');
  },

  async unassignFromItem(itemId: string): Promise<void> {
    throw new Error('Legacy method - use qrLinkingService.unlinkQRFromItem instead');
  },
};

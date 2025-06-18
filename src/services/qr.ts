
import { supabase } from '@/integrations/supabase/client';

export interface QrCodeStatus {
  isAssigned: boolean;
  itemId?: string;
  itemName?: string;
}

export const qrService = {
  async getStatus(code: string): Promise<QrCodeStatus> {
    const { data, error } = await supabase
      .from('items')
      .select('id, name')
      .eq('qr_code_id', code)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error('Failed to check QR code status');
    }

    if (data) {
      return {
        isAssigned: true,
        itemId: data.id,
        itemName: data.name,
      };
    }

    return { isAssigned: false };
  },

  async assignToItem(code: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ qr_code_id: code })
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to assign QR code to item');
    }
  },

  async unassignFromItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ qr_code_id: null })
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to unassign QR code');
    }
  },
};

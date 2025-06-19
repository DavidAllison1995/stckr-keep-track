
import { supabase } from '@/integrations/supabase/client';

export interface QrCodeStatus {
  codeId: string;
  exists: boolean;
}

export interface QrClaim {
  user_id: string;
  code_id: string;
  item_id: string;
  claimed_at: string;
  items?: {
    id: string;
    name: string;
  };
}

export const globalQrService = {
  async checkStatus(codeId: string): Promise<QrCodeStatus> {
    const { data, error } = await supabase.functions.invoke('qr-status', {
      method: 'GET',
    });

    if (error) {
      throw new Error('Failed to check QR code status');
    }

    return data;
  },

  async getUserClaims(codeId: string): Promise<QrClaim[]> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('qr-claim', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (error) {
      throw new Error('Failed to get user claims');
    }

    return data.claims || [];
  },

  async claimCode(codeId: string, itemId: string): Promise<QrClaim> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('qr-claim', {
      method: 'POST',
      body: { itemId },
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (error) {
      throw new Error('Failed to claim QR code');
    }

    return data.claim;
  },
};


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
      method: 'POST',
      body: { codeId, action: 'get' },
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (error) {
      throw new Error('Failed to get user claims');
    }

    // Support both array and single claim responses
    if (Array.isArray((data as any)?.claims)) {
      return (data as any).claims as QrClaim[];
    }

    const single = (data as any)?.claim;
    return single ? [single as QrClaim] : [];
  },

  async claimCode(codeId: string, itemId: string): Promise<any> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('qr-claim', {
      method: 'POST',
      body: { codeId, itemId },
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (error) {
      throw new Error('Failed to claim QR code');
    }

    return data;
  },
};

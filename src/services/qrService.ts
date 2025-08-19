import { supabase } from '@/integrations/supabase/client';

export interface QRAssignmentResponse {
  success: boolean;
  assigned: boolean;
  authenticated: boolean;
  item?: {
    id: string;
    name: string;
    user_id: string;
  };
  qr_key?: string;
  error?: string;
}

export interface QRClaimResponse {
  success: boolean;
  qr_key: string;
  item_id: string;
  assigned_at: string;
}

export const qrService = {
  /**
   * Normalize QR input to extract just the key
   */
  normalizeQRKey(input: string): string {
    // Handle various input formats
    const trimmed = input.trim();
    
    // If it's a URL, extract the last segment
    if (trimmed.includes('stckr.io/qr/') || trimmed.includes('://qr/')) {
      const segments = trimmed.split('/');
      return segments[segments.length - 1].split('?')[0]; // Remove query params
    }
    
    // If it starts with stckr://, extract after the last /
    if (trimmed.startsWith('stckr://')) {
      const segments = trimmed.split('/');
      return segments[segments.length - 1].split('?')[0];
    }
    
    // Otherwise assume it's already a clean key
    return trimmed.toUpperCase();
  },

  /**
   * Check if a QR code is assigned for the current user
   */
  async checkQRAssignment(qrKey: string): Promise<QRAssignmentResponse> {
    try {
      const normalizedKey = this.normalizeQRKey(qrKey);
      
      console.log('Checking QR assignment for key:', normalizedKey);
      
      const { data, error } = await supabase.rpc('check_qr_assignment', {
        p_qr_key: normalizedKey
      });

      if (error) {
        console.error('Error checking QR assignment:', error);
        return {
          success: false,
          assigned: false,
          authenticated: false,
          error: error.message
        };
      }

      return data as unknown as QRAssignmentResponse;
    } catch (error) {
      console.error('Error calling check_qr_assignment:', error);
      return {
        success: false,
        assigned: false,
        authenticated: false,
        error: 'Network error'
      };
    }
  },

  /**
   * Assign a QR code to an item
   */
  async claimQRForItem(qrKey: string, itemId: string): Promise<QRClaimResponse> {
    try {
      const normalizedKey = this.normalizeQRKey(qrKey);
      
      console.log('Claiming QR key for item:', { qrKey: normalizedKey, itemId });
      
      const { data, error } = await supabase.rpc('claim_qr_for_item', {
        p_qr_key: normalizedKey,
        p_item_id: itemId
      });

      if (error) {
        console.error('Error claiming QR for item:', error);
        throw new Error(error.message);
      }

      return data as unknown as QRClaimResponse;
    } catch (error) {
      console.error('Error calling claim_qr_for_item:', error);
      throw error;
    }
  },

  /**
   * Unassign a QR code from an item
   */
  async unassignQR(qrKey: string): Promise<{ success: boolean; deleted: boolean }> {
    try {
      const normalizedKey = this.normalizeQRKey(qrKey);
      
      console.log('Unassigning QR key:', normalizedKey);
      
      const { data, error } = await supabase.rpc('unassign_qr', {
        p_qr_key: normalizedKey
      });

      if (error) {
        console.error('Error unassigning QR:', error);
        throw new Error(error.message);
      }

      return data as unknown as { success: boolean; deleted: boolean };
    } catch (error) {
      console.error('Error calling unassign_qr:', error);
      throw error;
    }
  },

  /**
   * Log a QR scan for analytics
   */
  async logQRScan(qrKey: string, platform: string = 'web', source: string = 'camera'): Promise<void> {
    try {
      const normalizedKey = this.normalizeQRKey(qrKey);
      
      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('qr_scans').insert({
        qr_key: normalizedKey,
        user_id: user?.id || null,
        platform,
        source
      });
    } catch (error) {
      console.error('Error logging QR scan:', error);
      // Don't throw - logging is non-critical
    }
  },

  /**
   * Get QR assignments for current user
   */
  async getUserQRAssignments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('item_qr_links')
        .select(`
          *,
          items (
            id,
            name,
            category,
            photo_url
          )
        `)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching user QR assignments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error calling getUserQRAssignments:', error);
      return [];
    }
  },

  /**
   * Generate deep link URL for QR code
   */
  generateQRUrl(qrKey: string): string {
    const normalizedKey = this.normalizeQRKey(qrKey);
    return `https://stckr.io/qr/${normalizedKey}`;
  },

  /**
   * Generate app deep link URL
   */
  generateAppUrl(qrKey: string): string {
    const normalizedKey = this.normalizeQRKey(qrKey);
    return `stckr://qr/${normalizedKey}`;
  }
};

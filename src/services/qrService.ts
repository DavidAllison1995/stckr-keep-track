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
   * Normalize QR input to a canonical UPPER alphanumeric key
   */
  normalizeQRKey(input: string): string {
    let s = (input || '').trim();

    // If it's a URL, try to extract last path seg or ?code= param
    try {
      const u = new URL(s);
      const qp = u.searchParams.get('code') || u.searchParams.get('qr') || u.searchParams.get('codeId') || u.searchParams.get('qrCodeId');
      if (qp) s = qp;
      else {
        const segs = u.pathname.split('/').filter(Boolean);
        if (segs.length) s = segs[segs.length - 1];
      }
    } catch {
      // not a URL
    }

    // Strip query/hash if any slipped through
    if (s.includes('?')) s = s.split('?')[0];
    if (s.includes('#')) s = s.split('#')[0];

    // Only alphanumeric; final canonical UPPER
    s = s.replace(/[^A-Za-z0-9]/g, '');
    return s.toUpperCase();
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
   * Atomically create a new item and assign QR code to it
   */
  async createItemAndClaimQR(qrKey: string, itemData: {
    name: string;
    category?: string;
    notes?: string;
    photo_url?: string;
    room?: string;
    description?: string;
    icon_id?: string;
  }): Promise<string> {
    try {
      const normalizedKey = this.normalizeQRKey(qrKey);
      
      console.log('Creating item and claiming QR:', { qrKey: normalizedKey, itemData });
      
      const { data: itemId, error } = await supabase.rpc('create_item_and_claim_qr', {
        p_qr_key: normalizedKey,
        p_name: itemData.name,
        p_category: itemData.category || null,
        p_notes: itemData.notes || null,
        p_photo_url: itemData.photo_url || null,
        p_room: itemData.room || null,
        p_description: itemData.description || null,
        p_icon_id: itemData.icon_id || null,
      });

      if (error) {
        console.error('Error creating item and claiming QR:', error);
        throw new Error(error.message);
      }

      console.log('Successfully created item and claimed QR:', itemId);
      return itemId as string;
    } catch (error) {
      console.error('Error calling create_item_and_claim_qr:', error);
      throw error;
    }
  },

  /**
   * Assign a QR code to an existing item
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

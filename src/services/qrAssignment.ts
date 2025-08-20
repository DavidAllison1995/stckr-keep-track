import { supabase } from '@/integrations/supabase/client';

export interface QRCheckResult {
  success: boolean;
  assigned: boolean;
  qrCode: string;
  item?: {
    id: string;
    name: string;
    category: string;
    description?: string;
    photo_url?: string;
    room?: string;
    purchase_date?: string;
    warranty_date?: string;
    notes?: string;
  };
  error?: string;
}

export interface QRAssignResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface QRUnassignResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Modern QR Code Assignment Service
 * 
 * This service provides a clean, robust API for:
 * - Checking QR code assignment status
 * - Assigning QR codes to items
 * - Unassigning QR codes from items
 * - Handling race conditions and validation
 */
export const qrAssignmentService = {
  /**
   * Check if a QR code is assigned to an item for the current user
   */
  async checkQRCode(qrCode: string, userId: string): Promise<QRCheckResult> {
    try {
      console.log('=== QR CHECK ===');
      console.log('Checking QR code:', qrCode, 'for user:', userId);

      const { data, error } = await supabase.rpc('check_qr_assignment_v2', {
        p_qr_key: qrCode
      });

      console.log('QR check result:', { data, error });

      if (error) {
        console.error('Error from qr-check function:', error);
        throw new Error(error.message || 'QR check failed');
      }

      return data as unknown as QRCheckResult;
    } catch (error) {
      console.error('Error in checkQRCode:', error);
      return {
        success: false,
        assigned: false,
        qrCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Assign a QR code to an item for the current user
   */
  async assignQRCode(qrCode: string, itemId: string, userId: string): Promise<QRAssignResult> {
    try {
      console.log('=== QR ASSIGN ===');
      console.log('Assigning QR code:', qrCode, 'to item:', itemId, 'for user:', userId);

      const { data, error } = await supabase.rpc('claim_qr_for_item_v2', {
        p_qr_key: qrCode,
        p_item_id: itemId
      });

      console.log('QR assign result:', { data, error });

      if (error) {
        console.error('Error from qr-assign function:', error);
        throw new Error(error.message || 'QR assignment failed');
      }

      if (!(data as any)?.success) {
        console.error('QR assignment failed:', (data as any)?.error);
        throw new Error((data as any)?.error || 'QR assignment failed');
      }

      return data as unknown as QRAssignResult;
    } catch (error) {
      console.error('Error in assignQRCode:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Unassign a QR code from an item for the current user
   */
  async unassignQRCode(qrCode: string, userId: string): Promise<QRUnassignResult> {
    try {
      console.log('=== QR UNASSIGN ===');
      console.log('Unassigning QR code:', qrCode, 'for user:', userId);

      const { data, error } = await supabase.rpc('unassign_qr_v2', {
        p_qr_key: qrCode
      });

      console.log('QR unassign result:', { data, error });

      if (error) {
        console.error('Error from qr-unassign function:', error);
        throw new Error(error.message || 'QR unassignment failed');
      }

      return data as unknown as QRUnassignResult;
    } catch (error) {
      console.error('Error in unassignQRCode:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get all QR codes assigned to a user
   */
  async getUserQRAssignments(userId: string): Promise<Array<{
    qrCode: string;
    qrCodeId: string;
    itemId: string;
    itemName: string;
    assignedAt: string;
    imageUrl?: string;
  }>> {
    try {
      console.log('=== GET USER QR ASSIGNMENTS ===');
      console.log('Fetching QR assignments for user:', userId);

      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          qr_key_canonical,
          claimed_item_id,
          claimed_at,
          image_url,
          items!inner(id, name)
        `)
        .eq('claimed_by_user_id', userId)
        .not('claimed_item_id', 'is', null);

      console.log('User QR assignments result:', { data, error });

      if (error) {
        console.error('Error from getUserQRAssignments:', error);
        throw new Error(error.message || 'Failed to fetch QR assignments');
      }

      return (data || []).map((assignment: any) => ({
        qrCode: assignment.qr_key_canonical,
        qrCodeId: assignment.qr_key_canonical,
        itemId: assignment.claimed_item_id,
        itemName: assignment.items.name,
        assignedAt: assignment.claimed_at,
        imageUrl: assignment.image_url,
      }));
    } catch (error) {
      console.error('getUserQRAssignments failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch QR assignments');
    }
  },

  /**
   * Get the QR code assignment for a specific item
   */
  async getItemQRAssignment(itemId: string, userId: string): Promise<{
    qrCode: string;
    qrCodeId: string;
    imageUrl?: string;
    assignedAt: string;
  } | null> {
    try {
      console.log('=== GET ITEM QR ASSIGNMENT ===');
      console.log('Fetching QR assignment for item:', itemId, 'user:', userId);

      const { data, error } = await supabase
        .from('qr_codes')
        .select('qr_key_canonical, claimed_at, image_url')
        .eq('claimed_item_id', itemId)
        .eq('claimed_by_user_id', userId)
        .maybeSingle();

      console.log('Item QR assignment result:', { data, error });

      if (error) {
        console.error('Error from getItemQRAssignment:', error);
        throw new Error(error.message || 'Failed to fetch item QR assignment');
      }

      if (!data) {
        return null;
      }

      return {
        qrCode: data.qr_key_canonical,
        qrCodeId: data.qr_key_canonical,
        assignedAt: data.claimed_at,
        imageUrl: data.image_url,
      };
    } catch (error) {
      console.error('getItemQRAssignment failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch item QR assignment');
    }
  },
};
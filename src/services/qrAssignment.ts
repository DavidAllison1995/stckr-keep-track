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

      const { data, error } = await supabase.functions.invoke('qr-check', {
        body: { qrCode, userId }
      });

      console.log('QR check result:', { data, error });

      if (error) {
        console.error('Error from qr-check function:', error);
        throw new Error(error.message || 'QR check failed');
      }

      return data;
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

      const { data, error } = await supabase.functions.invoke('qr-claim-v2', {
        body: { codeId: qrCode, itemId }
      });

      console.log('QR assign result:', { data, error });

      if (error) {
        console.error('Error from qr-assign function:', error);
        throw new Error(error.message || 'QR assignment failed');
      }

      if (!data?.success) {
        console.error('QR assignment failed:', data?.error);
        throw new Error(data?.error || 'QR assignment failed');
      }

      return data;
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

      // First find the QR code
      const { data: qrCodeData, error: qrError } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', qrCode)
        .single();

      if (qrError || !qrCodeData) {
        throw new Error('QR code not found');
      }

      // Remove the user's link to this QR code
      const { error: deleteError } = await supabase
        .from('user_qr_links')
        .delete()
        .eq('qr_code_id', qrCodeData.id)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting QR link:', deleteError);
        throw new Error('Failed to unassign QR code');
      }

      console.log('QR code unassigned successfully');
      return {
        success: true,
        message: 'QR code unassigned successfully'
      };
    } catch (error) {
      console.error('Error in unassignQRCode:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get all QR codes assigned to the current user
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
      const { data, error } = await supabase
        .from('user_qr_links')
        .select(`
          id,
          qr_code_id,
          item_id,
          assigned_at,
          qr_code:qr_codes(id, code, image_url),
          item:items(id, name)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error getting user QR assignments:', error);
        return [];
      }

      return (data || []).map(link => ({
        qrCode: link.qr_code.code,
        qrCodeId: link.qr_code.id,
        itemId: link.item.id,
        itemName: link.item.name,
        assignedAt: link.assigned_at,
        imageUrl: link.qr_code.image_url
      }));
    } catch (error) {
      console.error('Error in getUserQRAssignments:', error);
      return [];
    }
  },

  /**
   * Get QR code assignment for a specific item
   */
  async getItemQRAssignment(itemId: string, userId: string): Promise<{
    qrCode: string;
    qrCodeId: string;
    imageUrl?: string;
    assignedAt: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_qr_links')
        .select(`
          id,
          qr_code_id,
          assigned_at,
          qr_code:qr_codes(id, code, image_url)
        `)
        .eq('item_id', itemId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error getting item QR assignment:', error);
        return null;
      }

      if (!data || !data.qr_code) {
        return null;
      }

      return {
        qrCode: data.qr_code.code,
        qrCodeId: data.qr_code.id,
        imageUrl: data.qr_code.image_url,
        assignedAt: data.assigned_at
      };
    } catch (error) {
      console.error('Error in getItemQRAssignment:', error);
      return null;
    }
  }
};
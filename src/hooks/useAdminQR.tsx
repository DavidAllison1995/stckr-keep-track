import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface QRCodeData {
  id: string;
  created_at: string;
  is_active: boolean;
  code?: string;
  image_url?: string;
  pack_id?: string;
  pack?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface QRCodePack {
  id: string;
  name: string;
  description?: string;
  physical_product_info?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  qr_code_count: number;
  recent_codes: number;
}

export const useAdminQR = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [codes, setCodes] = useState<QRCodeData[]>([]);
  const [packs, setPacks] = useState<QRCodePack[]>([]);
  const [latestBatch, setLatestBatch] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-list');

      if (error) throw error;
      
      setCodes(data?.codes || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load QR codes: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      setCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPacks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-packs');
      if (error) throw error;
      setPacks(data?.packs || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load packs: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const generateCodes = async (
    quantity: number,
    packName?: string,
    packDescription?: string,
    physicalProductInfo?: string
  ) => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-generate', {
        body: { 
          quantity,
          packName: packName?.trim() || undefined,
          packDescription: packDescription?.trim() || undefined,
          physicalProductInfo: physicalProductInfo?.trim() || undefined
        }
      });

      if (error) throw error;
      
      const successMessage = data.pack 
        ? `Generated ${quantity} QR codes in pack "${data.pack.name}"`
        : `Generated ${quantity} QR codes`;
      
      toast({
        title: 'Success',
        description: successMessage,
      });
      
      setLatestBatch(data.codes || []);
      await Promise.all([loadCodes(), loadPacks()]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate QR codes: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin-qr-delete', {
        body: { codeId }
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
      });
      
      await loadCodes();
      setLatestBatch(prev => prev.filter(code => code.id !== codeId));
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete QR code: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const deleteAllCodes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-delete-all');
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: data.message || 'All QR codes deleted successfully',
      });
      
      setCodes([]);
      setLatestBatch([]);
      await loadCodes();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete all QR codes: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const deletePack = async (packId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-pack-delete', {
        body: { packId }
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: data.message || 'Pack and all QR codes deleted successfully',
      });
      
      await Promise.all([loadCodes(), loadPacks()]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete pack: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const regenerateImages = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-regenerate-images');
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: data.message || 'QR code images regenerated successfully',
      });
      
      await Promise.all([loadCodes(), loadPacks()]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to regenerate images: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPackDetails = async (packId: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-pack-details', {
        body: { packId }
      });

      if (error) throw error;
      return data.qrCodes || [];
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load pack details: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadCodes();
      loadPacks();
    }
  }, [user]);

  return {
    codes,
    packs,
    latestBatch,
    isLoading,
    isGenerating,
    generateCodes,
    deleteCode,
    deleteAllCodes,
    deletePack,
    regenerateImages,
    getPackDetails,
    loadCodes,
    loadPacks
  };
};
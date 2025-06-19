
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Plus, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';

interface QRCodeData {
  id: string;
  code: string;
  created_at: string;
  user_qr_claims?: Array<{
    id: string;
    user_id: string;
    claimed_at: string;
    items?: {
      name: string;
    };
  }>;
}

const AdminQrPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(9);
  const [latestBatch, setLatestBatch] = useState<QRCodeData[]>([]);
  const [deletingCodes, setDeletingCodes] = useState<Set<string>>(new Set());

  const loadCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('qr-list', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      setCodes(data.codes || []);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QR codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodes = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('qr-generate', {
        body: { quantity },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Generated ${quantity} QR codes`,
      });
      
      setLatestBatch(data.codes || []);
      await loadCodes();
    } catch (error) {
      console.error('Error generating codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR codes',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!user) return;
    
    setDeletingCodes(prev => new Set(prev).add(codeId));
    try {
      const { error } = await supabase.functions.invoke('qr-delete', {
        body: { codeId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
      });
      
      await loadCodes();
      setLatestBatch(prev => prev.filter(code => code.id !== codeId));
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete QR code',
        variant: 'destructive',
      });
    } finally {
      setDeletingCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(codeId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadCodes();
  }, [user]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <QrCode className="w-8 h-8" />
        <h1 className="text-3xl font-bold">QR Code Management Portal</h1>
      </div>

      {/* Generate QR Codes Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate Master QR Code Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="9"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(9, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
            </div>
            <Button 
              onClick={generateCodes}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? `Generating ${quantity} Codes...` : `Generate ${quantity} Master QR Codes`}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Each QR code can be claimed by multiple users independently. Deep link: https://4823056e-21ba-4628-9925-ad01b2666856.lovableproject.com/qr/[code]
          </div>
        </CardContent>
      </Card>

      {/* Latest Batch Display */}
      {latestBatch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Generated Batch ({latestBatch.length} codes)</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay codes={latestBatch} />
          </CardContent>
        </Card>
      )}

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Master QR Codes ({codes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No QR codes generated yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Code</th>
                    <th className="text-left py-2 px-4 font-medium">Created Date</th>
                    <th className="text-left py-2 px-4 font-medium">User Claims</th>
                    <th className="text-left py-2 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{code.code}</td>
                      <td className="py-3 px-4">
                        {new Date(code.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <Badge variant="secondary">
                            {code.user_qr_claims?.length || 0} claims
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCode(code.id)}
                          disabled={deletingCodes.has(code.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingCodes.has(code.id) ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQrPage;

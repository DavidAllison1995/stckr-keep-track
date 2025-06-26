
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
import QRCodeGrid from '@/components/qr/QRCodeGrid';

interface QRCodeData {
  id: string;
  created_at: string;
  is_active: boolean;
  code?: string;
  image_url?: string;
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
    if (!user) {
      console.log('No user found, skipping load');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Loading QR codes via admin-qr-list function...');
      
      // Get current session with more detailed logging
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session check:', {
        hasSession: !!sessionData.session,
        hasToken: !!sessionData.session?.access_token,
        userEmail: sessionData.session?.user?.email,
        sessionError: sessionError?.message
      });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.access_token) {
        console.error('No valid session token available');
        throw new Error('No valid session token available');
      }
      
      console.log('Calling admin-qr-list function with token...');
      
      const { data, error } = await supabase.functions.invoke('admin-qr-list', {
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Function response:', { 
        data, 
        error,
        hasData: !!data,
        hasCodes: !!data?.codes 
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      if (data && data.codes) {
        console.log('Successfully loaded QR codes:', data.codes.length);
        setCodes(data.codes);
      } else {
        console.warn('No codes data in response:', data);
        setCodes([]);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
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

  const generateCodes = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      console.log('Generating QR codes via admin-qr-generate function...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session token available');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-qr-generate', {
        body: { quantity },
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      console.log('Successfully generated QR codes:', data);
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
        description: `Failed to generate QR codes: ${error.message || 'Unknown error'}`,
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
      console.log('Deleting QR code via admin-qr-delete function...', codeId);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session token available');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-qr-delete', {
        body: JSON.stringify({ codeId }),
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      console.log('Delete response:', data);
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
        description: `Failed to delete QR code: ${error.message || 'Unknown error'}`,
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
            Generate Global QR Code Batch
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
              {isGenerating ? `Generating ${quantity} Codes...` : `Generate ${quantity} Global QR Codes`}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Each QR code can be claimed by multiple users independently. Deep link: https://stckr.io/qr/[code]
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
            <QRCodeGrid codes={latestBatch} showDownloadPDF={true} />
          </CardContent>
        </Card>
      )}

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All QR Codes ({codes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading QR codes...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No QR codes found or failed to load. Please try refreshing the page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">QR Code</th>
                    <th className="text-left py-2 px-4 font-medium">Created Date</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-left py-2 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {code.image_url ? (
                            <img 
                              src={code.image_url} 
                              alt="QR Code" 
                              className="w-12 h-12 border rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 border rounded flex items-center justify-center">
                              <QrCode className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-mono text-sm">{code.id}</div>
                            {code.code && (
                              <div className="text-xs text-gray-500">Code: {code.code}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(code.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={code.is_active ? "default" : "secondary"}>
                          {code.is_active ? "Active" : "Inactive"}
                        </Badge>
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

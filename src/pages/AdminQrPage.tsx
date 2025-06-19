
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import QRCodeGrid from '@/components/qr/QRCodeGrid';

interface GlobalQrCode {
  id: string;
  created_at: string;
  is_active: boolean;
  image_url?: string;
}

const AdminQrPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<GlobalQrCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestBatch, setLatestBatch] = useState<GlobalQrCode[]>([]);

  const loadCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-qr-list', {
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
      const { data, error } = await supabase.functions.invoke('admin-qr-generate', {
        body: { quantity: 9 }, // Always generate 9
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Generated 9 QR codes with images',
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

  const downloadCSV = () => {
    const csvContent = [
      'Code ID,Created Date,Status,QR URL',
      ...codes.map(code => `${code.id},${new Date(code.created_at).toLocaleDateString()},${code.is_active ? 'Active' : 'Inactive'},${code.image_url || 'N/A'}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load codes on mount
  useEffect(() => {
    loadCodes();
  }, [user]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <QrCode className="w-8 h-8" />
        <h1 className="text-3xl font-bold">QR Code Admin Portal</h1>
      </div>

      {/* Generate QR Codes Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate QR Code Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="text-sm text-gray-600">
              Each batch generates 9 QR codes with images in a 3×3 grid format
            </div>
            <Button 
              onClick={generateCodes}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'Generating 9 Codes...' : 'Generate 9 QR Codes'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={downloadCSV}
              disabled={codes.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Batch Display */}
      {latestBatch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Generated Batch</CardTitle>
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
                    <th className="text-left py-2 px-4 font-medium">Code ID</th>
                    <th className="text-left py-2 px-4 font-medium">Created Date</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-left py-2 px-4 font-medium">QR Image</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{code.id}</td>
                      <td className="py-3 px-4">
                        {new Date(code.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={code.is_active ? "default" : "secondary"}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {code.image_url ? (
                          <img 
                            src={code.image_url} 
                            alt={`QR Code ${code.id}`}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
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


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface GlobalQrCode {
  id: string;
  created_at: string;
  is_active: boolean;
}

const AdminQrPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(12);
  const [codes, setCodes] = useState<GlobalQrCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      'Code ID,Created Date,Status',
      ...codes.map(code => `${code.id},${new Date(code.created_at).toLocaleDateString()},${code.is_active ? 'Active' : 'Inactive'}`)
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
  React.useEffect(() => {
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
            Generate QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="12"
              />
            </div>
            <Button 
              onClick={generateCodes}
              disabled={isGenerating || quantity < 1}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
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

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Global QR Codes ({codes.length})</CardTitle>
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

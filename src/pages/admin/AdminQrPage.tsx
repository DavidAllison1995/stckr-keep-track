import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { QrCode, Plus, Trash2, Users, AlertTriangle, Package, FolderOpen, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import QRCodeGrid from '@/components/qr/QRCodeGrid';
import AdminLayout from '@/components/admin/AdminLayout';

interface QRCodeData {
  id: string;
  created_at: string;
  is_active: boolean;
  code?: string;
  image_url?: string;
  pack_id?: string;
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

const AdminQrPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(9);
  const [latestBatch, setLatestBatch] = useState<QRCodeData[]>([]);
  const [deletingCodes, setDeletingCodes] = useState<Set<string>>(new Set());
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [packs, setPacks] = useState<QRCodePack[]>([]);
  const [selectedPack, setSelectedPack] = useState<QRCodePack | null>(null);
  const [packCodes, setPackCodes] = useState<QRCodeData[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [physicalProductInfo, setPhysicalProductInfo] = useState('');

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
    console.log('=== GENERATE CODES FUNCTION CALLED ===');
    console.log('User:', user);
    if (!user) return;
    
    setIsGenerating(true);
    try {
      console.log('Generating QR codes via admin-qr-generate function...');
      console.log('Form values before sending:', {
        packName,
        packDescription,
        physicalProductInfo,
        quantity
      });
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session token available');
      }
      
      const requestBody = { 
        quantity,
        packName: packName && packName.trim() ? packName.trim() : undefined,
        packDescription: packDescription && packDescription.trim() ? packDescription.trim() : undefined,
        physicalProductInfo: physicalProductInfo && physicalProductInfo.trim() ? physicalProductInfo.trim() : undefined
      };
      
      console.log('Request body being sent:', requestBody);
      
      // Use direct fetch instead of supabase.functions.invoke
      const functionUrl = `https://cudftlquaydissmvqjmv.supabase.co/functions/v1/admin-qr-generate`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('Successfully generated QR codes:', data);
      
      const successMessage = data.pack 
        ? `Generated ${quantity} QR codes in pack "${data.pack.name}"`
        : `Generated ${quantity} QR codes`;
      
      toast({
        title: 'Success',
        description: successMessage,
      });
      
      setLatestBatch(data.codes || []);
      
      // Clear pack form fields
      setPackName('');
      setPackDescription('');
      setPhysicalProductInfo('');
      
      await loadCodes();
      await loadPacks();
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
    
    console.log('=== Frontend Delete Request Started ===');
    console.log('Deleting code ID:', codeId);
    console.log('Code ID type:', typeof codeId);
    console.log('Code ID length:', codeId.length);
    
    setDeletingCodes(prev => new Set(prev).add(codeId));
    
    try {
      // Get session with detailed logging
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session check:', {
        hasSession: !!sessionData.session,
        hasToken: !!sessionData.session?.access_token,
        tokenLength: sessionData.session?.access_token?.length,
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
      
      // Prepare request body
      const requestBody = { codeId: codeId };
      console.log('Request body object:', requestBody);
      
      // Use direct fetch instead of supabase.functions.invoke
      const functionUrl = `https://cudftlquaydissmvqjmv.supabase.co/functions/v1/admin-qr-delete`;
      
      console.log('Making direct fetch request to:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete successful:', data);
      
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

  const deleteAllCodes = async () => {
    if (!user) return;
    
    setIsDeletingAll(true);
    
    try {
      console.log('Deleting all QR codes...');
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session?.access_token) {
        console.error('No valid session token available');
        throw new Error('No valid session token available');
      }
      
      const functionUrl = `https://cudftlquaydissmvqjmv.supabase.co/functions/v1/admin-qr-delete-all`;
      
      console.log('Making delete all request to:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ',
        },
        body: JSON.stringify({}),
      });
      
      console.log('Delete all response status:', response.status);
      console.log('Delete all response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete all response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete all successful:', data);
      
      toast({
        title: 'Success',
        description: data.message || 'All QR codes deleted successfully',
      });
      
      // Clear local state
      setCodes([]);
      setLatestBatch([]);
      
      // Reload to ensure consistency
      await loadCodes();
      
    } catch (error) {
      console.error('Error deleting all codes:', error);
      toast({
        title: 'Error',
        description: `Failed to delete all QR codes: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const loadPacks = async () => {
    if (!user) return;
    
    setIsLoadingPacks(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session token available');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-qr-packs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw error;
      }
      
      setPacks(data.packs || []);
    } catch (error) {
      console.error('Error loading packs:', error);
      toast({
        title: 'Error',
        description: `Failed to load packs: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPacks(false);
    }
  };

  const viewPackDetails = async (pack: QRCodePack) => {
    if (!user) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session token available');
      }
      
      const functionUrl = `https://cudftlquaydissmvqjmv.supabase.co/functions/v1/admin-qr-pack-details/${pack.id}`;
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setSelectedPack(pack);
      setPackCodes(data.qrCodes || []);
      
    } catch (error) {
      console.error('Error loading pack details:', error);
      toast({
        title: 'Error',
        description: `Failed to load pack details: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadCodes();
    loadPacks();
  }, [user]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8" />
          <h1 className="text-3xl font-bold">QR Code Management Portal</h1>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate QR Codes</TabsTrigger>
            <TabsTrigger value="packs">Manage Packs</TabsTrigger>
            <TabsTrigger value="all-codes">All QR Codes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            {/* Generate QR Codes Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Generate QR Code Batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                <div className="space-y-2">
                  <Label htmlFor="packName">Pack Name (Required to create pack)</Label>
                  <Input
                    id="packName"
                    placeholder="e.g., Sticker Pack 001"
                    value={packName}
                    onChange={(e) => {
                      console.log('Pack name changed:', e.target.value);
                      setPackName(e.target.value);
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to create loose QR codes without a pack
                  </p>
                </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packDescription">Pack Description (Optional)</Label>
                  <Textarea
                    id="packDescription"
                    placeholder="e.g., Vinyl stickers for box labels"
                    value={packDescription}
                    onChange={(e) => {
                      console.log('Pack description changed:', e.target.value);
                      setPackDescription(e.target.value);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="physicalProductInfo">Physical Product Info (Optional)</Label>
                  <Textarea
                    id="physicalProductInfo"
                    placeholder="e.g., Material: Vinyl, Size: 2x2 inches, Color: White on black"
                    value={physicalProductInfo}
                    onChange={(e) => {
                      console.log('Physical product info changed:', e.target.value);
                      setPhysicalProductInfo(e.target.value);
                    }}
                  />
                </div>
                
                <Button 
                  onClick={generateCodes}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? `Generating ${quantity} Codes...` : `Generate ${quantity} QR Codes`}
                </Button>
                
                <p className="text-sm text-gray-600">
                  Each QR code can be claimed by multiple users independently. Deep link: https://stckr.io/qr/[code]
                </p>
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
          </TabsContent>
          
          <TabsContent value="packs" className="space-y-6">
            {/* QR Code Packs Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  QR Code Packs ({packs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPacks ? (
                  <div className="text-center py-8">Loading packs...</div>
                ) : packs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No packs created yet. Generate QR codes with a pack name to create your first pack.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packs.map((pack) => (
                      <Card key={pack.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{pack.name}</h3>
                              {pack.description && (
                                <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                              )}
                              {pack.physical_product_info && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <strong>Product:</strong> {pack.physical_product_info}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{pack.qr_code_count} QR codes</span>
                                <span>Created: {new Date(pack.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPackDetails(pack)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Codes
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pack Details Modal */}
            {selectedPack && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Pack: {selectedPack.name}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPack(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPack.description && (
                      <div>
                        <h4 className="font-medium">Description:</h4>
                        <p className="text-sm text-gray-600">{selectedPack.description}</p>
                      </div>
                    )}
                    {selectedPack.physical_product_info && (
                      <div>
                        <h4 className="font-medium">Physical Product Info:</h4>
                        <p className="text-sm text-gray-600">{selectedPack.physical_product_info}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">QR Codes ({packCodes.length}):</h4>
                      <QRCodeGrid codes={packCodes} showDownloadPDF={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all-codes" className="space-y-6">{/* QR Codes Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All QR Codes ({codes.length})</CardTitle>
                  {codes.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeletingAll}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeletingAll ? 'Deleting All...' : 'Delete All QR Codes'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Delete All QR Codes
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete all {codes.length} QR codes? This action cannot be undone.
                            <br /><br />
                            This will also delete:
                            <ul className="mt-2 list-disc list-inside text-sm">
                              <li>All user claims associated with these codes</li>
                              <li>All scan history records</li>
                              <li>All generated QR code images</li>
                            </ul>
                            <br />
                            <strong>This action is permanent and cannot be reversed.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={deleteAllCodes}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeletingAll}
                          >
                            {isDeletingAll ? 'Deleting...' : 'Delete All QR Codes'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
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
                          <th className="text-left py-2 px-4 font-medium">Pack</th>
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
                              {code.pack_id ? (
                                <Badge variant="secondary" className="text-xs">
                                  {packs.find(p => p.id === code.pack_id)?.name || 'Unknown Pack'}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-xs">No pack</span>
                              )}
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminQrPage;
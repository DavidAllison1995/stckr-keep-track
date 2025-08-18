import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Package, Eye, Trash2, AlertTriangle, FolderOpen } from 'lucide-react';
import { useAdminQR } from '@/hooks/useAdminQR';
import QRCodeGrid from '@/components/qr/QRCodeGrid';

const QRPackManager = () => {
  const { packs, deletePack, getPackDetails } = useAdminQR();
  const [deletingPacks, setDeletingPacks] = useState<Set<string>>(new Set());
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [packCodes, setPackCodes] = useState<any[]>([]);

  const handleDeletePack = async (packId: string) => {
    setDeletingPacks(prev => new Set(prev).add(packId));
    await deletePack(packId);
    
    // Clear selected pack if it was the one deleted
    if (selectedPack?.id === packId) {
      setSelectedPack(null);
      setPackCodes([]);
    }
    
    setDeletingPacks(prev => {
      const newSet = new Set(prev);
      newSet.delete(packId);
      return newSet;
    });
  };

  const handleViewPackDetails = async (pack: any) => {
    const codes = await getPackDetails(pack.id);
    if (codes) {
      setSelectedPack(pack);
      setPackCodes(codes);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            QR Code Packs ({packs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No packs created yet. Generate QR codes with a pack name to create your first pack.
            </div>
          ) : (
            <div className="space-y-4">
              {packs.map((pack) => (
                <Card key={pack.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pack.name}</h3>
                        {pack.description && (
                          <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
                        )}
                        {pack.physical_product_info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Product:</strong> {pack.physical_product_info}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{pack.qr_code_count} QR codes</span>
                          <span>Created: {new Date(pack.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPackDetails(pack)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Codes
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingPacks.has(pack.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {deletingPacks.has(pack.id) ? 'Deleting...' : 'Delete Pack'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Delete Pack: {pack.name}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this pack and all {pack.qr_code_count} QR codes in it? This action cannot be undone.
                                <br /><br />
                                This will permanently delete:
                                <ul className="mt-2 list-disc list-inside text-sm">
                                  <li>The pack "{pack.name}"</li>
                                  <li>All {pack.qr_code_count} QR codes in this pack</li>
                                  <li>All user claims for these codes</li>
                                  <li>All scan history for these codes</li>
                                </ul>
                                <br />
                                <strong>This action is permanent and cannot be reversed.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePack(pack.id)}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deletingPacks.has(pack.id)}
                              >
                                {deletingPacks.has(pack.id) ? 'Deleting...' : 'Delete Pack'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                  <p className="text-sm text-muted-foreground">{selectedPack.description}</p>
                </div>
              )}
              {selectedPack.physical_product_info && (
                <div>
                  <h4 className="font-medium">Physical Product Info:</h4>
                  <p className="text-sm text-muted-foreground">{selectedPack.physical_product_info}</p>
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
    </div>
  );
};

export default QRPackManager;
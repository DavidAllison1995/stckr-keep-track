import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, RotateCcw } from 'lucide-react';
import { useAdminQR } from '@/hooks/useAdminQR';
import QRCodeGrid from '@/components/qr/QRCodeGrid';

const QRCodeGenerator = () => {
  const { generateCodes, regenerateImages, latestBatch, isGenerating } = useAdminQR();
  
  const [quantity, setQuantity] = useState(9);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [physicalProductInfo, setPhysicalProductInfo] = useState('');

  const handleGenerate = async () => {
    await generateCodes(quantity, packName, packDescription, physicalProductInfo);
    
    // Clear form after successful generation
    setPackName('');
    setPackDescription('');
    setPhysicalProductInfo('');
  };

  return (
    <div className="space-y-6">
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
              <Label htmlFor="packName">Pack Name (Optional)</Label>
              <Input
                id="packName"
                placeholder="e.g., Sticker Pack 001"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
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
              onChange={(e) => setPackDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="physicalProductInfo">Physical Product Info (Optional)</Label>
            <Textarea
              id="physicalProductInfo"
              placeholder="e.g., Material: Vinyl, Size: 2x2 inches, Color: White on black"
              value={physicalProductInfo}
              onChange={(e) => setPhysicalProductInfo(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? `Generating ${quantity} Codes...` : `Generate ${quantity} QR Codes`}
            </Button>
            <Button 
              onClick={regenerateImages}
              disabled={isGenerating}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Fix Missing Images
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            <p className="font-medium mb-1">Deep Link Format:</p>
            <p><code>https://stckr.io/qr/[code]</code></p>
            <p className="mt-2 text-xs">
              QR codes automatically open the app on mobile devices and redirect to item cards when assigned.
            </p>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default QRCodeGenerator;
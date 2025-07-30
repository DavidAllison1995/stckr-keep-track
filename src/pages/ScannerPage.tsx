import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, ShoppingCart, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRScannerOverlay from '@/components/qr/QRScannerOverlay';
import { downloadPrintableStickers } from '@/utils/printableStickers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasPrintableFile, setHasPrintableFile] = useState(true);

  useEffect(() => {
    checkPrintableFileAvailability();
  }, []);

  const checkPrintableFileAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('printable_files')
        .select('id')
        .limit(1)
        .maybeSingle();

      setHasPrintableFile(!!data);
    } catch (error) {
      console.error('Error checking printable file availability:', error);
      setHasPrintableFile(false);
    }
  };

  const handleScan = (result: string) => {
    console.log('QR Code scanned:', result);
    setScannedCode(result);
    setShowScanner(false);
  };

  const handleStartScan = () => {
    setShowScanner(true);
    setScannedCode(null);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScannedCode(null);
  };

  const handlePrintAtHome = async () => {
    if (!hasPrintableFile) {
      toast({
        title: "File Unavailable",
        description: "Print file currently unavailable. Please check back soon.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await downloadPrintableStickers();
      toast({
        title: "Download Started",
        description: "Your printable sticker sheet is downloading now!",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unable to download PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] p-6 mobile-compact-p pb-20 space-y-6 mobile-tight-space">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="p-2 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">QR Scanner</h1>
        </div>
      </div>

      {/* Start Scanner Button - Main Feature */}
      <div className="text-center mb-8">
        <Button 
          onClick={handleStartScan} 
          size="lg" 
          className="bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold px-12 py-6 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105 text-lg"
        >
          <QrCode className="w-8 h-8 mr-4" />
          Start Scanner
        </Button>
      </div>

      {/* Secondary Action Buttons - Icon Only, Side by Side */}
      <div className="flex justify-center gap-4">
        {hasPrintableFile ? (
          <div className="text-center">
            <Button 
              onClick={handlePrintAtHome}
              disabled={isGeneratingPDF}
              variant="outline"
              size="icon"
              className="w-12 h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
            >
              <Printer className="w-5 h-5" />
            </Button>
            <p className="text-xs text-gray-500 mt-1">Print at Home</p>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              disabled
              variant="outline"
              size="icon"
              className="w-12 h-12 border-gray-700 text-gray-500 cursor-not-allowed rounded-lg"
            >
              <Printer className="w-5 h-5" />
            </Button>
            <p className="text-xs text-red-400 mt-1">Unavailable</p>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            onClick={() => navigate('/shop')} 
            variant="outline"
            size="icon"
            className="w-12 h-12 border-purple-600 text-purple-400 hover:bg-purple-800 hover:text-white rounded-lg transition-colors duration-200"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
          <p className="text-xs text-gray-500 mt-1">Buy Stickers</p>
        </div>
      </div>

      {/* Compact How to Use Section */}
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-4 bg-[#9333ea] rounded-full"></div>
            How to use
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                1
              </div>
              <span className="text-zinc-300">Tap "Start Scanner"</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                2
              </div>
              <span className="text-zinc-300">Point at QR code</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                3
              </div>
              <span className="text-zinc-300">Auto-detect & process</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                4
              </div>
              <span className="text-zinc-300">Assign to item</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Overlay */}
      <QRScannerOverlay 
        isOpen={showScanner} 
        onClose={handleCloseScanner} 
        scannedCode={scannedCode} 
      />
    </div>
  );
};

export default ScannerPage;

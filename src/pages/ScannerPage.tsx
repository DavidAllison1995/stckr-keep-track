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
    <div className="min-h-screen bg-[#0b0b12] p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-0">
        <div className="flex items-center gap-4">
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
        
        {/* Desktop Action Buttons Container */}
        <div className="hidden md:flex gap-3">
          {hasPrintableFile ? (
            <div className="text-center">
              <Button 
                onClick={handlePrintAtHome}
                disabled={isGeneratingPDF}
                className="bg-gray-700 text-white font-semibold rounded-full px-6 py-2 hover:bg-gray-600 transition-colors duration-200 shadow-lg"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Downloading...' : 'Print at Home'}
              </Button>
              <p className="text-xs text-gray-400 mt-1">Download printable sticker sheet (PDF)</p>
            </div>
          ) : (
            <div className="text-center">
              <Button 
                disabled
                className="bg-gray-600 text-gray-400 font-semibold rounded-full px-6 py-2 cursor-not-allowed"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print at Home
              </Button>
              <p className="text-xs text-red-400 mt-1">Print file currently unavailable</p>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              onClick={() => navigate('/shop')} 
              className="bg-[#9333ea] text-white font-semibold rounded-full px-6 py-2 hover:bg-[#a855f7] transition-colors duration-200 shadow-lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Stickers
            </Button>
            <p className="text-xs text-gray-400 mt-1">Ready-made stickers delivered</p>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="md:hidden space-y-4 mb-6">
        {hasPrintableFile ? (
          <div className="text-center">
            <Button 
              onClick={handlePrintAtHome}
              disabled={isGeneratingPDF}
              className="w-full bg-gray-700 text-white font-semibold rounded-xl px-6 py-3 hover:bg-gray-600 transition-colors duration-200 shadow-lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              {isGeneratingPDF ? 'Downloading...' : 'Print at Home'}
            </Button>
            <p className="text-xs text-gray-400 mt-2">Download printable sticker sheet (PDF)</p>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              disabled
              className="w-full bg-gray-600 text-gray-400 font-semibold rounded-xl px-6 py-3 cursor-not-allowed"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print at Home
            </Button>
            <p className="text-xs text-red-400 mt-2">Print file currently unavailable</p>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            onClick={() => navigate('/shop')} 
            className="w-full bg-[#9333ea] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#a855f7] transition-colors duration-200 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buy Stickers
          </Button>
          <p className="text-xs text-gray-400 mt-2">Ready-made stickers delivered</p>
        </div>
      </div>


      {/* Scanner Card */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <p className="text-zinc-300 text-base leading-relaxed">
              Point your camera at a QR code to scan it. This will help you assign QR codes to your items and access maintenance records instantly.
            </p>
            
            <div className="text-center">
              <Button 
                onClick={handleStartScan} 
                size="lg" 
                className="bg-[#9333ea] hover:bg-[#a855f7] text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Start Scanner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl shadow-2xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-6 bg-[#9333ea] rounded-full"></div>
              How to use
            </h3>
            <ul className="space-y-4 pl-6">
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                  1
                </div>
                <span className="text-zinc-300 text-base">Click "Start Scanner" to open the camera</span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                  2
                </div>
                <span className="text-zinc-300 text-base">Point your camera at your STCKR QR code</span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                  3
                </div>
                <span className="text-zinc-300 text-base">The app will automatically detect and process the code</span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                  4
                </div>
                <span className="text-zinc-300 text-base">Choose to assign it to an existing item or create a new one</span>
              </li>
            </ul>
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

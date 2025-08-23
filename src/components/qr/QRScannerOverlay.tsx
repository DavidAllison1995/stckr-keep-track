
import { useState } from 'react';
import SimpleQRScanner from './SimpleQRScanner';
import QRScanHandler from './QRScanHandler';

interface QRScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string | null;
}

const QRScannerOverlay = ({ isOpen, onClose, scannedCode }: QRScannerOverlayProps) => {
  const [currentScannedCode, setCurrentScannedCode] = useState<string>('');
  const [showScanHandler, setShowScanHandler] = useState(false);

  const handleScan = (code: string) => {
    console.log('QR code scanned:', code);
    setCurrentScannedCode(code);
    setShowScanHandler(true);
  };

  const handleScanHandlerComplete = () => {
    setShowScanHandler(false);
    setCurrentScannedCode('');
    onClose();
  };

  return (
    <>
      {/* Main Scanner */}
      {isOpen && !showScanHandler && (
        <SimpleQRScanner onScan={handleScan} onClose={onClose} />
      )}

      {/* QR Scan Handler for processing scanned codes */}
      {showScanHandler && currentScannedCode && (
        <QRScanHandler
          scannedCode={currentScannedCode}
          onComplete={handleScanHandlerComplete}
        />
      )}
    </>
  );
};

export default QRScannerOverlay;

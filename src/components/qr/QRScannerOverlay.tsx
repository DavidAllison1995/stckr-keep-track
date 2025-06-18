
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQrScanner } from '@/hooks/useQrScanner';
import { qrService, QrCodeStatus } from '@/services/qr';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import QRAssignmentModal from './QRAssignmentModal';

interface QRScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onItemView: (itemId: string) => void;
}

const QRScannerOverlay = ({ isOpen, onClose, onItemView }: QRScannerOverlayProps) => {
  const { toast } = useToast();
  const { getItemById } = useSupabaseItems();
  const [scannedData, setScannedData] = useState<QrCodeStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [scanAttempts, setScanAttempts] = useState(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScan = async (code: string) => {
    console.log('QR Code scanned:', code);
    if (isProcessing) return;
    
    setIsProcessing(true);
    setCameraError('');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    try {
      const status = await qrService.getStatus(code);
      console.log('QR status:', status);
      
      setScannedData(status);
      stopScanning();
      
      if (!status.isAssigned) {
        setCurrentQrCode(code);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setCameraError('Unable to recognize this QR code');
      setTimeout(() => setCameraError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraError = (error: Error) => {
    console.error('Camera error:', error);
    
    if (error.name === 'NotAllowedError') {
      setCameraError('Camera access blocked. Please enable camera permissions and try again.');
    } else if (error.name === 'NotReadableError') {
      setCameraError('Camera is in use by another app. Please close other apps and try again.');
    } else if (error.name === 'NotFoundError') {
      setCameraError('No camera found on this device.');
    } else {
      setCameraError('Camera error occurred. Please try again.');
    }
  };

  const {
    videoRef,
    isScanning,
    hasPermission,
    retryCount,
    startScanning,
    stopScanning,
    retryPermission,
  } = useQrScanner({
    onScan: handleScan,
    onError: handleCameraError,
  });

  // Auto-start scanning when overlay opens
  useEffect(() => {
    if (isOpen && hasPermission !== false) {
      startScanning();
      
      // Set timeout for no detection
      scanTimeoutRef.current = setTimeout(() => {
        if (!scannedData && isScanning) {
          setScanAttempts(prev => prev + 1);
          setCameraError('No QR code detected. Try adjusting your position.');
        }
      }, 10000);
    }
    
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isOpen, hasPermission, startScanning, scannedData, isScanning]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setScannedData(null);
      setIsProcessing(false);
      setCameraError('');
      setScanAttempts(0);
      setCurrentQrCode('');
    }
  }, [isOpen, stopScanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleViewDetails = () => {
    if (scannedData?.itemId) {
      onItemView(scannedData.itemId);
      handleClose();
    }
  };

  const handleAssignToItem = () => {
    setShowAssignmentModal(true);
  };

  const handleAssignmentClose = () => {
    setShowAssignmentModal(false);
    handleClose();
  };

  const handleRetry = () => {
    setCameraError('');
    setScanAttempts(0);
    setScannedData(null);
    retryPermission();
  };

  const renderScannedItem = () => {
    if (!scannedData) return null;

    if (scannedData.isAssigned && scannedData.itemId) {
      const item = getItemById(scannedData.itemId);
      const IconComponent = getIconComponent(item?.icon_id || 'box');
      
      return (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item?.name || 'Unknown Item'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item?.category} {item?.room && ` • ${item.room}`}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Linked
                </Badge>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleViewDetails} className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-400 rounded"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Unlinked QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    This sticker isn't linked to any item yet
                  </p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Available
                </Badge>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleAssignToItem} className="flex-1">
                  Assign to Item
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Camera Feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ display: isScanning ? 'block' : 'none' }}
        />

        {/* Overlay Dimming */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 bg-gradient-to-b from-black/50 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          
          <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
          
          <div className="w-10 h-10"></div> {/* Spacer for balance */}
        </div>

        {/* Camera Permission/Loading States */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mx-6">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Camera Access Required</h3>
                <p className="text-muted-foreground mb-2 text-sm">
                  {cameraError || 'We need camera access to scan QR codes'}
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Make sure the page is served over HTTPS and no other apps are using the camera.
                  </p>
                )}
                <Button onClick={retryPermission} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {retryCount > 0 ? 'Try Again' : 'Allow Camera Access'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {hasPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mx-6">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Starting camera...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scan Guide Frame - Only show when actively scanning */}
        {isScanning && !scannedData && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning Frame */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-72 h-72 border-2 border-primary rounded-2xl relative bg-white/5"
              >
                {/* Corner Indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-2xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-2xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-2xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-2xl"></div>
                
                {/* Animated Laser Line */}
                <motion.div
                  className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                  animate={{
                    y: [16, 256, 16],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
              
              {/* Instructions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <p className="text-white/90 text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                  Point your camera at a QR code to scan
                </p>
              </motion.div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mx-6"
            >
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="font-medium">Processing QR code...</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error State */}
        {cameraError && isScanning && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-20 left-6 right-6"
          >
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-red-800 text-sm">{cameraError}</p>
                {scanAttempts > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scanned Item Preview */}
        <AnimatePresence>
          {scannedData && renderScannedItem()}
        </AnimatePresence>

        {/* Assignment Modal */}
        <QRAssignmentModal
          isOpen={showAssignmentModal}
          onClose={handleAssignmentClose}
          qrCode={currentQrCode}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScannerOverlay;

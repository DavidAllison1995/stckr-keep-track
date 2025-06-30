
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface QRCodeData {
  id: string;
  code: string;
  created_at: string;
}

interface QRCodeDisplayProps {
  codes: QRCodeData[];
}

const QRCodeDisplay = ({ codes }: QRCodeDisplayProps) => {
  const [qrImages, setQrImages] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    const generateQRImages = async () => {
      const images: { [key: string]: string } = {};
      
      for (const code of codes) {
        try {
          const url = `https://stckr.io/qr/${code.code}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 512,
            margin: 3,
            color: {
              dark: '#FFFFFF', // White foreground
              light: '#00000000' // Transparent background
            },
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 1.0,
            rendererOpts: {
              quality: 1.0
            }
          });
          images[code.code] = qrDataUrl;
        } catch (error) {
          console.error(`Error generating QR code for ${code.code}:`, error);
        }
      }
      
      setQrImages(images);
    };

    if (codes.length > 0) {
      generateQRImages();
    }
  }, [codes]);

  const downloadPDF = async () => {
    if (codes.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Clean layout with proper margins for printing
    const margin = 20;
    const logoHeight = 25;
    const logoSpace = 35;
    const qrSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin + logoSpace;
    
    // Add Stckr logo at top center
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/stckr-logo-full.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      
      const logoWidth = logoHeight * (logoImg.width / logoImg.height);
      pdf.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, margin, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error loading Stckr logo:', error);
    }
    
    // Load Stckr icon for QR code centers
    let iconImg: HTMLImageElement | null = null;
    try {
      iconImg = new Image();
      iconImg.crossOrigin = 'anonymous';
      iconImg.src = '/stckr-icon.png';
      
      await new Promise((resolve, reject) => {
        iconImg!.onload = resolve;
        iconImg!.onerror = reject;
      });
    } catch (error) {
      console.error('Error loading Stckr icon:', error);
    }
    
    // Generate clean 3x3 grid of QR codes with dark background for print
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      const qrImage = qrImages[code.code];
      
      if (!qrImage) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + row * (qrSize + margin);
      
      try {
        // Add dark background for the QR code (for print on dark stickers)
        pdf.setFillColor(45, 45, 45); // Dark gray background
        pdf.rect(x - 5, y - 5, qrSize + 10, qrSize + 10, 'F');
        
        // Add QR code image (white on transparent)
        pdf.addImage(qrImage, 'PNG', x, y, qrSize, qrSize);
        
        // Add Stckr icon in center of QR code with white background
        if (iconImg) {
          const iconSize = qrSize * 0.28; // 28% of QR code size
          const centerX = x + qrSize / 2;
          const centerY = y + qrSize / 2;
          
          // Add larger white square background for better contrast
          const bgSize = iconSize * 1.2; // Square background larger than icon
          pdf.setFillColor(255, 255, 255);
          pdf.rect(centerX - bgSize/2, centerY - bgSize/2, bgSize, bgSize, 'F');
          
          // Add thin border around white background
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.5);
          pdf.rect(centerX - bgSize/2, centerY - bgSize/2, bgSize, bgSize, 'S');
          
          // Add the Stckr icon
          pdf.addImage(iconImg, 'PNG', 
            centerX - iconSize/2, 
            centerY - iconSize/2, 
            iconSize, 
            iconSize
          );
        }
        
      } catch (error) {
        console.error(`Error adding QR code ${code.code} to PDF:`, error);
      }
    }
    
    pdf.save('stckr-qr-sheet.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Print Sheet
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code) => (
          <div key={code.id} className="text-center">
            <div className="border rounded-lg p-4 bg-gray-800 shadow-sm">
              {qrImages[code.code] ? (
                <div className="relative">
                  <img 
                    src={qrImages[code.code]} 
                    alt={`QR Code ${code.code}`}
                    className="w-full h-auto max-w-[180px] mx-auto"
                  />
                  {/* Larger square Stckr icon overlay for preview */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center shadow-sm border border-gray-200">
                      <img 
                        src="/stckr-icon.png" 
                        alt="Stckr" 
                        className="w-10 h-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                  Generating QR...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-lg">
        <strong>Print Ready:</strong> White QR codes with transparent backgrounds - optimized for dark stickers
      </div>
    </div>
  );
};

export default QRCodeDisplay;

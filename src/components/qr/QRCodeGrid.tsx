
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface QRCode {
  id: string;
  image_url?: string;
}

interface QRCodeGridProps {
  codes: QRCode[];
  showDownloadPDF?: boolean;
}

const QRCodeGrid = ({ codes, showDownloadPDF = false }: QRCodeGridProps) => {
  const downloadPDF = async () => {
    if (codes.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Clean layout with proper margins for printing
    const margin = 20;
    const logoHeight = 25;
    const logoSpace = 35;
    const qrSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin + logoSpace;
    
    // Add Stckr logo at top center
    try {
      // Load and add the full Stckr logo
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
    
    // Generate clean 3x3 grid of QR codes
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      if (!code.image_url) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + row * (qrSize + margin);
      
      try {
        // Add QR code image
        pdf.addImage(code.image_url, 'PNG', x, y, qrSize, qrSize);
        
        // Add Stckr icon in center of QR code
        if (iconImg) {
          const iconSize = qrSize * 0.22; // 22% of QR code size
          const centerX = x + qrSize / 2;
          const centerY = y + qrSize / 2;
          
          // Add white background circle for better contrast
          pdf.setFillColor(255, 255, 255);
          pdf.circle(centerX, centerY, iconSize / 1.8, 'F');
          
          // Add the Stckr icon
          pdf.addImage(iconImg, 'PNG', 
            centerX - iconSize/2, 
            centerY - iconSize/2, 
            iconSize, 
            iconSize
          );
        }
        
      } catch (error) {
        console.error(`Error adding QR code ${code.id} to PDF:`, error);
      }
    }
    
    pdf.save('stckr-qr-sheet.pdf');
  };

  return (
    <div className="space-y-4">
      {showDownloadPDF && codes.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Print Sheet
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code, index) => (
          <div key={code.id} className="text-center">
            <div className="border rounded-lg p-2 bg-white shadow-sm">
              {code.image_url ? (
                <div className="relative">
                  <img 
                    src={code.image_url} 
                    alt={`QR Code ${code.id}`}
                    className="w-full h-auto max-w-[150px] mx-auto"
                  />
                  {/* Stckr icon overlay for preview */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <img 
                        src="/stckr-icon.png" 
                        alt="Stckr" 
                        className="w-6 h-6"
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
                  No QR Image
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {codes.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-lg">
          <strong>Print Ready:</strong> Clean branded QR sheet with Stckr logo - ready for Printful
        </div>
      )}
    </div>
  );
};

export default QRCodeGrid;

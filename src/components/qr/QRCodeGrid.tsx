
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface QRCode {
  id: string;
  image_url?: string;
  code?: string;
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
    
    // Professional sticker sheet layout
    const margin = 15;
    const logoHeight = 20;
    const logoSpace = 30;
    const stickerSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin + logoSpace;
    
    // Add Stckr branding header
    pdf.setFillColor(75, 85, 99); // Grey-600
    pdf.rect(0, 0, pageWidth, logoSpace, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STCKR QR Code Sheet', pageWidth / 2, logoSpace / 2 + 3, { align: 'center' });
    
    // Generate 3x3 sticker grid
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      if (!code.image_url) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (stickerSize + margin);
      const y = startY + row * (stickerSize + margin);
      
      try {
        // Create sticker background with rounded corners effect
        pdf.setFillColor(55, 65, 81); // Grey-700 sticker background
        pdf.roundedRect(x - 8, y - 8, stickerSize + 16, stickerSize + 16, 3, 3, 'F');
        
        // Add subtle inner shadow effect
        pdf.setFillColor(45, 55, 68); // Darker grey for shadow
        pdf.roundedRect(x - 6, y - 6, stickerSize + 12, stickerSize + 12, 2, 2, 'F');
        
        // Main sticker surface
        pdf.setFillColor(75, 85, 99); // Main sticker color
        pdf.roundedRect(x - 4, y - 4, stickerSize + 8, stickerSize + 8, 2, 2, 'F');
        
        // Add white QR code
        pdf.addImage(code.image_url, 'PNG', x, y, stickerSize, stickerSize);
        
        // Add code identifier at bottom
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(8);
        pdf.setFont('courier', 'normal');
        pdf.text(code.code || code.id.slice(0, 6), x + stickerSize/2, y + stickerSize + 15, { align: 'center' });
        
      } catch (error) {
        console.error(`Error adding QR sticker ${code.id} to PDF:`, error);
      }
    }
    
    // Add footer with cutting guides
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('Cut along grey lines • Each sticker: white QR on dark grey', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    pdf.save('stckr-qr-sticker-sheet.pdf');
  };

  return (
    <div className="space-y-6">
      {showDownloadPDF && codes.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={downloadPDF} 
            className="bg-[#9333ea] hover:bg-[#a855f7] text-white rounded-full px-6 py-2 font-medium transition-all duration-200 hover:shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Sticker Sheet
          </Button>
        </div>
      )}
      
      {/* 3x3 Sticker Sheet Preview */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-2xl shadow-lg">
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {codes.slice(0, 9).map((code, index) => (
            <div key={code.id} className="text-center">
              {/* Sticker Preview with Branded Background */}
              <div className="relative">
                {/* Sticker background with subtle gradient and shadow */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-lg transform rotate-1"></div>
                <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-4 shadow-inner border border-slate-600">
                  {code.image_url ? (
                    <div className="relative">
                      {/* White QR Code */}
                      <img 
                        src={code.image_url} 
                        alt={`QR Code ${code.code}`}
                        className="w-full h-auto max-w-[140px] mx-auto opacity-95"
                      />
                      {/* Logo Space Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-sm border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <span className="text-[8px] text-slate-500 font-bold">LOGO</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-slate-600 rounded flex items-center justify-center text-slate-400 text-sm">
                      Generating QR...
                    </div>
                  )}
                </div>
                {/* Code Label */}
                <div className="mt-2 text-xs font-mono text-slate-600">
                  {code.code || code.id.slice(0, 6)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {codes.length > 0 && (
        <div className="text-center text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div>
            <strong>Print Ready Stickers:</strong>
          </div>
          <div className="text-xs">
            White QR codes on dark grey stickers • High contrast for maximum scannability • Logo space preserved in center
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGrid;

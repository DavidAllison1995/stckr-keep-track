
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
    
    // Calculate grid layout (3x3) optimized for print
    const margin = 15;
    const qrSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin;
    
    // Add branded header
    pdf.setFontSize(18);
    pdf.text('Stckr Professional QR Batch', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text('Premium quality with square logo placement guides', pageWidth / 2, 22, { align: 'center' });
    
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      if (!code.image_url) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + 30 + row * (qrSize + margin + 15);
      
      try {
        // Add QR code image
        pdf.addImage(code.image_url, 'PNG', x, y, qrSize, qrSize);
        
        // Add code ID with branded styling
        pdf.setFontSize(9);
        pdf.text(code.id, x + qrSize / 2, y + qrSize + 8, { align: 'center' });
        
        // Add branded URL
        pdf.setFontSize(7);
        pdf.text(`stckr.io/qr/${code.id}`, x + qrSize / 2, y + qrSize + 14, { align: 'center' });
        
        // Add larger square logo placement guide
        const centerX = x + qrSize / 2;
        const centerY = y + qrSize / 2;
        const logoSize = qrSize * 0.20; // Larger 20% square area
        
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(centerX - logoSize/2, centerY - logoSize/2, logoSize, logoSize, 'FD');
        
      } catch (error) {
        console.error(`Error adding QR code ${code.id} to PDF:`, error);
      }
    }
    
    // Add professional footer
    pdf.setFontSize(8);
    pdf.text('Professional grade QR codes with square logo space - High error correction enabled', 
             pageWidth / 2, pageWidth - 10, { align: 'center' });
    
    pdf.save('stckr-professional-qr-batch.pdf');
  };

  return (
    <div className="space-y-4">
      {showDownloadPDF && codes.length > 0 && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Professional QR Codes</h3>
            <p className="text-sm text-gray-600">Print-ready with logo placement guides</p>
          </div>
          <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Print Sheet
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code, index) => (
          <div key={code.id} className="text-center space-y-2">
            <div className="border rounded-lg p-2 bg-white shadow-sm">
              {code.image_url ? (
                <div className="relative">
                  <img 
                    src={code.image_url} 
                    alt={`QR Code ${code.id}`}
                    className="w-full h-auto max-w-[150px] mx-auto"
                  />
                  {/* Larger square logo space indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-white bg-opacity-95 border-2 border-gray-300 border-dashed flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-bold">LOGO</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                  No QR Image
                </div>
              )}
            </div>
            <div className="text-sm font-mono font-semibold">{code.id}</div>
            <div className="text-xs text-gray-500">stckr.io/qr/{code.id}</div>
          </div>
        ))}
      </div>
      
      {codes.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-lg">
          <strong>Ready for Production:</strong> High-resolution QR codes with larger square logo space for professional branding
        </div>
      )}
    </div>
  );
};

export default QRCodeGrid;

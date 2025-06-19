
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
    
    // Calculate grid layout (3x3)
    const margin = 20;
    const qrSize = (pageWidth - margin * 4) / 3; // 3 columns with margins
    const startX = margin;
    const startY = margin;
    
    pdf.setFontSize(16);
    pdf.text('QR Code Batch', pageWidth / 2, 15, { align: 'center' });
    
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      if (!code.image_url) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + 20 + row * (qrSize + margin);
      
      try {
        // Add QR code image
        pdf.addImage(code.image_url, 'PNG', x, y, qrSize, qrSize);
        
        // Add code ID below the QR code
        pdf.setFontSize(10);
        pdf.text(code.id, x + qrSize / 2, y + qrSize + 10, { align: 'center' });
      } catch (error) {
        console.error(`Error adding QR code ${code.id} to PDF:`, error);
      }
    }
    
    pdf.save('qr-codes-batch.pdf');
  };

  return (
    <div className="space-y-4">
      {showDownloadPDF && codes.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF Sheet
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code, index) => (
          <div key={code.id} className="text-center space-y-2">
            <div className="border rounded-lg p-2 bg-white">
              {code.image_url ? (
                <img 
                  src={code.image_url} 
                  alt={`QR Code ${code.id}`}
                  className="w-full h-auto max-w-[150px] mx-auto"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                  No QR Image
                </div>
              )}
            </div>
            <div className="text-sm font-mono font-semibold">{code.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeGrid;

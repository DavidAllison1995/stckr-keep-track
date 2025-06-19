
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
          const url = `https://4823056e-21ba-4628-9925-ad01b2666856.lovableproject.com/qr/${code.code}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
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
    
    // Calculate grid layout (3x3)
    const margin = 20;
    const qrSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin;
    
    pdf.setFontSize(16);
    pdf.text('Master QR Code Batch - Multi-User Sharing', pageWidth / 2, 15, { align: 'center' });
    
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      const qrImage = qrImages[code.code];
      
      if (!qrImage) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + 20 + row * (qrSize + margin);
      
      try {
        // Add QR code image
        pdf.addImage(qrImage, 'PNG', x, y, qrSize, qrSize);
        
        // Add code below the QR code
        pdf.setFontSize(10);
        pdf.text(code.code, x + qrSize / 2, y + qrSize + 10, { align: 'center' });
      } catch (error) {
        console.error(`Error adding QR code ${code.code} to PDF:`, error);
      }
    }
    
    pdf.save('master-qr-codes-batch.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF Sheet
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code) => (
          <div key={code.id} className="text-center space-y-2">
            <div className="border rounded-lg p-2 bg-white">
              {qrImages[code.code] ? (
                <img 
                  src={qrImages[code.code]} 
                  alt={`QR Code ${code.code}`}
                  className="w-full h-auto max-w-[150px] mx-auto"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                  Generating QR...
                </div>
              )}
            </div>
            <div className="text-sm font-mono font-semibold">{code.code}</div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600 mt-4">
        Each QR code can be claimed by multiple users independently
      </div>
    </div>
  );
};

export default QRCodeDisplay;

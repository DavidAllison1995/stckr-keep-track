
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
          // Use the branded deep link format
          const url = `https://stckr.io/qr/${code.code}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 400,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H', // High error correction for logo space
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
    
    // Calculate grid layout (3x3) with proper spacing for print
    const margin = 15;
    const qrSize = (pageWidth - margin * 4) / 3;
    const startX = margin;
    const startY = margin;
    
    // Add header with branded title
    pdf.setFontSize(18);
    pdf.text('Stckr Premium QR Code Sheet', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text('High-resolution codes with logo space - Ready for printing', pageWidth / 2, 22, { align: 'center' });
    
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      const qrImage = qrImages[code.code];
      
      if (!qrImage) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (qrSize + margin);
      const y = startY + 30 + row * (qrSize + margin + 15); // Extra space for labels
      
      try {
        // Add QR code image with high quality
        pdf.addImage(qrImage, 'PNG', x, y, qrSize, qrSize);
        
        // Add code ID below the QR code
        pdf.setFontSize(9);
        pdf.text(code.code, x + qrSize / 2, y + qrSize + 8, { align: 'center' });
        
        // Add URL for reference
        pdf.setFontSize(7);
        pdf.text(`stckr.io/qr/${code.code}`, x + qrSize / 2, y + qrSize + 14, { align: 'center' });
        
        // Add center indicator for logo placement (light gray circle)
        const centerX = x + qrSize / 2;
        const centerY = y + qrSize / 2;
        const logoRadius = qrSize * 0.12; // ~25% of QR size for logo space
        
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(255, 255, 255);
        pdf.circle(centerX, centerY, logoRadius, 'FD');
        
      } catch (error) {
        console.error(`Error adding QR code ${code.code} to PDF:`, error);
      }
    }
    
    // Add footer with instructions
    pdf.setFontSize(8);
    pdf.text('Instructions: White circles indicate logo placement area. Codes use high error correction.', 
             pageWidth / 2, pageWidth - 10, { align: 'center' });
    
    pdf.save('stckr-premium-qr-codes.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Premium QR Codes</h3>
          <p className="text-sm text-gray-600">High-resolution with logo space for professional printing</p>
        </div>
        <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Print Sheet
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {codes.slice(0, 9).map((code) => (
          <div key={code.id} className="text-center space-y-2">
            <div className="border rounded-lg p-2 bg-white shadow-sm">
              {qrImages[code.code] ? (
                <div className="relative">
                  <img 
                    src={qrImages[code.code]} 
                    alt={`QR Code ${code.code}`}
                    className="w-full h-auto max-w-[180px] mx-auto"
                  />
                  {/* Logo space indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-bold">LOGO</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                  Generating premium QR...
                </div>
              )}
            </div>
            <div className="text-sm font-mono font-semibold">{code.code}</div>
            <div className="text-xs text-gray-500">stckr.io/qr/{code.code}</div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-lg">
        <strong>Print Ready:</strong> Each QR code includes space for the Stckr logo and uses high error correction for reliable scanning
      </div>
    </div>
  );
};

export default QRCodeDisplay;

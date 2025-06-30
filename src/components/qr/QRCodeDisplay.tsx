
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
          // Generate functioning deep link URL
          const url = `https://stckr.app/qr/${code.code}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 512,
            margin: 0, // No margin/padding - remove white space
            color: {
              dark: '#FFFFFF', // Pure white QR modules
              light: '#1E1E2F' // Dark grey background
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

    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Professional print layout
    const margin = 20;
    const titleSpace = 40;
    const qrSize = (pageWidth - margin * 4) / 3;
    const spacing = 15;
    
    // Add branded header
    pdf.setFillColor(30, 30, 47);
    pdf.rect(0, 0, pageWidth, titleSpace, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STCKR QR Code Sheet', pageWidth / 2, titleSpace / 2, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('White QR Codes for Dark Sticker Backgrounds', pageWidth / 2, titleSpace / 2 + 10, { align: 'center' });
    
    // Generate clean 3x3 grid
    const startY = titleSpace + margin;
    
    for (let i = 0; i < Math.min(codes.length, 9); i++) {
      const code = codes[i];
      const qrImage = qrImages[code.code];
      
      if (!qrImage) continue;
      
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = margin + col * (qrSize + spacing);
      const y = startY + row * (qrSize + spacing + 20);
      
      try {
        // Add dark sticker background
        pdf.setFillColor(30, 30, 47);
        pdf.roundedRect(x - 8, y - 8, qrSize + 16, qrSize + 16, 4, 4, 'F');
        
        // Add QR code (white modules on dark background)
        pdf.addImage(qrImage, 'PNG', x, y, qrSize, qrSize);
        
        // Add code label
        pdf.setTextColor(220, 220, 220);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(code.code, x + qrSize/2, y + qrSize + 14, { align: 'center' });
        
      } catch (error) {
        console.error(`Error adding QR code ${code.code} to PDF:`, error);
      }
    }
    
    pdf.save('stckr-white-qr-print-sheet.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button 
          onClick={downloadPDF} 
          className="bg-[#9333ea] hover:bg-[#a855f7] text-white rounded-full px-6 py-2 font-medium transition-all duration-200 hover:shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Print-Ready PDF
        </Button>
      </div>
      
      {/* Print-Ready 3x3 Sticker Sheet Preview */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        {/* Header */}
        <div className="bg-[#1e1e2f] text-white p-6 rounded-lg mb-8 text-center">
          <h3 className="text-xl font-bold">STCKR QR Code Sheet</h3>
          <p className="text-sm text-gray-300 mt-2">White QR Codes for Dark Sticker Backgrounds</p>
        </div>
        
        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {codes.slice(0, 9).map((code) => (
            <div key={code.id} className="text-center">
              {/* Dark Sticker Preview */}
              <div className="relative">
                {/* Dark sticker background */}
                <div className="bg-[#1e1e2f] rounded-xl p-4 shadow-lg border-2 border-gray-600">
                  {qrImages[code.code] ? (
                    <div className="relative">
                      {/* QR Code with white modules on dark background */}
                      <img 
                        src={qrImages[code.code]} 
                        alt={`QR Code ${code.code}`}
                        className="w-full h-auto max-w-[180px] mx-auto rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm">
                      Generating QR...
                    </div>
                  )}
                </div>
                {/* Code Label */}
                <div className="mt-3 text-sm font-mono text-gray-700 font-bold">
                  {code.code}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Print Instructions */}
        <div className="mt-8 text-center text-sm text-gray-600 bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-4 h-4 bg-[#1e1e2f] border border-gray-300 rounded-sm"></div>
            <strong>Optimized for Dark Sticker Printing:</strong>
          </div>
          <div className="text-xs space-y-2">
            <div>• White QR modules (#FFFFFF) on dark background (#1E1E2F)</div>
            <div>• No white padding or fill - only the QR pattern is white</div>
            <div>• Logo space preserved in center of each code</div>
            <div>• Print at 300 DPI or higher for best scannability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

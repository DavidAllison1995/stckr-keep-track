
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const downloadPrintableStickers = async () => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Professional print layout
  const margin = 15;
  const titleSpace = 35;
  const stickerSize = 50; // 50mm x 50mm stickers
  const spacing = 10;
  const cols = 3;
  const rows = 4;
  
  // Add branded header
  pdf.setFillColor(30, 30, 47); // Dark branded background
  pdf.rect(0, 0, pageWidth, titleSpace, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STCKR - Printable QR Sticker Sheet', pageWidth / 2, titleSpace / 2, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Print at 300 DPI on adhesive label sheets • Cut along dotted lines', pageWidth / 2, titleSpace / 2 + 8, { align: 'center' });
  
  // Generate QR codes for demo purposes (in a real app, these would come from your system)
  const demoQRCodes = Array.from({ length: 12 }, (_, i) => `STCKR-${String(i + 1).padStart(3, '0')}`);
  
  // Calculate grid positioning
  const startY = titleSpace + margin;
  const totalWidth = cols * stickerSize + (cols - 1) * spacing;
  const startX = (pageWidth - totalWidth) / 2;
  
  for (let i = 0; i < Math.min(demoQRCodes.length, 12); i++) {
    const code = demoQRCodes[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * (stickerSize + spacing);
    const y = startY + row * (stickerSize + spacing);
    
    try {
      // Generate QR code with STCKR branding
      const qrUrl = `https://stckr.app/qr/${code}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 1,
        color: {
          dark: '#1E1E2F', // Dark QR modules
          light: '#FFFFFF' // White background
        },
        errorCorrectionLevel: 'H', // High error correction for logo space
      });
      
      // Add sticker background with rounded corners
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, stickerSize, stickerSize, 3, 3, 'F');
      
      // Add subtle border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(x, y, stickerSize, stickerSize, 3, 3, 'S');
      
      // Add QR code
      const qrSize = stickerSize * 0.7; // 70% of sticker size
      const qrX = x + (stickerSize - qrSize) / 2;
      const qrY = y + (stickerSize - qrSize) / 2 - 3; // Slightly up for text space
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Add STCKR branding text
      pdf.setTextColor(147, 51, 234); // Purple brand color
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STCKR', x + stickerSize / 2, y + stickerSize - 5, { align: 'center' });
      
      // Add code reference (small)
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(code, x + stickerSize / 2, y + stickerSize - 2, { align: 'center' });
      
      // Add cutting guides (dotted lines)
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.1);
      pdf.setLineDashPattern([1, 1], 0);
      
      // Top and bottom guides
      if (row > 0) {
        pdf.line(x - 2, y, x + stickerSize + 2, y);
      }
      if (row < rows - 1 && i + cols < demoQRCodes.length) {
        pdf.line(x - 2, y + stickerSize, x + stickerSize + 2, y + stickerSize);
      }
      
      // Left and right guides
      if (col > 0) {
        pdf.line(x, y - 2, x, y + stickerSize + 2);
      }
      if (col < cols - 1) {
        pdf.line(x + stickerSize, y - 2, x + stickerSize, y + stickerSize + 2);
      }
      
      // Reset line style
      pdf.setLineDashPattern([], 0);
      
    } catch (error) {
      console.error(`Error generating QR code for ${code}:`, error);
    }
  }
  
  // Add footer with printing instructions
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(8);
  pdf.text('📌 Print on adhesive label sheets (50mm x 50mm stickers) • Ensure actual size printing (no scaling)', pageWidth / 2, pageHeight - 15, { align: 'center' });
  pdf.setFontSize(7);
  pdf.text('💡 Compatible with Avery L7155, L7160 or similar label sheets • Visit stckr.app for more info', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Download the PDF
  pdf.save('stckr-printable-sticker-sheet.pdf');
};

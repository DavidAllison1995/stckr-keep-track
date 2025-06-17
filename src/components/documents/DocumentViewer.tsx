
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { saveAs } from 'file-saver';

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer = ({ fileUrl, fileName, isOpen, onClose }: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfComponent, setPdfComponent] = useState<any>(null);

  // Dynamically import react-pdf to avoid SSR issues
  useEffect(() => {
    const loadPdfComponent = async () => {
      try {
        const { Document, Page, pdfjs } = await import('react-pdf');
        
        // Configure PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        setPdfComponent({ Document, Page });
      } catch (err) {
        console.error('Failed to load PDF component:', err);
        setError('PDF viewer not available');
      }
    };

    if (isOpen && fileUrl.toLowerCase().includes('.pdf')) {
      loadPdfComponent();
    }
  }, [isOpen, fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF load error:', error);
    setError('Unable to display this document. You can try downloading it instead.');
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(fileUrl, '_blank');
    }
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const isPdf = fileUrl.toLowerCase().includes('.pdf');

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold truncate mr-4">
            {fileName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isPdf ? (
            <div className="h-full flex flex-col">
              {/* PDF Navigation */}
              {numPages && numPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-2 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* PDF Content */}
              <div className="flex-1 overflow-auto flex justify-center items-start p-4">
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                )}

                {pdfComponent && !error && (
                  <div className="max-w-full">
                    <pdfComponent.Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading=""
                    >
                      <pdfComponent.Page
                        pageNumber={pageNumber}
                        width={Math.min(window.innerWidth * 0.8, 800)}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </pdfComponent.Document>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Non-PDF files (images, etc.)
            <div className="h-full overflow-auto flex justify-center items-center p-4">
              {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setError('Unable to display this file')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download {fileName}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;

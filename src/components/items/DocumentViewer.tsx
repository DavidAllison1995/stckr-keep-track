
import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
  };
}

const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (document.type === 'image') {
    return (
      <div className="flex flex-col h-full">
        {/* Image Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-16 text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex items-center justify-center min-h-full">
            {isLoading && (
              <div className="text-gray-500">Loading image...</div>
            )}
            {hasError && (
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Failed to load image</p>
              </div>
            )}
            {!hasError && (
              <img
                src={document.url}
                alt={document.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                className="shadow-lg"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (document.type === 'pdf') {
    return (
      <div className="flex flex-col h-full">
        {/* PDF Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="text-sm text-gray-600">
            PDF Document
          </div>
        </div>

        {/* PDF Display */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${document.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            title={document.name}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-gray-500">Loading PDF...</div>
            </div>
          )}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Failed to load PDF</p>
                <p className="text-sm mt-2">
                  <a 
                    href={document.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in new tab
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Unsupported file type</p>
        <p className="text-sm mt-2">
          <a 
            href={document.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download to view
          </a>
        </p>
      </div>
    </div>
  );
};

export default DocumentViewer;

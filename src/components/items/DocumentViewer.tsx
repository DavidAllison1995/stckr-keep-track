
import { useState } from 'react';
import { Download, ExternalLink, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
  };
  onDownload?: () => void;
}

const DocumentViewer = ({ document, onDownload }: DocumentViewerProps) => {
  const [imageError, setImageError] = useState(false);

  const handleOpenInNewTab = () => {
    window.open(document.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback download method
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const renderThumbnail = () => {
    // For images, use the original file as thumbnail
    if (document.type === 'image') {
      return (
        <img
          src={document.url}
          alt={document.name}
          className="w-full h-32 object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      );
    }

    // For PDFs, use thumbnail if available, otherwise show PDF icon
    if (document.type === 'pdf') {
      if (document.thumbnailUrl && !imageError) {
        return (
          <img
            src={document.thumbnailUrl}
            alt={`${document.name} preview`}
            className="w-full h-32 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        );
      }
      
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="mb-3">
        {renderThumbnail()}
      </div>

      {/* Document Info */}
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 truncate" title={document.name}>
            {document.name}
          </h4>
          <p className="text-sm text-gray-500 capitalize">
            {document.type.toUpperCase()} Document
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="flex-1 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;

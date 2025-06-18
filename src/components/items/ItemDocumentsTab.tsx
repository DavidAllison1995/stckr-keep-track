
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DocumentViewer from './DocumentViewer';
import { FileText, Upload, Plus } from 'lucide-react';

interface ItemDocumentsTabProps {
  itemId: string;
}

const ItemDocumentsTab = ({ itemId }: ItemDocumentsTabProps) => {
  const [documents] = useState<any[]>([]); // Placeholder for future document functionality
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Placeholder documents for demonstration
  const sampleDocuments = [
    {
      id: '1',
      name: 'User Manual.pdf',
      type: 'pdf',
      url: '/placeholder-document.pdf',
      thumbnailUrl: '/placeholder-thumbnail.jpg'
    },
    {
      id: '2',
      name: 'Warranty Certificate.jpg',
      type: 'image',
      url: '/placeholder-image.jpg'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Documents & Files</h3>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {showUploadForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Upload Document</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-file">Choose File</Label>
              <Input
                id="document-file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="document-name">Document Name (Optional)</Label>
              <Input
                id="document-name"
                type="text"
                placeholder="e.g., User Manual, Warranty Certificate"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowUploadForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentViewer
              key={doc.id}
              document={doc}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">No documents yet</h4>
          <p className="text-gray-600 mb-6">
            Upload manuals, warranties, receipts, and other important documents for this item.
          </p>
          <Button onClick={() => setShowUploadForm(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload First Document
          </Button>
        </div>
      )}

      {/* File Type Support Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Supported File Types</h4>
        <p className="text-sm text-blue-800">
          PDF documents, Word files (.doc, .docx), and images (.jpg, .jpeg, .png) up to 10MB each.
        </p>
      </div>
    </div>
  );
};

export default ItemDocumentsTab;

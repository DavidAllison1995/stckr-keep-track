import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import DocumentViewer from './DocumentViewer';
import { FileText, Upload, Plus, Trash2 } from 'lucide-react';
interface ItemDocumentsTabProps {
  itemId: string;
}
const ItemDocumentsTab = ({
  itemId
}: ItemDocumentsTabProps) => {
  const {
    items,
    updateItem,
    uploadDocument,
    deleteDocument
  } = useSupabaseItems();
  const {
    toast
  } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');

  // Get the current item and its documents
  const item = items.find(item => item.id === itemId);
  const documents = item?.documents || [];
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };
  const handleUpload = async () => {
    if (!selectedFile || !item) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      console.log('Starting document upload...');

      // Upload the file to storage
      const fileUrl = await uploadDocument(itemId, selectedFile);
      console.log('File uploaded to:', fileUrl);

      // Create document metadata
      const newDocument = {
        id: Date.now().toString(),
        name: documentName || selectedFile.name,
        type: selectedFile.type.includes('pdf') ? 'pdf' : selectedFile.type.includes('image') ? 'image' : 'document',
        url: fileUrl,
        uploadDate: new Date().toISOString()
      };
      console.log('Creating document metadata:', newDocument);

      // Update the item with the new document
      const updatedDocuments = [...documents, newDocument];
      await updateItem(itemId, {
        documents: updatedDocuments
      });
      console.log('Item updated with new document');

      // Reset form
      setSelectedFile(null);
      setDocumentName('');
      setShowUploadForm(false);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleDeleteDocument = async (documentToDelete: any) => {
    if (!item) return;
    try {
      console.log('Deleting document:', documentToDelete);

      // Remove file from storage
      await deleteDocument(documentToDelete.url);

      // Update item by removing the document from the array
      const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete.id);
      await updateItem(itemId, {
        documents: updatedDocuments
      });
      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Documents & Files</h3>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {showUploadForm && <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Upload Document</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-file">Choose File</Label>
              <Input id="document-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileSelect} className="mt-1" />
              {selectedFile && <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>}
            </div>
            <div>
              <Label htmlFor="document-name">Document Name</Label>
              <Input id="document-name" type="text" value={documentName} onChange={e => setDocumentName(e.target.value)} placeholder="e.g., User Manual, Warranty Certificate" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button variant="outline" onClick={() => {
            setShowUploadForm(false);
            setSelectedFile(null);
            setDocumentName('');
          }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>}

      {/* Documents Grid */}
      {documents.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => <div key={doc.id} className="relative">
              <DocumentViewer document={doc} />
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => handleDeleteDocument(doc)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>)}
        </div> : <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">No documents yet</h4>
          <p className="text-gray-600 mb-6">
            Upload manuals, warranties, receipts, and other important documents for this item.
          </p>
          <Button onClick={() => setShowUploadForm(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload First Document
          </Button>
        </div>}

      {/* File Type Support Info */}
      
    </div>;
};
export default ItemDocumentsTab;
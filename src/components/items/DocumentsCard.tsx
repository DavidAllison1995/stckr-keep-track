
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';

interface DocumentsCardProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const DocumentsCard = ({ item, onTabChange }: DocumentsCardProps) => {
  const handleDocumentsSectionClick = () => {
    if (onTabChange) {
      onTabChange('documents');
    }
  };

  const handleViewAllDocuments = () => {
    if (onTabChange) {
      onTabChange('documents');
    }
  };

  if (!item.documents || item.documents.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={handleDocumentsSectionClick}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
          <FileText className="w-5 h-5 text-blue-600" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-3 mb-4">
          {item.documents.slice(0, 3).map((doc) => (
            <div key={doc.id} className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
              {doc.type === 'image' ? (
                <img 
                  src={doc.url} 
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-6 h-6 text-blue-600" />
              )}
            </div>
          ))}
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            handleViewAllDocuments();
          }}
        >
          View All ({item.documents.length})
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;

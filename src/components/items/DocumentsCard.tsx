
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';

interface DocumentsCardProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const DocumentsCard = ({ item, onTabChange }: DocumentsCardProps) => {
  const handleViewAllDocuments = () => {
    if (onTabChange) {
      onTabChange('documents');
    }
  };

  if (!item.documents || item.documents.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardHeader className="pb-3 mobile-compact-p">
        <CardTitle className="text-lg mobile-text-sm flex items-center mobile-tight-gap gap-2 text-white">
          <FileText className="w-5 h-5 mobile-icon-md text-purple-400" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="mobile-compact-p">
        <div className="flex space-x-3 mb-4">
          {item.documents.slice(0, 3).map((doc) => (
            <div key={doc.id} className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700 shadow-sm">
              {doc.type === 'image' ? (
                <img 
                  src={doc.url} 
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-6 h-6 text-purple-400" />
              )}
            </div>
          ))}
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="p-0 h-auto text-purple-400 hover:text-purple-300 font-medium transition-colors duration-150"
          onClick={handleViewAllDocuments}
        >
          View All ({item.documents.length})
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;

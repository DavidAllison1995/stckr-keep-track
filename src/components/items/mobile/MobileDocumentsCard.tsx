
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import { Item } from '@/hooks/useSupabaseItems';

interface MobileDocumentsCardProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const MobileDocumentsCard = ({ item, onTabChange }: MobileDocumentsCardProps) => {
  const handleViewAllDocuments = () => {
    if (onTabChange) {
      onTabChange('documents');
    }
  };

  if (!item.documents || item.documents.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-gray-900">
            <FileText className="w-4 h-4 text-blue-600" />
            Documents
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewAllDocuments}
            className="text-xs h-7 px-2"
          >
            View All ({item.documents.length}) <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {item.documents.slice(0, 4).map((doc) => (
            <div key={doc.id} className="aspect-square bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
              {doc.type === 'image' ? (
                <img 
                  src={doc.url} 
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDocumentsCard;


import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Item } from '@/hooks/useItems';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import ItemDetail from './ItemDetail';
import ItemForm from './ItemForm';
import DocumentViewer from '@/components/documents/DocumentViewer';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

const ItemCard = ({ item, onClick }: ItemCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isOpen: isDocViewerOpen, fileUrl, fileName, openViewer, closeViewer } = useDocumentViewer();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Item Image/Icon */}
            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              {item.photoUrl ? (
                <img 
                  src={item.photoUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
              
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {item.category}
                </span>
                {item.room && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {item.room}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              )}

              {(item.purchaseDate || item.warrantyDate) && (
                <div className="text-xs text-gray-500 space-y-1">
                  {item.purchaseDate && (
                    <div>Purchased: {new Date(item.purchaseDate).toLocaleDateString()}</div>
                  )}
                  {item.warrantyDate && (
                    <div>Warranty: {new Date(item.warrantyDate).toLocaleDateString()}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailModalOpen(true);
                }}
              >
                View Details
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <ItemDetail 
            item={item} 
            onClose={() => setIsDetailModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            item={item}
            onSuccess={() => setIsEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={isDocViewerOpen}
        fileUrl={fileUrl}
        fileName={fileName}
        onClose={closeViewer}
      />
    </>
  );
};

export default ItemCard;

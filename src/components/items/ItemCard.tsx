
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Item } from '@/hooks/useItems';
import ItemDetail from './ItemDetail';

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
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

            {/* Item Info */}
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

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setIsDetailModalOpen(true)}
              >
                View Details
              </Button>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
};

export default ItemCard;

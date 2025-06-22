
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Item } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';
import { ChevronDown, ChevronUp, Tag, Home, ShoppingCart, Shield, StickyNote } from 'lucide-react';

interface ItemInfoCardProps {
  item: Item;
}

const ItemInfoCard = ({ item }: ItemInfoCardProps) => {
  const [showMore, setShowMore] = useState(false);
  const IconComponent = getIconComponent(item.icon_id || 'box');

  return (
    <Card className="shadow-sm border border-gray-200 bg-white">
      <CardContent className="space-y-4 p-6">
        {/* Header Row: Icon + Name */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 flex-1">{item.name}</h3>
        </div>

        {/* Tag Row: Category & Room */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <Tag className="w-3.5 h-3.5" />
            {item.category}
          </div>
          {item.room && (
            <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <Home className="w-3.5 h-3.5" />
              {item.room}
            </div>
          )}
        </div>

        {/* Description Preview */}
        {item.description && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 font-medium mb-1">Description</div>
            <p className="text-gray-800 text-sm leading-relaxed">
              {showMore ? item.description : `${item.description.slice(0, 100)}${item.description.length > 100 ? '...' : ''}`}
            </p>
          </div>
        )}

        {/* Expandable Section */}
        {(item.notes || item.purchase_date || item.warranty_date) && (
          <div className="border-t border-gray-100 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 ease-in-out"
            >
              <span className="mr-2">
                {showMore ? 'Show less details' : 'Show more details'}
              </span>
              {showMore ? (
                <ChevronUp className="w-4 h-4 transition-transform duration-150 ease-in-out" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform duration-150 ease-in-out" />
              )}
            </Button>

            <div className={`transition-all duration-150 ease-in-out overflow-hidden ${
              showMore ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="grid grid-cols-1 gap-4">
                {/* Notes Section */}
                {item.notes && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StickyNote className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Notes</span>
                    </div>
                    <p className="text-sm text-amber-700 italic leading-relaxed">{item.notes}</p>
                  </div>
                )}

                {/* Dates Grid */}
                {(item.purchase_date || item.warranty_date) && (
                  <div className="grid grid-cols-1 gap-3">
                    {item.purchase_date && (
                      <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-800">Purchased</div>
                          <div className="text-sm text-green-700">
                            {new Date(item.purchase_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {item.warranty_date && (
                      <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-purple-800">Warranty Until</div>
                          <div className="text-sm text-purple-700">
                            {new Date(item.warranty_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemInfoCard;

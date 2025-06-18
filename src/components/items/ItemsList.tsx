import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useItems } from '@/hooks/useItems';
import { getIconComponent } from '@/components/icons';
import ItemCard from './ItemCard';
import ItemForm from './ItemForm';

interface ItemsListProps {
  onItemSelect?: (itemId: string) => void;
}

const ItemsList = ({ onItemSelect }: ItemsListProps) => {
  const { items } = useItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = Array.from(new Set(items.map(item => item.category)));
  const rooms = Array.from(new Set(items.map(item => item.room).filter(Boolean)));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesRoom = roomFilter === 'all' || item.room === roomFilter;
    
    return matchesSearch && matchesCategory && matchesRoom;
  });

  const handleItemClick = (itemId: string) => {
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };

  const BoxIcon = getIconComponent('box');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BoxIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
            <p className="text-gray-600">Manage your household inventory</p>
          </div>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <span className="mr-2">+</span>
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <ItemForm onSuccess={() => setIsAddModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all' || roomFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first item to track'}
            </p>
            {!searchTerm && categoryFilter === 'all' && roomFilter === 'all' && (
              <Button onClick={() => setIsAddModalOpen(true)}>Add Your First Item</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsList;

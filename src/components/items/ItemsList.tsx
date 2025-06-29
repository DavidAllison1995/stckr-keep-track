
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useDragScroll } from '@/hooks/useDragScroll';
import { getIconComponent } from '@/components/icons';
import { Plus, Search, Filter } from 'lucide-react';
import ItemCard from './ItemCard';
import ItemForm from './ItemForm';

interface ItemsListProps {
  onItemSelect?: (itemId: string) => void;
}

const ItemsList = ({ onItemSelect }: ItemsListProps) => {
  const { items } = useSupabaseItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { getDragProps, isDragActive } = useDragScroll();

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
    // Prevent navigation if user was dragging
    if (isDragActive()) return;
    
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };

  const BoxIcon = getIconComponent('box');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 shadow-soft">
            <BoxIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-400 drop-shadow-sm">My Items</h1>
            <p className="text-sm text-gray-400">Manage your household inventory</p>
          </div>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 shadow-medium bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 hover:scale-105">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="animate-scale-in bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-purple-400">Add New Item</DialogTitle>
            </DialogHeader>
            <ItemForm onSuccess={() => setIsAddModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Search and Filters */}
      <Card variant="elevated" className="bg-gray-800/50 border-gray-700 shadow-medium backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-gray-900/70 border-gray-600 focus:bg-gray-900 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-gray-500 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-400" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36 h-9 pl-8 bg-gray-900/70 border-gray-600 text-white hover:border-purple-500 transition-colors">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="animate-slide-up bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-purple-600/20">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-purple-600/20">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-32 h-9 bg-gray-900/70 border-gray-600 text-white hover:border-purple-500 transition-colors">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent className="animate-slide-up bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-purple-600/20">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room} value={room} className="text-white hover:bg-purple-600/20">{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Items Grid */}
      {filteredItems.length === 0 ? (
        <Card variant="elevated" className="bg-gray-800/50 border-gray-700 shadow-medium">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <BoxIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No items found</h3>
            <p className="text-gray-400 mb-4 text-sm">
              {searchTerm || categoryFilter !== 'all' || roomFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first item to track'}
            </p>
            {!searchTerm && categoryFilter === 'all' && roomFilter === 'all' && (
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105">
                <Plus className="w-4 h-4" />
                Add Your First Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div 
            {...getDragProps()}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="w-[calc(25%-0.75rem)] min-w-[220px] sm:min-w-[240px] lg:min-w-[260px] flex-shrink-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ItemCard 
                  item={item} 
                  onClick={() => handleItemClick(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;

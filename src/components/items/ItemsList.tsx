
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useDragScroll } from '@/hooks/useDragScroll';
import { getIconComponent } from '@/components/icons';
import { Plus, Search, Filter, Package } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-medium">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Items</h1>
              <p className="text-gray-600 text-lg">Manage your household inventory</p>
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-medium px-6 py-3">
                <Plus className="w-5 h-5" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="animate-scale-in">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <ItemForm onSuccess={() => setIsAddModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Search and Filters */}
        <Card variant="elevated" className="border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search items by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 text-base rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-44 h-12 pl-11 bg-white/50 border-gray-200 rounded-xl">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="animate-slide-up">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger className="w-36 h-12 bg-white/50 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Room" />
                  </SelectTrigger>
                  <SelectContent className="animate-slide-up">
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

        {/* Enhanced Items Grid - Card Wall Style */}
        {filteredItems.length === 0 ? (
          <Card variant="elevated" className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-brand-gradient-subtle rounded-3xl flex items-center justify-center">
                <BoxIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                {searchTerm || categoryFilter !== 'all' || roomFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'Start building your digital inventory by adding your first item'}
              </p>
              {!searchTerm && categoryFilter === 'all' && roomFilter === 'all' && (
                <Button size="lg" onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-medium">
                  <Plus className="w-5 h-5" />
                  Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ItemCard 
                  item={item} 
                  onClick={() => handleItemClick(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsList;

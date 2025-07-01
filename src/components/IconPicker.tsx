
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { iconRegistry, getIconsByCategory, searchIcons, getAllCategories, getIconComponent } from '@/components/icons';
import { Search, Package } from 'lucide-react';

interface IconPickerProps {
  selectedIconId: string;
  onChange: (iconId: string) => void;
}

const IconPicker = ({ selectedIconId, onChange }: IconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = getAllCategories();
  const SelectedIcon = getIconComponent(selectedIconId);
  
  const getDisplayedIcons = () => {
    if (searchQuery.trim()) {
      return searchIcons(searchQuery);
    }
    
    if (selectedCategory === 'all') {
      return iconRegistry;
    }
    
    return getIconsByCategory(selectedCategory);
  };

  const displayedIcons = getDisplayedIcons();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="iconPicker" className="text-gray-100">Choose an Icon</Label>
        <div className="mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
              <SelectedIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-100">Selected Icon</p>
              <p className="text-xs text-gray-400">
                {iconRegistry.find(icon => icon.id === selectedIconId)?.name || 'Generic Item'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search icons (e.g., 'drill', 'kitchen', 'car')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {categories.slice(0, 5).map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category.length > 8 ? category.slice(0, 6) + '...' : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-3">
            <ScrollArea className="h-64 border border-gray-700 rounded-lg bg-gray-800/50">
              <div className="p-3">
                {displayedIcons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="w-12 h-12 text-gray-500 mb-2" />
                    <p className="text-gray-400">No icons found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try a different search term or category
                    </p>
                  </div>
                ) : (
                  <>
                    {searchQuery && (
                      <p className="text-xs text-gray-400 mb-3">
                        Found {displayedIcons.length} icon{displayedIcons.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {displayedIcons.map((icon) => {
                        const IconComponent = icon.component;
                        const isSelected = selectedIconId === icon.id;
                        
                        return (
                          <Button
                            key={icon.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(icon.id)}
                            className={`p-3 h-auto flex flex-col gap-1 transition-all duration-200 hover:bg-purple-600/20 hover:border-purple-500/30 ${
                              isSelected 
                                ? 'bg-purple-600/30 border border-purple-500/50 shadow-md' 
                                : 'bg-gray-700/50 border border-gray-600/50 hover:bg-purple-600/20'
                            }`}
                            title={`${icon.name} (${icon.category})`}
                          >
                            <IconComponent className="w-6 h-6" />
                            <span className="text-[10px] text-center leading-tight text-gray-300 group-hover:text-white">
                              {icon.name.length > 8 ? icon.name.slice(0, 6) + '...' : icon.name}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IconPicker;

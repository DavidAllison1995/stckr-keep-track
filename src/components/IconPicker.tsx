
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { iconRegistry, getIconById } from '@/components/icons';

interface IconPickerProps {
  selectedIconId?: string;
  onChange: (iconId: string) => void;
}

const IconPicker = ({ selectedIconId = 'box', onChange }: IconPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = Array.from(new Set(iconRegistry.map(icon => icon.category)));
  
  const filteredIcons = iconRegistry.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedIcon = getIconById(selectedIconId);

  return (
    <div className="space-y-4">
      <div>
        <Label>Item Icon</Label>
        <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-gray-50">
          {selectedIcon && (
            <selectedIcon.component className="w-6 h-6" />
          )}
          <span className="text-sm font-medium">
            {selectedIcon ? selectedIcon.name : 'Select an icon'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Badge>
          {categories.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
        {filteredIcons.map(icon => {
          const IconComponent = icon.component;
          const isSelected = selectedIconId === icon.id;
          
          return (
            <Button
              key={icon.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`h-12 flex flex-col items-center justify-center gap-1 ${
                isSelected ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => onChange(icon.id)}
              title={icon.name}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs truncate w-full text-center">
                {icon.name.split(' ')[0]}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;

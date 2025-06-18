
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { iconRegistry, getIconById } from '@/components/icons';

interface IconPickerProps {
  selectedIconId?: string;
  onChange: (iconId: string) => void;
}

const IconPicker = ({ selectedIconId = 'box', onChange }: IconPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredIcons = iconRegistry.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show "Default" option if no matches
  const displayIcons = filteredIcons.length > 0 ? filteredIcons : [
    { id: 'box', name: 'Default', component: getIconById('box')?.component, category: 'Other' }
  ];

  const selectedIcon = getIconById(selectedIconId);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < displayIcons.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : displayIcons.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (displayIcons[highlightedIndex]) {
          handleSelect(displayIcons[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (iconId: string) => {
    onChange(iconId);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking inside dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <Label>Item Icon</Label>
      
      <div className="relative">
        {/* Selected Icon + Search Input Bar */}
        <div className="flex items-center gap-3 p-3 border rounded-md bg-background">
          {/* Selected Icon Display */}
          <div className="flex items-center gap-2 min-w-0">
            {selectedIcon && (
              <selectedIcon.component className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">
              {selectedIcon ? selectedIcon.name : 'Select an icon'}
            </span>
          </div>
          
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto"
          >
            {displayIcons.map((icon, index) => {
              const IconComponent = icon.component;
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div
                  key={icon.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    isHighlighted 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelect(icon.id);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {IconComponent && <IconComponent className="w-6 h-6 flex-shrink-0" />}
                  <span className="text-sm">{icon.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;

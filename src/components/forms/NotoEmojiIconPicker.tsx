
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotoEmojiIcon from '@/components/icons/NotoEmojiIcon';
import { searchIcons, getIconByEmoji, getDefaultIcon, NotoEmojiIconData } from '@/data/notoEmojiIcons';
import { Search, ChevronDown } from 'lucide-react';

interface NotoEmojiIconPickerProps {
  selectedEmoji: string;
  onChange: (emoji: string) => void;
  className?: string;
}

const NotoEmojiIconPicker = ({ selectedEmoji, onChange, className = '' }: NotoEmojiIconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredIcons, setFilteredIcons] = useState<NotoEmojiIconData[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIcon = getIconByEmoji(selectedEmoji) || getDefaultIcon();

  useEffect(() => {
    const results = searchIcons(searchQuery);
    setFilteredIcons(results.slice(0, 50)); // Limit to 50 results for performance
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIconSelect = (icon: NotoEmojiIconData) => {
    onChange(icon.emoji);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="iconPicker" className="text-sm font-medium text-gray-100 mb-2 block">
        Icon
      </Label>
      
      {/* Current Selection Display */}
      <div className="flex items-center gap-3 mb-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
        <NotoEmojiIcon emoji={selectedIcon.emoji} className="w-6 h-6" size={24} />
        <div>
          <p className="text-sm font-medium text-gray-100">{selectedIcon.name}</p>
          <p className="text-xs text-gray-400">{selectedIcon.category}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search icons (e.g., 'car', 'laptop', 'wrench')..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            className="pl-10 pr-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
          />
          <ChevronDown 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <ScrollArea className="h-64">
              <div className="p-2">
                {filteredIcons.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>No icons found</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <>
                    {searchQuery && (
                      <p className="text-xs text-gray-400 mb-2 px-2">
                        {filteredIcons.length} result{filteredIcons.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    <div className="space-y-1">
                      {filteredIcons.map((icon, index) => (
                        <button
                          key={`${icon.emoji}-${index}`}
                          onClick={() => handleIconSelect(icon)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-gray-700 rounded-md transition-colors text-left"
                        >
                          <NotoEmojiIcon emoji={icon.emoji} className="w-5 h-5 flex-shrink-0" size={20} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-100 truncate">{icon.name}</p>
                            <p className="text-xs text-gray-400 truncate">{icon.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotoEmojiIconPicker;

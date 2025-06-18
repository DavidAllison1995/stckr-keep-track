
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';

interface TaskSuggestion {
  id: string;
  title: string;
  scheduledDate: string;
  itemName: string;
}

interface TaskSearchProps {
  onTaskSelect: (task: TaskSuggestion) => void;
}

const TaskSearch = ({ onTaskSelect }: TaskSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { tasks } = useSupabaseMaintenance();
  const { getItemById } = useSupabaseItems();

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(async () => {
        if (query.trim().length === 0) {
          setSuggestions([]);
          setError(null);
          setShowDropdown(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        setShowDropdown(true);

        try {
          // Filter tasks based on search query
          const filteredTasks = tasks
            .filter(task => {
              const taskTitle = task.title.toLowerCase();
              const itemName = task.item_id ? getItemById(task.item_id)?.name.toLowerCase() || '' : '';
              const searchTerm = query.toLowerCase();
              
              return taskTitle.includes(searchTerm) || itemName.includes(searchTerm);
            })
            .slice(0, 10) // Limit to 10 suggestions
            .map(task => ({
              id: task.id,
              title: task.title,
              scheduledDate: task.date,
              itemName: task.item_id ? getItemById(task.item_id)?.name || 'Unknown Item' : 'No Item'
            }));

          setSuggestions(filteredTasks);
        } catch (err) {
          setError('Unable to load tasks. Try again.');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 250);

      return () => clearTimeout(timeoutId);
    },
    [tasks, getItemById]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(searchValue);
    return cleanup;
  }, [searchValue, debouncedSearch]);

  const handleSelect = (task: TaskSuggestion) => {
    onTaskSelect(task);
    setShowDropdown(false);
    setSearchValue('');
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchValue.trim().length > 0) {
              setShowDropdown(true);
            }
          }}
          className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>
      
      {showDropdown && (
        <div className="absolute top-full left-0 w-64 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-[300px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Loading...
            </div>
          )}
          {error && (
            <div className="px-4 py-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          {!isLoading && !error && suggestions.length === 0 && searchValue.trim() && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              No tasks found for "{searchValue}".
            </div>
          )}
          {!isLoading && !error && suggestions.length > 0 && (
            <div 
              className="py-1" 
              role="listbox"
              aria-label="Search results"
            >
              {suggestions.map((task, index) => (
                <div
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-sm text-gray-900">{task.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>on {formatDate(task.scheduledDate)}</span>
                      <span>•</span>
                      <span className="italic">for {task.itemName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearch;

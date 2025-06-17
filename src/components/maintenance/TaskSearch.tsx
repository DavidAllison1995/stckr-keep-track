
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useItems } from '@/hooks/useItems';

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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tasks } = useMaintenance();
  const { getItemById } = useItems();

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(async () => {
        if (query.trim().length === 0) {
          setSuggestions([]);
          setError(null);
          setOpen(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        setOpen(true);

        try {
          // Filter tasks based on search query
          const filteredTasks = tasks
            .filter(task => {
              const taskTitle = task.title.toLowerCase();
              const itemName = task.itemId ? getItemById(task.itemId)?.name.toLowerCase() || '' : '';
              const searchTerm = query.toLowerCase();
              
              return taskTitle.includes(searchTerm) || itemName.includes(searchTerm);
            })
            .slice(0, 10) // Limit to 10 suggestions
            .map(task => ({
              id: task.id,
              title: task.title,
              scheduledDate: task.date,
              itemName: task.itemId ? getItemById(task.itemId)?.name || 'Unknown Item' : 'No Item'
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
    setOpen(false);
    setSearchValue('');
    setSuggestions([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const shouldShowDropdown = searchValue.trim().length > 0 && (suggestions.length > 0 || error || isLoading);

  return (
    <div className="relative">
      <Popover open={shouldShowDropdown} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => {
                if (searchValue.trim().length > 0) {
                  setOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  setSearchValue('');
                  setSuggestions([]);
                }
              }}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-0 bg-white border border-gray-200 shadow-lg rounded-md z-50" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="max-h-[300px] overflow-y-auto">
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
              <div className="py-1">
                {suggestions.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleSelect(task)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskSearch;


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
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          // Filter tasks based on search query (simulating API call)
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setSearchValue('');
      setSuggestions([]);
    }
  };

  const shouldShowDropdown = searchValue.trim().length > 0 && (suggestions.length > 0 || error || isLoading);

  return (
    <Popover open={open && shouldShowDropdown} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Search tasks"
          className="w-64 justify-start text-left font-normal"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-500">Search tasks…</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
          <CommandInput 
            placeholder="Search tasks…" 
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              if (value.trim().length > 0) {
                setOpen(true);
              }
            }}
            className="border-0 focus:ring-0"
          />
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <CommandItem disabled className="text-center py-4">
                Loading...
              </CommandItem>
            )}
            {error && (
              <CommandItem disabled className="text-center py-2 text-red-600">
                {error}
              </CommandItem>
            )}
            {!isLoading && !error && suggestions.length === 0 && searchValue.trim() && (
              <CommandEmpty>
                No tasks found for "{searchValue}".
              </CommandEmpty>
            )}
            {!isLoading && !error && suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.id}
                    onSelect={() => handleSelect(task)}
                    className="cursor-pointer py-3"
                    role="option"
                    aria-selected={false}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="font-semibold text-sm">{task.title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>on {formatDate(task.scheduledDate)}</span>
                        <span>•</span>
                        <span className="italic">for {task.itemName}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TaskSearch;

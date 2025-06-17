
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
  const { tasks } = useMaintenance();
  const { getItemById } = useItems();

  // Debounce search input
  const debounceSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        if (query.trim().length === 0) {
          setSuggestions([]);
          return;
        }

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
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [tasks, getItemById]
  );

  useEffect(() => {
    const cleanup = debounceSearch(searchValue);
    return cleanup;
  }, [searchValue, debounceSearch]);

  const handleSelect = (task: TaskSuggestion) => {
    onTaskSelect(task);
    setOpen(false);
    setSearchValue('');
    setSuggestions([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Search tasks...</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search tasks..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() ? `No tasks found for "${searchValue}".` : 'Start typing to search tasks...'}
            </CommandEmpty>
            {suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.id}
                    onSelect={() => handleSelect(task)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="font-medium text-sm">{task.title}</div>
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

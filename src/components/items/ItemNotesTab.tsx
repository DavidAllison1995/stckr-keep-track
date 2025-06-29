
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import { Item } from '@/hooks/useSupabaseItems';
import { Plus, Edit, Trash2, Save, X, StickyNote } from 'lucide-react';

interface ItemNotesTabProps {
  item: Item;
}

const ItemNotesTab = ({ item }: ItemNotesTabProps) => {
  const { updateItem } = useSupabaseItems();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(item.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveNote = async () => {
    setIsLoading(true);
    try {
      await updateItem(item.id, { notes: noteText.trim() || null });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Note saved successfully',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNoteText(item.notes || '');
    setIsEditing(false);
  };

  const handleDeleteNote = async () => {
    setIsLoading(true);
    try {
      await updateItem(item.id, { notes: null });
      setNoteText('');
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setNoteText(item.notes || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-white">Notes</h3>
        {!isEditing && (
          <Button 
            onClick={handleStartEditing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {item.notes ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Note
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </>
            )}
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="border border-gray-700 bg-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your notes about this item..."
                className="min-h-[150px] resize-none bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNote}
                  disabled={isLoading || noteText.trim() === item.notes}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : item.notes ? (
        <Card className="border border-gray-700 bg-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-purple-500/30">
                    <StickyNote className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleStartEditing}
                  disabled={isLoading}
                  className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30 border-red-600/50 hover:border-red-500"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Note</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteNote}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Note
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/50 rounded-full flex items-center justify-center border border-purple-700/50">
            <StickyNote className="w-8 h-8 text-purple-400" />
          </div>
          <h4 className="font-medium text-white mb-2">No notes yet</h4>
          <p className="text-gray-400 mb-6">
            Add notes about this item's condition, location, or any other important details.
          </p>
          <Button 
            onClick={handleStartEditing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Note
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemNotesTab;

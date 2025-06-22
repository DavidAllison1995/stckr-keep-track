
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
        <h3 className="font-semibold text-lg">Notes</h3>
        {!isEditing && (
          <Button onClick={handleStartEditing}>
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
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your notes about this item..."
                className="min-h-[150px] resize-none"
                disabled={isLoading}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNote}
                  disabled={isLoading || noteText.trim() === item.notes}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : item.notes ? (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <StickyNote className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-800 whitespace-pre-wrap break-words leading-relaxed">
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
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteNote}
                        className="bg-red-600 hover:bg-red-700"
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
          <StickyNote className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">No notes yet</h4>
          <p className="text-gray-600 mb-6">
            Add notes about this item's condition, location, or any other important details.
          </p>
          <Button onClick={handleStartEditing}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Note
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemNotesTab;

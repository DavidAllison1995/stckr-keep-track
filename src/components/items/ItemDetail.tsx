import { useState } from 'react';
import { ArrowLeft, Calendar, FileText, Settings, Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Upload, Download, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useToast } from '@/hooks/use-toast';
import ItemForm from './ItemForm';
import MaintenanceTaskForm from '../maintenance/MaintenanceTaskForm';
import TaskEditDialog from '../maintenance/TaskEditDialog';
import DocumentViewer from './DocumentViewer';
import { Item } from '@/hooks/useSupabaseItems';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
  defaultTab?: string;
  highlightTaskId?: string;
}

const ItemDetail = ({ item, onClose, defaultTab = 'maintenance', highlightTaskId }: ItemDetailProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { 
    tasks, 
    deleteTask, 
    markTaskComplete, 
    getTasksByItem 
  } = useSupabaseMaintenance();
  const { updateItem, uploadDocument, deleteDocument } = useSupabaseItems();
  const { toast } = useToast();

  // Get tasks for this item
  const itemTasks = getTasksByItem(item.id, true);

  // Separate completed and pending tasks
  const completedTasks = itemTasks.filter(task => task.status === 'completed');
  const pendingTasks = itemTasks.filter(task => task.status !== 'completed');

  // Get documents and notes from item data
  const documents = Array.isArray(item.documents) ? item.documents : [];
  const notes = item.notes || '';

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await markTaskComplete(taskId);
      toast({
        title: "Success",
        description: "Task marked as complete",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateItem(item.id, { notes: newNote });
      setIsAddingNote(false);
      setNewNote('');
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (no size limit)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('Starting upload process for file:', file.name, 'Size:', file.size, 'bytes');
      
      // Upload file to Supabase Storage
      const documentUrl = await uploadDocument(item.id, file);
      
      // Create document object
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : 'pdf',
        url: documentUrl,
        uploadDate: new Date().toISOString()
      };

      console.log('Created document object:', newDocument);

      // Update item with new document
      const updatedDocuments = [...documents, newDocument];
      console.log('Updating item with documents:', updatedDocuments);
      
      await updateItem(item.id, { documents: updatedDocuments });
      
      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });
      
      console.log('Upload completed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const documentToDelete = documents.find(doc => doc.id === documentId);
      if (documentToDelete) {
        console.log('Deleting document:', documentToDelete);
        
        // Delete from storage
        await deleteDocument(documentToDelete.url);
        
        // Update item documents list
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);
        await updateItem(item.id, { documents: updatedDocuments });
        
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${doc.name} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const getTaskStatusInfo = (task: MaintenanceTask) => {
    const now = new Date();
    const taskDate = new Date(task.date);
    const diffInDays = Math.ceil((taskDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Completed',
        variant: 'default' as const
      };
    }

    if (diffInDays < 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: `${Math.abs(diffInDays)} days overdue`,
        variant: 'destructive' as const
      };
    } else if (diffInDays <= 14) {
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: diffInDays === 0 ? 'Due today' : `Due in ${diffInDays} days`,
        variant: 'secondary' as const
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: `Due in ${diffInDays} days`,
        variant: 'default' as const
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTaskCard = (task: MaintenanceTask, isCompleted = false) => {
    const statusInfo = getTaskStatusInfo(task);
    const StatusIcon = statusInfo.icon;
    const isHighlighted = task.id === highlightTaskId;

    return (
      <Card 
        key={task.id} 
        className={`transition-all duration-200 hover:shadow-md ${
          isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </h4>
                <Badge variant={statusInfo.variant} className="text-xs">
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.text}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(task.date)}
                </span>
                {task.recurrence !== 'none' && (
                  <Badge variant="outline" className="text-xs">
                    Repeats {task.recurrence}
                  </Badge>
                )}
              </div>

              {task.notes && (
                <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.notes}
                </p>
              )}
            </div>

            {!isCompleted && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTask(task)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteTask(task.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isEditMode) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsEditMode(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Item
          </button>
        </div>
        <ItemForm
          item={item}
          onSuccess={() => {
            setIsEditMode(false);
            toast({
              title: "Success",
              description: "Item updated successfully",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Items
        </button>
        <Button
          variant="outline"
          onClick={() => setIsEditMode(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Edit Item
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Item Header */}
        <div className="text-center space-y-4">
          {item.photo_url && (
            <div className="mx-auto w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={item.photo_url} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              {item.room && <Badge variant="outline">{item.room}</Badge>}
            </div>
          </div>
        </div>

        {/* Item Information */}
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {item.purchase_date && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Purchase Date</h4>
                  <p className="text-gray-600">{formatDate(item.purchase_date)}</p>
                </div>
              )}
              
              {item.warranty_date && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Warranty Until</h4>
                  <p className="text-gray-600">{formatDate(item.warranty_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Maintenance
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {documents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Tasks</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="flex items-center gap-2"
                >
                  {showCompletedTasks ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCompletedTasks ? 'Hide' : 'View'} Completed Tasks
                  {completedTasks.length > 0 && (
                    <Badge variant="outline" className="ml-1">
                      {completedTasks.length}
                    </Badge>
                  )}
                </Button>
                <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Maintenance Task</DialogTitle>
                    </DialogHeader>
                    <MaintenanceTaskForm
                      itemId={item.id}
                      onSuccess={() => {
                        setShowTaskForm(false);
                        toast({
                          title: "Success",
                          description: "Maintenance task added successfully",
                        });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Pending Tasks */}
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No maintenance tasks</h4>
                  <p className="text-gray-600 mb-4">Create your first maintenance task for this item.</p>
                  <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => renderTaskCard(task))}
              </div>
            )}

            {/* Completed Tasks (when toggled) */}
            {showCompletedTasks && (
              <div className="space-y-4 mt-6">
                <h4 className="text-md font-semibold text-gray-900 border-t pt-4">Completed Tasks</h4>
                {completedTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No completed tasks yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map(task => renderTaskCard(task, true))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  disabled={isUploading}
                />
                <Button asChild className="flex items-center gap-2" disabled={isUploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </label>
                </Button>
              </div>
            </div>

            {documents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No documents</h4>
                  <p className="text-gray-600 mb-4">Upload documents like manuals, receipts, or warranties.</p>
                  <Button asChild disabled={isUploading}>
                    <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </label>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="relative">
                    <DocumentViewer 
                      document={doc} 
                      onDownload={() => handleDownloadDocument(doc)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{doc.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNote(!isAddingNote);
                  setNewNote(notes);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isAddingNote ? 'Cancel' : 'Edit Notes'}
              </Button>
            </div>

            {isAddingNote ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add your notes about this item..."
                    className="min-h-32"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes}>Save Notes</Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  {notes ? (
                    <div className="whitespace-pre-wrap text-gray-700">{notes}</div>
                  ) : (
                    <div className="text-center py-8">
                      <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h4>
                      <p className="text-gray-600 mb-4">Add notes about maintenance, usage, or important details.</p>
                      <Button onClick={() => setIsAddingNote(true)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Add Notes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSuccess={() => {
          setEditingTask(null);
          toast({
            title: "Success",
            description: "Task updated successfully",
          });
        }}
      />
    </div>
  );
};

export default ItemDetail;

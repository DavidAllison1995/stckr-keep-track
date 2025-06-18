
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Check, Trash2, Upload } from 'lucide-react';
import { Item, useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance, MaintenanceTask } from '@/hooks/useSupabaseMaintenance';
import { useToast } from '@/hooks/use-toast';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import TaskEditForm from '@/components/maintenance/TaskEditForm';
import ItemForm from './ItemForm';
import { getIconComponent } from '@/components/icons';
import RecurringTaskDeleteDialog from '@/components/maintenance/RecurringTaskDeleteDialog';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
  defaultTab?: string;
  highlightTaskId?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

const ItemDetail = ({ item, onClose, defaultTab = 'details', highlightTaskId }: ItemDetailProps) => {
  const { getTasksByItem, markTaskComplete, deleteTask } = useSupabaseMaintenance();
  const { updateItem, uploadDocument, deleteDocument } = useSupabaseItems();
  const { toast } = useToast();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [notes, setNotes] = useState(item.notes || '');
  const [documents, setDocuments] = useState<Document[]>((item.documents as Document[]) || []);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [recurringDeleteDialogOpen, setRecurringDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<MaintenanceTask | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  // Get tasks based on the toggle state
  const upcomingTasks = getTasksByItem(item.id, false); // Exclude completed
  const completedTasks = getTasksByItem(item.id, true).filter(task => task.status === 'completed'); // Only completed
  const displayTasks = showCompleted ? completedTasks : upcomingTasks;
  
  const editingTask = editingTaskId ? displayTasks.find(task => task.id === editingTaskId) : null;

  // Effect to handle tab switching and highlighting
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Effect to scroll to highlighted task
  useEffect(() => {
    if (highlightTaskId && activeTab === 'maintenance') {
      setTimeout(() => {
        const element = document.getElementById(`task-${highlightTaskId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-blue-100', 'border-blue-300');
          setTimeout(() => {
            element.classList.remove('bg-blue-100', 'border-blue-300');
          }, 2000);
        }
      }, 100);
    }
  }, [highlightTaskId, activeTab]);

  // Update local state when item changes
  useEffect(() => {
    setNotes(item.notes || '');
    setDocuments((item.documents as Document[]) || []);
  }, [item]);

  const IconComponent = getIconComponent(item.icon_id || 'box');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingFile(true);
    try {
      const publicUrl = await uploadDocument(item.id, file);
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: publicUrl,
        uploadDate: new Date().toISOString(),
      };
      
      const updatedDocuments = [...documents, newDoc];
      setDocuments(updatedDocuments);
      
      // Save to item data
      await updateItem(item.id, { documents: updatedDocuments as any });
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      await deleteDocument(doc.url);
      
      const updatedDocuments = documents.filter(d => d.id !== doc.id);
      setDocuments(updatedDocuments);
      
      // Save to item data
      await updateItem(item.id, { documents: updatedDocuments as any });
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateItem(item.id, { notes });
      toast({
        title: 'Success',
        description: 'Notes saved successfully',
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleTaskEditSuccess = () => {
    setEditingTaskId(null);
  };

  const handleItemEditSuccess = () => {
    setIsEditItemModalOpen(false);
  };

  const handleMarkComplete = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      markTaskComplete(taskId);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleDeleteTask = async (task: MaintenanceTask) => {
    console.log('Deleting task:', task);
    console.log('Task recurrence:', task.recurrence);
    console.log('Task parent_task_id:', task.parent_task_id);
    
    // Check if this is a recurring task (either has recurrence set or is a child of a recurring task)
    const isRecurring = task.recurrence !== 'none' || task.parent_task_id;
    
    console.log('Is recurring?', isRecurring);
    
    if (isRecurring) {
      setTaskToDelete(task);
      setRecurringDeleteDialogOpen(true);
    } else {
      setDeletingTaskId(task.id);
      try {
        deleteTask(task.id, 'single');
      } finally {
        setDeletingTaskId(null);
      }
    }
  };

  const handleDeleteSingle = () => {
    if (taskToDelete) {
      setDeletingTaskId(taskToDelete.id);
      try {
        deleteTask(taskToDelete.id, 'single');
      } finally {
        setDeletingTaskId(null);
        setTaskToDelete(null);
      }
    }
  };

  const handleDeleteAll = () => {
    if (taskToDelete) {
      setDeletingTaskId(taskToDelete.id);
      try {
        deleteTask(taskToDelete.id, 'all');
      } finally {
        setDeletingTaskId(null);
        setTaskToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          ← Back
        </Button>
        <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Edit Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <ItemForm 
              item={item}
              onSuccess={handleItemEditSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Item Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.photo_url ? (
                <img 
                  src={item.photo_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <IconComponent className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <h1 className="text-2xl font-bold">{item.name}</h1>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">{item.category}</Badge>
                {item.room && <Badge variant="outline">{item.room}</Badge>}
              </div>
              {item.description && (
                <p className="text-gray-600 text-sm">{item.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs component */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.purchase_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                  <p className="text-sm">{new Date(item.purchase_date).toLocaleDateString()}</p>
                </div>
              )}
              {item.warranty_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Warranty Until</label>
                  <p className="text-sm">{new Date(item.warranty_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">QR Code</label>
                <p className="text-sm text-gray-500">
                  {item.qr_code_id ? `Assigned: ${item.qr_code_id}` : 'No QR code assigned'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Tasks</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? 'View Upcoming Tasks' : 'View Completed Tasks'}
                  </Button>
                  {!showCompleted && (
                    <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">+ Add Task</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Maintenance Task</DialogTitle>
                        </DialogHeader>
                        <MaintenanceTaskForm 
                          itemId={item.id}
                          onSuccess={() => setIsAddTaskModalOpen(false)} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {displayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔧</div>
                  <p className="text-gray-600 mb-4">
                    {showCompleted ? 'No completed maintenance tasks' : 'No pending maintenance tasks'}
                  </p>
                  {!showCompleted && (
                    <Button onClick={() => setIsAddTaskModalOpen(true)}>
                      Add First Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.map((task) => (
                    <div 
                      key={task.id} 
                      id={`task-${task.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        highlightTaskId === task.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-blue-500' :
                        task.status === 'overdue' ? 'bg-red-500' :
                        task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {task.title}
                          {(task.recurrence !== 'none' || task.parent_task_id) && (
                            <Badge variant="outline" className="text-xs">
                              {task.parent_task_id ? 'Recurring' : task.recurrence}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {showCompleted ? 'Completed: ' : 'Due: '}{new Date(task.date).toLocaleDateString()}
                        </div>
                        {task.notes && (
                          <div className="text-sm text-gray-500">{task.notes}</div>
                        )}
                      </div>
                      <Badge variant={
                        task.status === 'completed' ? 'default' :
                        task.status === 'overdue' ? 'destructive' :
                        task.status === 'due_soon' ? 'secondary' : 'default'
                      }>
                        {task.status === 'completed' ? 'Completed' :
                         task.status === 'overdue' ? 'Overdue' :
                         task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                      </Badge>
                      
                      {showCompleted ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task)}
                          disabled={deletingTaskId === task.id}
                          aria-label="Delete completed task"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkComplete(task.id)}
                            disabled={completingTaskId === task.id}
                            aria-label="Mark task complete"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task)}
                            disabled={deletingTaskId === task.id}
                            aria-label="Delete task"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Edit Modal */}
          <Dialog open={!!editingTaskId} onOpenChange={() => setEditingTaskId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Maintenance Task</DialogTitle>
              </DialogHeader>
              {editingTask && (
                <TaskEditForm
                  task={editingTask}
                  onSuccess={handleTaskEditSuccess}
                  onCancel={() => setEditingTaskId(null)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Recurring Task Delete Dialog */}
          <RecurringTaskDeleteDialog
            task={taskToDelete}
            open={recurringDeleteDialogOpen}
            onOpenChange={setRecurringDeleteDialogOpen}
            onDeleteSingle={handleDeleteSingle}
            onDeleteAll={handleDeleteAll}
          />
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Item Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this item..."
                  rows={6}
                />
              </div>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents & Files</CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    disabled={isUploadingFile}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploadingFile}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingFile ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-600 mb-4">No documents uploaded yet</p>
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploadingFile}
                  >
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {doc.type.startsWith('image/') ? '🖼️' : '📄'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-600">
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Edit Modal */}
      <Dialog open={!!editingTaskId} onOpenChange={() => setEditingTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Maintenance Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskEditForm
              task={editingTask}
              onSuccess={handleTaskEditSuccess}
              onCancel={() => setEditingTaskId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemDetail;

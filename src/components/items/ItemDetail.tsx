
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Item } from '@/hooks/useItems';
import { useMaintenance } from '@/hooks/useMaintenance';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';

interface ItemDetailProps {
  item: Item;
  onClose: () => void;
}

const ItemDetail = ({ item, onClose }: ItemDetailProps) => {
  const { getTasksByItem } = useMaintenance();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  const itemTasks = getTasksByItem(item.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          ← Back
        </Button>
        <Button variant="outline" size="sm">
          Edit Item
        </Button>
      </div>

      {/* Item Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.photoUrl ? (
                <img 
                  src={item.photoUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.purchaseDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                  <p className="text-sm">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                </div>
              )}
              {item.warrantyDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Warranty Until</label>
                  <p className="text-sm">{new Date(item.warrantyDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">QR Code</label>
                <p className="text-sm text-gray-500">
                  {item.qrCodeId ? `Assigned: ${item.qrCodeId}` : 'No QR code assigned'}
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
              </div>
            </CardHeader>
            <CardContent>
              {itemTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔧</div>
                  <p className="text-gray-600 mb-4">No maintenance tasks yet</p>
                  <Button onClick={() => setIsAddTaskModalOpen(true)}>
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'overdue' ? 'bg-red-500' :
                        task.status === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          Due: {new Date(task.date).toLocaleDateString()}
                        </div>
                        {task.notes && (
                          <div className="text-sm text-gray-500">{task.notes}</div>
                        )}
                      </div>
                      <Badge variant={
                        task.status === 'overdue' ? 'destructive' :
                        task.status === 'due_soon' ? 'secondary' : 'default'
                      }>
                        {task.status === 'overdue' ? 'Overdue' :
                         task.status === 'due_soon' ? 'Due Soon' : 'Up to Date'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-600 mb-4">No documents uploaded yet</p>
                <Button variant="outline">Upload Document</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItemDetail;

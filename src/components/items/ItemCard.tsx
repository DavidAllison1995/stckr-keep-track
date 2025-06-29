
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Item } from '@/hooks/useSupabaseItems';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { getIconComponent } from '@/components/icons';
import { QrCode, Download, Clock, AlertTriangle, CheckCircle2, Trash2, ChevronRight, Check, X } from 'lucide-react';
import ItemDetail from './ItemDetail';
import ItemForm from './ItemForm';
import QRCode from 'qrcode';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

const ItemCard = ({ item, onClick }: ItemCardProps) => {
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  
  const { getTasksByItem, tasks } = useSupabaseMaintenance();
  const { deleteItem } = useSupabaseItems();
  const itemTasks = getTasksByItem(item.id, false); // Don't include completed tasks
  
  // Properly categorize tasks
  const pendingTasks = itemTasks.filter(task => task.status === 'pending');
  const dueSoonTasks = itemTasks.filter(task => task.status === 'due_soon');
  const overdueTasks = itemTasks.filter(task => task.status === 'overdue');
  const inProgressTasks = itemTasks.filter(task => task.status === 'in_progress');

  // Debug logging
  useEffect(() => {
    console.log(`ItemCard ${item.name} - All tasks:`, tasks.length);
    console.log(`ItemCard ${item.name} - Item tasks:`, itemTasks.length);
    console.log(`ItemCard ${item.name} - Tasks for item ${item.id}:`, itemTasks);
    console.log(`ItemCard ${item.name} - Task breakdown:`, {
      pending: pendingTasks.length,
      dueSoon: dueSoonTasks.length, 
      overdue: overdueTasks.length,
      inProgress: inProgressTasks.length
    });
  }, [tasks, itemTasks, item.name, item.id, pendingTasks.length, dueSoonTasks.length, overdueTasks.length, inProgressTasks.length]);

  const IconComponent = getIconComponent(item.icon_id || 'box');
  
  // Generate short code from QR code ID
  const shortCode = item.qr_code_id ? `B${item.qr_code_id.slice(-4).toUpperCase()}` : null;

  // Generate QR code thumbnail on mount
  useEffect(() => {
    if (item.qr_code_id) {
      const generateQrCode = async () => {
        try {
          const dataUrl = await QRCode.toDataURL(`https://stckr.io/qr/${item.qr_code_id}`, { 
            width: 128, 
            margin: 0 
          });
          setQrDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };
      generateQrCode();
    }
  }, [item.qr_code_id]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if user is dragging
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    }
  };

  const handleTasksClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('handleTasksClick called for item:', item.id);
    console.log('Current window location:', window.location.href);
    const targetUrl = `/items/${item.id}?tab=tasks`;
    console.log('Navigating to:', targetUrl);
    navigate(targetUrl);
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItem(item.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const downloadQrCode = async () => {
    if (!item.qr_code_id || !shortCode) return;
    
    try {
      // Generate a larger QR code for download
      const downloadDataUrl = await QRCode.toDataURL(`https://stckr.io/qr/${item.qr_code_id}`, { 
        width: 512, 
        margin: 1 
      });
      
      const a = document.createElement('a');
      a.href = downloadDataUrl;
      a.download = `qr-${shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const getTaskIcon = (count: number, type: 'overdue' | 'due_soon' | 'pending' | 'in_progress') => {
    if (count === 0) return null;
    
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'due_soon':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'pending':
        return <CheckCircle2 className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer select-none h-full flex flex-col" 
        onClick={handleCardClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Compact Image/Icon Section */}
          <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center border-b border-gray-100">
            {item.photo_url ? (
              <img 
                src={item.photo_url} 
                alt={item.name} 
                className="w-full h-full object-contain" 
                draggable={false}
              />
            ) : (
              <IconComponent className="w-12 h-12 text-gray-600" />
            )}
          </div>

          {/* Compact Content Section */}
          <div className="p-3 flex-1 flex flex-col space-y-2 overflow-hidden">
            {/* Title */}
            <h3 className="font-semibold text-base line-clamp-1 text-gray-900">{item.name}</h3>
            
            {/* Tags Section */}
            <div className="flex items-center gap-1 flex-wrap min-h-[16px]">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-1 py-0 h-5">
                {item.category}
              </Badge>
              {item.room && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1 py-0 h-5">
                  {item.room}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`text-xs px-1 py-0 h-5 ${item.qr_code_id ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
              >
                {item.qr_code_id ? (
                  <>
                    <Check className="w-2 h-2 mr-1" />
                    QR
                  </>
                ) : (
                  <>
                    <X className="w-2 h-2 mr-1" />
                    No QR
                  </>
                )}
              </Badge>
            </div>

            {/* Compact Description */}
            {item.description && (
              <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
            )}

            {/* Compact Task Status Section */}
            {itemTasks.length > 0 && (
              <div 
                className="bg-gray-50 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition-colors border"
                onClick={handleTasksClick}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Maintenance</span>
                  <ChevronRight className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {overdueTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {getTaskIcon(overdueTasks.length, 'overdue')}
                      <span className="text-red-600">{overdueTasks.length}</span>
                    </div>
                  )}
                  {dueSoonTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {getTaskIcon(dueSoonTasks.length, 'due_soon')}
                      <span className="text-yellow-600">{dueSoonTasks.length}</span>
                    </div>
                  )}
                  {inProgressTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {getTaskIcon(inProgressTasks.length, 'in_progress')}
                      <span className="text-blue-600">{inProgressTasks.length}</span>
                    </div>
                  )}
                  {pendingTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {getTaskIcon(pendingTasks.length, 'pending')}
                      <span className="text-gray-600">{pendingTasks.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compact Dates Section */}
            {(item.purchase_date || item.warranty_date) && (
              <div className="bg-gray-50 rounded-md p-2 border">
                <div className="text-xs text-gray-500 space-y-1">
                  {item.purchase_date && (
                    <div className="flex justify-between">
                      <span>Purchased:</span>
                      <span>{new Date(item.purchase_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.warranty_date && (
                    <div className="flex justify-between">
                      <span>Warranty:</span>
                      <span>{new Date(item.warranty_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compact Actions */}
            <div className="flex gap-1 mt-auto pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/items/${item.id}`);
                }}
              >
                View
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                      All maintenance tasks and documents associated with this item will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteItem}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Item
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code for {item.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center space-y-4">
            {qrDataUrl && (
              <>
                <img 
                  src={qrDataUrl} 
                  alt="Full QR code" 
                  className="w-64 h-64 border rounded-lg"
                />
                <div className="text-center">
                  <div className="font-medium">Sticker {shortCode}</div>
                  <div className="text-sm text-gray-500">Scan to view item details</div>
                </div>
                <Button 
                  onClick={downloadQrCode}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <ItemDetail 
            item={item} 
            onClose={() => setIsDetailModalOpen(false)}
            defaultTab="tasks"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            item={item}
            onSuccess={() => setIsEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemCard;

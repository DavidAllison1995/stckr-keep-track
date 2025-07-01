

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
import TwemojiIcon from '@/components/icons/TwemojiIcon';
import NotoEmojiIcon from '@/components/icons/NotoEmojiIcon';
import { QrCode, Download, Clock, AlertTriangle, CheckCircle2, Trash2, ChevronRight, Check, X, Eye, Edit } from 'lucide-react';
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
  const itemTasks = getTasksByItem(item.id, false);
  
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

  const iconEmoji = item.icon_id || '📦';
  
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
        return <AlertTriangle className="w-3 h-3" />;
      case 'due_soon':
        return <Clock className="w-3 h-3" />;
      case 'in_progress':
        return <Clock className="w-3 h-3" />;
      case 'pending':
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (type: 'overdue' | 'due_soon' | 'pending' | 'in_progress') => {
    switch (type) {
      case 'overdue':
        return 'status-badge status-overdue';
      case 'due_soon':
        return 'status-badge status-due-soon';
      case 'in_progress':
        return 'status-badge status-in-progress';
      case 'pending':
        return 'status-badge status-pending';
      default:
        return 'status-badge status-pending';
    }
  };

  return (
    <>
      <Card 
        variant="elevated"
        className="cursor-pointer select-none h-full flex flex-col group bg-gray-800/50 border-gray-700 shadow-medium hover:shadow-large hover:border-purple-500/30 transition-all duration-200 hover:-translate-y-0.5" 
        onClick={handleCardClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Enhanced Image/Icon Section */}
          <div className="w-full aspect-[3/2] bg-gradient-to-br from-purple-900/20 via-gray-800 to-gray-900 flex items-center justify-center border-b border-gray-700 rounded-t-xl relative overflow-hidden">
            {item.photo_url ? (
              <img 
                src={item.photo_url} 
                alt={item.name} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                draggable={false}
              />
            ) : (
              <div className="flex items-center justify-center p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl transition-transform duration-300 group-hover:scale-110 border border-purple-500/20">
                <NotoEmojiIcon emoji={iconEmoji} className="w-12 h-12" size={48} alt={`${item.name} icon`} />
              </div>
            )}
            
            {/* QR Status Indicator */}
            {item.qr_code_id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-600/20 border border-green-500/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-3 h-3 text-green-400" />
              </div>
            )}
          </div>

          {/* Enhanced Content Section */}
          <div className="p-3 flex-1 flex flex-col space-y-3 overflow-hidden">
            {/* Title */}
            <h3 className="font-semibold text-base line-clamp-1 text-white group-hover:text-purple-400 transition-colors">
              {item.name}
            </h3>
            
            {/* Enhanced Tags Section */}
            <div className="flex items-center gap-1.5 flex-wrap min-h-[20px]">
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs px-2 py-0.5 h-5 font-medium border border-purple-500/30 hover:bg-purple-600/30 transition-colors">
                {item.category}
              </Badge>
              {item.room && (
                <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-300 text-xs px-2 py-0.5 h-5 font-medium border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors">
                  {item.room}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 h-5 font-medium border transition-colors ${
                  item.qr_code_id 
                    ? "bg-green-600/20 text-green-300 border-green-500/30 hover:bg-green-600/30" 
                    : "bg-gray-700/50 text-gray-400 border-gray-600/50 hover:bg-gray-700/70"
                }`}
              >
                {item.qr_code_id ? (
                  <>
                    <Check className="w-2.5 h-2.5 mr-1" />
                    QR
                  </>
                ) : (
                  <>
                    <X className="w-2.5 h-2.5 mr-1" />
                    No QR
                  </>
                )}
              </Badge>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
            )}

            {/* Enhanced Task Status Section */}
            {itemTasks.length > 0 && (
              <div 
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-2.5 cursor-pointer border border-gray-600/50 hover:border-purple-500/30 hover:from-purple-900/20 hover:to-purple-800/20 transition-all duration-200 group/tasks backdrop-blur-sm"
                onClick={handleTasksClick}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-300 group-hover/tasks:text-purple-400 transition-colors">Tasks</span>
                  <ChevronRight className="w-3 h-3 text-purple-400 group-hover/tasks:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {overdueTasks.length > 0 && (
                    <div className={getStatusBadgeClass('overdue')}>
                      {getTaskIcon(overdueTasks.length, 'overdue')}
                      <span>{overdueTasks.length}</span>
                    </div>
                  )}
                  {dueSoonTasks.length > 0 && (
                    <div className={getStatusBadgeClass('due_soon')}>
                      {getTaskIcon(dueSoonTasks.length, 'due_soon')}
                      <span>{dueSoonTasks.length}</span>
                    </div>
                  )}
                  {inProgressTasks.length > 0 && (
                    <div className={getStatusBadgeClass('in_progress')}>
                      {getTaskIcon(inProgressTasks.length, 'in_progress')}
                      <span>{inProgressTasks.length}</span>
                    </div>
                  )}
                  {pendingTasks.length > 0 && (
                    <div className={getStatusBadgeClass('pending')}>
                      {getTaskIcon(pendingTasks.length, 'pending')}
                      <span>{pendingTasks.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Dates Section */}
            {(item.purchase_date || item.warranty_date) && (
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-2.5 border border-gray-600/50 backdrop-blur-sm">
                <div className="text-xs text-gray-400 space-y-1">
                  {item.purchase_date && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-300">Purchased:</span>
                      <span>{new Date(item.purchase_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.warranty_date && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-300">Warranty:</span>
                      <span>{new Date(item.warranty_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Actions */}
            <div className="flex gap-1 mt-auto pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs h-7 gap-1.5 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-300 bg-gray-800/50 border-gray-600 text-gray-300 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/items/${item.id}`);
                }}
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7 px-2 hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/20 p-1 h-7 w-7 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="animate-scale-in bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Item</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                      All maintenance tasks and documents associated with this item will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteItem}
                      className="bg-red-600 hover:bg-red-700 text-white"
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

      {/* Enhanced QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="max-w-sm animate-scale-in bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-purple-400">QR Code for {item.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center space-y-4">
            {qrDataUrl && (
              <>
                <div className="p-4 bg-white rounded-xl shadow-soft border">
                  <img 
                    src={qrDataUrl} 
                    alt="QR code" 
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white">Sticker {shortCode}</div>
                  <div className="text-sm text-gray-400">Scan to view item details</div>
                </div>
                <Button 
                  onClick={downloadQrCode}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-purple-400">{item.name}</DialogTitle>
          </DialogHeader>
          <ItemDetail 
            item={item} 
            onClose={() => setIsDetailModalOpen(false)}
            defaultTab="tasks"
          />
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto animate-scale-in bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-purple-400">Edit Item</DialogTitle>
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

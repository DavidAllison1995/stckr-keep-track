
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Item } from '@/hooks/useSupabaseItems';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { getIconComponent } from '@/components/icons';
import { Calendar, FileText, ChevronDown, ChevronUp, Clock, CheckCircle2, Tag, Home, ShoppingCart, Shield, StickyNote } from 'lucide-react';

interface ItemDetailsTabProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const ItemDetailsTab = ({ item, onTabChange }: ItemDetailsTabProps) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getTasksByItem } = useSupabaseMaintenance();
  const IconComponent = getIconComponent(item.icon_id || 'box');

  // Get active and completed tasks for this item
  const activeTasks = getTasksByItem(item.id, false); // Don't include completed
  const allTasks = getTasksByItem(item.id, true); // Include completed
  const completedTasks = allTasks.filter(task => task.status === 'completed');

  // Calculate next task and recently completed
  const nextTask = activeTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const recentCompleted = completedTasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  const handleNextTaskClick = () => {
    if (nextTask && onTabChange) {
      onTabChange('maintenance');
    }
  };

  const handleRecentCompletedClick = () => {
    if (recentCompleted && onTabChange) {
      onTabChange('maintenance');
    }
  };

  const handleViewAllDocuments = () => {
    if (onTabChange) {
      onTabChange('documents');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Item Photo/Icon */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
              {item.photo_url ? (
                <img 
                  src={item.photo_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-xl" 
                />
              ) : (
                <IconComponent className="w-16 h-16 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Redesigned Basic Information */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="space-y-4 p-6">
            {/* Header Row: Icon + Name */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex-1">{item.name}</h3>
            </div>

            {/* Tag Row: Category & Room */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Tag className="w-3.5 h-3.5" />
                {item.category}
              </div>
              {item.room && (
                <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Home className="w-3.5 h-3.5" />
                  {item.room}
                </div>
              )}
            </div>

            {/* Description Preview */}
            {item.description && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 font-medium mb-1">Description</div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {showMore ? item.description : `${item.description.slice(0, 100)}${item.description.length > 100 ? '...' : ''}`}
                </p>
              </div>
            )}

            {/* Expandable Section */}
            {(item.notes || item.purchase_date || item.warranty_date) && (
              <div className="border-t border-gray-100 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                >
                  <span className="mr-2">
                    {showMore ? 'Show less details' : 'Show more details'}
                  </span>
                  {showMore ? (
                    <ChevronUp className="w-4 h-4 transition-transform duration-150 ease-in-out" />
                  ) : (
                    <ChevronDown className="w-4 h-4 transition-transform duration-150 ease-in-out" />
                  )}
                </Button>

                <div className={`transition-all duration-150 ease-in-out overflow-hidden ${
                  showMore ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Notes Section */}
                    {item.notes && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <StickyNote className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">Notes</span>
                        </div>
                        <p className="text-sm text-amber-700 italic leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    {/* Dates Grid */}
                    {(item.purchase_date || item.warranty_date) && (
                      <div className="grid grid-cols-1 gap-3">
                        {item.purchase_date && (
                          <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-green-800">Purchased</div>
                              <div className="text-sm text-green-700">
                                {new Date(item.purchase_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        {item.warranty_date && (
                          <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-purple-800">Warranty Until</div>
                              <div className="text-sm text-purple-700">
                                {new Date(item.warranty_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Enhanced Maintenance Summary */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-3">
              {/* Next Task Button */}
              <button
                onClick={handleNextTaskClick}
                disabled={!nextTask}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left border ${
                  nextTask
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium opacity-80 mb-1">Next Task</div>
                    <div className="text-sm font-semibold truncate">
                      {nextTask 
                        ? `${new Date(nextTask.date).toLocaleDateString()} – ${nextTask.title}`
                        : 'None scheduled'
                      }
                    </div>
                  </div>
                </div>
                {nextTask && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm">
                    Upcoming
                  </Badge>
                )}
              </button>

              {/* Recently Completed Button */}
              <button
                onClick={handleRecentCompletedClick}
                disabled={!recentCompleted}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left border ${
                  recentCompleted
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium opacity-80 mb-1">Recently Completed</div>
                    <div className="text-sm font-semibold truncate">
                      {recentCompleted 
                        ? `${new Date(recentCompleted.updated_at).toLocaleDateString()} – ${recentCompleted.title}`
                        : 'None completed'
                      }
                    </div>
                  </div>
                </div>
                {recentCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm">
                    Completed
                  </Badge>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {item.documents && item.documents.length > 0 && (
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3 mb-4">
                {item.documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                    {doc.type === 'image' ? (
                      <img 
                        src={doc.url} 
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                onClick={handleViewAllDocuments}
              >
                View All ({item.documents.length})
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsTab;

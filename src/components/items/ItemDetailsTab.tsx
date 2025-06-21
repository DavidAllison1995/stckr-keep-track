
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '@/hooks/useSupabaseItems';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { getIconComponent } from '@/components/icons';
import { Calendar, FileText, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';

interface ItemDetailsTabProps {
  item: Item;
}

const ItemDetailsTab = ({ item }: ItemDetailsTabProps) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
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
    if (nextTask) {
      navigate(`/items/${item.id}`, { state: { highlightTaskId: nextTask.id, activeTab: 'maintenance' } });
    }
  };

  const handleRecentCompletedClick = () => {
    if (recentCompleted) {
      navigate(`/items/${item.id}`, { state: { highlightTaskId: recentCompleted.id, activeTab: 'maintenance' } });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Item Photo/Icon */}
        <Card>
          <CardContent className="p-4">
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              {item.photo_url ? (
                <img 
                  src={item.photo_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <IconComponent className="w-16 h-16 text-gray-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900 leading-relaxed">{item.name}</p>
            </div>
            
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <div className="mt-1">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </div>
              {item.room && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Room</label>
                  <div className="mt-1">
                    <Badge variant="outline">{item.room}</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Show More Section */}
            {(item.notes || item.purchase_date || item.warranty_date) && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  className="p-0 h-auto font-medium text-blue-600"
                >
                  {showMore ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show more
                    </>
                  )}
                </Button>

                {showMore && (
                  <div className="mt-4 space-y-4">
                    {item.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Notes</label>
                        <p className="text-gray-900 mt-1 leading-relaxed">{item.notes}</p>
                      </div>
                    )}
                    {item.purchase_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                        <p className="text-gray-900 mt-1">{new Date(item.purchase_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {item.warranty_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Warranty Until</label>
                        <p className="text-gray-900 mt-1">{new Date(item.warranty_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Enhanced Maintenance Summary */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-700" />
              Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-3">
              {/* Next Task Button */}
              <button
                onClick={handleNextTaskClick}
                disabled={!nextTask}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                  nextTask
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer'
                    : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium opacity-80">Next Task</div>
                    <div className="text-sm font-medium truncate">
                      {nextTask 
                        ? `${new Date(nextTask.date).toLocaleDateString()} – ${nextTask.title}`
                        : 'None scheduled'
                      }
                    </div>
                  </div>
                </div>
                {nextTask && (
                  <div className="ml-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Upcoming
                    </Badge>
                  </div>
                )}
              </button>

              {/* Recently Completed Button */}
              <button
                onClick={handleRecentCompletedClick}
                disabled={!recentCompleted}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                  recentCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer'
                    : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium opacity-80">Recently Completed</div>
                    <div className="text-sm font-medium truncate">
                      {recentCompleted 
                        ? `${new Date(recentCompleted.updated_at).toLocaleDateString()} – ${recentCompleted.title}`
                        : 'None completed'
                      }
                    </div>
                  </div>
                </div>
                {recentCompleted && (
                  <div className="ml-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Completed
                    </Badge>
                  </div>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {item.documents && item.documents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3 mb-4">
                {item.documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {doc.type === 'image' ? (
                      <img 
                        src={doc.url} 
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
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


import { useState } from 'react';
import { Item } from '@/hooks/useSupabaseItems';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { getIconComponent } from '@/components/icons';
import { Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface ItemDetailsTabProps {
  item: Item;
}

const ItemDetailsTab = ({ item }: ItemDetailsTabProps) => {
  const [showMore, setShowMore] = useState(false);
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
        {/* Maintenance Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Next Task: </span>
              <span className="text-sm text-gray-900">
                {nextTask 
                  ? `${new Date(nextTask.date).toLocaleDateString()} – ${nextTask.title}`
                  : 'None'
                }
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Recently Completed: </span>
              <span className="text-sm text-gray-900">
                {recentCompleted 
                  ? `${new Date(recentCompleted.updated_at).toLocaleDateString()} – ${recentCompleted.title}`
                  : 'None'
                }
              </span>
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

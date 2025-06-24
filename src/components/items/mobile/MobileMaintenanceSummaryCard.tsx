
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  date: string;
  status: string;
  updated_at: string;
}

interface MobileMaintenanceSummaryCardProps {
  nextTask?: Task;
  recentCompleted?: Task;
  onTabChange?: (tab: string) => void;
}

const MobileMaintenanceSummaryCard = ({ 
  nextTask, 
  recentCompleted, 
  onTabChange 
}: MobileMaintenanceSummaryCardProps) => {
  const handleViewAllTasks = () => {
    if (onTabChange) {
      onTabChange('tasks');
    }
  };

  if (!nextTask && !recentCompleted) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-gray-900">
            <Calendar className="w-4 h-4 text-blue-600" />
            Maintenance
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewAllTasks}
            className="text-xs h-7 px-2"
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextTask && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">{nextTask.title}</h4>
                <p className="text-xs text-gray-600">
                  Due: {new Date(nextTask.date).toLocaleDateString()}
                </p>
              </div>
              <Badge className={`text-xs ${getStatusColor(nextTask.status)}`}>
                {nextTask.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        {recentCompleted && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">{recentCompleted.title}</h4>
                <p className="text-xs text-gray-600">
                  Completed: {new Date(recentCompleted.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMaintenanceSummaryCard;

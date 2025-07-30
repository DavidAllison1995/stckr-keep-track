
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

  const handleNextTaskClick = () => {
    if (onTabChange) {
      onTabChange('tasks');
    }
  };

  const handleRecentCompletedClick = () => {
    if (onTabChange) {
      onTabChange('tasks');
    }
  };

  if (!nextTask && !recentCompleted) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-900/50 text-red-300 border-red-600/50';
      case 'due_soon': return 'bg-amber-900/50 text-amber-300 border-amber-600/50';
      case 'in_progress': return 'bg-purple-900/50 text-purple-300 border-purple-600/50';
      default: return 'bg-gray-800/50 text-gray-300 border-gray-600/50';
    }
  };

  return (
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-purple-400" />
            Maintenance
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewAllTasks}
            className="text-xs h-7 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextTask && (
          <button 
            onClick={handleNextTaskClick}
            className="w-full bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 hover:bg-amber-900/30 transition-colors text-left"
          >
            <div className="flex items-start gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{nextTask.title}</h4>
                <p className="text-xs text-gray-300">
                  Due: {new Date(nextTask.date).toLocaleDateString()}
                </p>
              </div>
              <Badge className={`text-xs ${getStatusColor(nextTask.status)}`}>
                {nextTask.status.replace('_', ' ')}
              </Badge>
            </div>
          </button>
        )}

        {recentCompleted && (
          <button 
            onClick={handleRecentCompletedClick}
            className="w-full bg-green-900/20 border border-green-600/30 rounded-lg p-3 hover:bg-green-900/30 transition-colors text-left"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{recentCompleted.title}</h4>
                <p className="text-xs text-gray-300">
                  Completed: {new Date(recentCompleted.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMaintenanceSummaryCard;

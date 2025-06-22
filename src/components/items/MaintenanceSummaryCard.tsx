
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/useSupabaseMaintenance';

interface MaintenanceSummaryCardProps {
  nextTask: MaintenanceTask | undefined;
  recentCompleted: MaintenanceTask | undefined;
  onTabChange?: (tab: string) => void;
}

const MaintenanceSummaryCard = ({ nextTask, recentCompleted, onTabChange }: MaintenanceSummaryCardProps) => {
  const handleMaintenanceSummaryClick = () => {
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

  return (
    <Card className="shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={handleMaintenanceSummaryClick}>
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
            onClick={(e) => {
              e.stopPropagation();
              handleNextTaskClick();
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              handleRecentCompletedClick();
            }}
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
  );
};

export default MaintenanceSummaryCard;


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
    <Card variant="elevated" className="shadow-soft border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Calendar className="w-5 h-5 text-purple-400" />
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
                ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-600/50 text-amber-200 hover:from-amber-900/50 hover:to-orange-900/50 hover:border-amber-500/70 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer shadow-sm'
                : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-amber-900/50 rounded-lg flex items-center justify-center border border-amber-600/50">
                <Clock className="w-4 h-4 text-amber-400" />
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
              <Badge className="bg-amber-900/50 text-amber-200 border-amber-600/50 shadow-sm">
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
                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-600/50 text-green-200 hover:from-green-900/50 hover:to-emerald-900/50 hover:border-green-500/70 focus:outline-none focus:ring-2 focus:ring-green-400/50 cursor-pointer shadow-sm'
                : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center border border-green-600/50">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
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
              <Badge className="bg-green-900/50 text-green-200 border-green-600/50 shadow-sm">
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

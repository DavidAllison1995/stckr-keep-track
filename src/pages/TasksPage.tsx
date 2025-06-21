
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { CheckCircle, Clock, AlertTriangle, Calendar, Plus } from 'lucide-react';

const TasksPage = () => {
  const { tasks } = useSupabaseMaintenance();

  // Filter tasks by status (excluding completed tasks from active counts)
  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const pendingTasks = activeTasks.filter(task => task.status === 'pending');
  const dueSoonTasks = activeTasks.filter(task => task.status === 'due_soon');
  const overdueTasks = activeTasks.filter(task => task.status === 'overdue');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const statusCards = [
    {
      title: 'Up to Date',
      count: pendingTasks.length,
      description: 'Tasks due in 14+ days',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/tasks/up-to-date'
    },
    {
      title: 'Due Soon',
      count: dueSoonTasks.length,
      description: 'Tasks due within 14 days',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/tasks/due-soon'
    },
    {
      title: 'Overdue',
      count: overdueTasks.length,
      description: 'Tasks past due date',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/tasks/overdue'
    },
    {
      title: 'Completed',
      count: completedTasks.length,
      description: 'Tasks that have been completed',
      icon: CheckCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      link: '/tasks/completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks Overview</h1>
                <p className="text-gray-600">Manage your maintenance tasks</p>
              </div>
              <Link to="/maintenance">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </Link>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statusCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.title} to={card.link}>
                    <Card className={`${card.bgColor} border-0 hover:shadow-lg transition-shadow cursor-pointer`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Icon className={`w-8 h-8 ${card.color}`} />
                          <span className={`text-3xl font-bold ${card.color}`}>
                            {card.count}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {card.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/maintenance">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Task
                    </Button>
                  </Link>
                  <Link to="/tasks">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Active Tasks
                    </Button>
                  </Link>
                  <Link to="/tasks/completed">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View Completed Tasks
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

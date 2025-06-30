
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Bell, Wrench } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Your Command Centre
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Never miss another renewal again. Track everything important from one organised dashboard with smart reminders and instant access to all your documents.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
            {/* Browser chrome */}
            <div className="bg-gray-800 px-6 py-4 flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-1 flex-1 max-w-md">
                <span className="text-gray-300 text-sm">stckr.app/dashboard</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-8 bg-gray-900">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome back! Here's what needs your attention.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-amber-900/30 border-amber-600/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-300 text-sm font-medium">Due Soon</p>
                        <p className="text-2xl font-bold text-white">3</p>
                      </div>
                      <Bell className="h-8 w-8 text-amber-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/30 border-blue-600/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-sm font-medium">Documents</p>
                        <p className="text-2xl font-bold text-white">47</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-900/30 border-purple-600/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-300 text-sm font-medium">Tasks</p>
                        <p className="text-2xl font-bold text-white">12</p>
                      </div>
                      <Wrench className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-900/30 border-green-600/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 text-sm font-medium">Up to Date</p>
                        <p className="text-2xl font-bold text-white">84</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Items</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🚗</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Ford Focus</p>
                          <p className="text-gray-400 text-sm">Added 2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🔧</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Bosch Drill</p>
                          <p className="text-gray-400 text-sm">Added 1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Car MOT</p>
                          <p className="text-amber-400 text-sm">Due in 2 weeks</p>
                        </div>
                        <div className="px-3 py-1 bg-amber-900/50 text-amber-300 rounded-full text-xs">
                          Due Soon
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Home Insurance</p>
                          <p className="text-gray-400 text-sm">Due in 3 months</p>
                        </div>
                        <div className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                          Pending
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;

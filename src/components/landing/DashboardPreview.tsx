
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Bell, Wrench, Package, QrCode } from 'lucide-react';

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
              {/* Enhanced Header with brand styling */}
              <div className="text-center mb-12 pt-6">
                <div className="inline-flex items-center gap-3 mb-4 px-6 py-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    👋 Welcome back,{' '}
                    <span className="text-purple-400 bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                      Sarah!
                    </span>
                  </h1>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  Ready to stick with it? Let's manage your space.
                </p>
              </div>

              {/* Main Grid Layout */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - Recent Items */}
                <div className="lg:col-span-2">
                  <Card className="shadow-xl border-gray-800 bg-gray-900">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-purple-400" />
                          <span className="text-white text-xl font-semibold">Recent Items</span>
                        </div>
                        <button className="text-purple-400 hover:text-purple-300 text-sm">
                          View All
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🚗</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">Ford Focus</div>
                              <div className="text-sm text-gray-400">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-amber-900/50 text-amber-300 rounded-full text-xs">
                            Due soon
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🔧</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">Bosch Drill</div>
                              <div className="text-sm text-gray-400">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-600">
                            Up to date
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🏠</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">Boiler</div>
                              <div className="text-sm text-gray-400">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-600">
                            Up to date
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* This Week Calendar */}
                  <Card className="shadow-xl border-gray-800 bg-gray-900">
                    <div className="p-6">
                      <div className="flex items-center text-lg mb-4">
                        <Calendar className="mr-2 h-5 w-5 text-purple-400" />
                        <span className="text-white">This Week</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Mon</span>
                          <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">2</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Tue</span>
                          <div className="w-6 h-6 bg-gray-700 rounded text-gray-400 text-xs flex items-center justify-center">0</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Wed</span>
                          <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center">1</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Thu</span>
                          <div className="w-6 h-6 bg-gray-700 rounded text-gray-400 text-xs flex items-center justify-center">0</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Fri</span>
                          <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">1</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="shadow-xl border-gray-800 bg-gray-900">
                    <div className="p-6">
                      <div className="flex items-center text-lg mb-4">
                        <Wrench className="mr-2 h-5 w-5 text-purple-400" />
                        <span className="text-white">Quick Stats</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Total Items</span>
                          <span className="font-medium text-white">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Due Soon</span>
                          <span className="font-medium text-amber-400">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Overdue</span>
                          <span className="font-medium text-red-400">1</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;

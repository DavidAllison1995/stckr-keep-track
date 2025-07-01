
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Bell, Wrench, Package, QrCode } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <section className="py-16 px-4 bg-white max-[768px]:py-10 max-[768px]:px-3">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 max-[768px]:mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 max-[768px]:text-2xl max-[768px]:mb-3">
            Your Command Centre
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed max-[768px]:text-base max-[768px]:leading-normal max-[768px]:max-w-none">
            Never miss another renewal again. Track everything important from one organised dashboard with smart reminders and instant access to all your documents.
          </p>
        </div>

        {/* Dashboard Mockup - Made smaller for mobile */}
        <div className="max-w-5xl mx-auto max-[768px]:max-w-none">
          <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800 max-[768px]:rounded-xl">
            {/* Browser chrome - Made smaller for mobile */}
            <div className="bg-gray-800 px-4 py-3 flex items-center space-x-3 max-[768px]:px-3 max-[768px]:py-2">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full max-[768px]:w-2 max-[768px]:h-2"></div>
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full max-[768px]:w-2 max-[768px]:h-2"></div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full max-[768px]:w-2 max-[768px]:h-2"></div>
              </div>
              <div className="bg-gray-700 rounded-lg px-3 py-1 flex-1 max-w-md max-[768px]:px-2 max-[768px]:py-0.5 max-[768px]:max-w-xs">
                <span className="text-gray-300 text-sm max-[768px]:text-xs">stickr.io/dashboard</span>
              </div>
            </div>

            {/* Dashboard content - Made more compact for mobile */}
            <div className="p-6 bg-gray-900 max-[768px]:p-3">
              {/* Enhanced Header with brand styling - Made smaller for mobile */}
              <div className="text-center mb-8 pt-4 max-[768px]:mb-4 max-[768px]:pt-2">
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-3 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-xl max-[768px]:px-3 max-[768px]:py-2 max-[768px]:rounded-lg max-[768px]:mb-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg max-[768px]:w-5 max-[768px]:h-5 max-[768px]:rounded-md">
                    <QrCode className="w-4 h-4 text-white max-[768px]:w-3 max-[768px]:h-3" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight max-[768px]:text-lg">
                    👋 Welcome back,{' '}
                    <span className="text-purple-400 bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                      Sarah!
                    </span>
                  </h1>
                </div>
                <p className="text-gray-400 text-base font-medium max-[768px]:text-sm">
                  Ready to stick with it? Let's manage your space.
                </p>
              </div>

              {/* Main Grid Layout - Made more compact for mobile */}
              <div className="grid lg:grid-cols-3 gap-4 max-[768px]:grid-cols-1 max-[768px]:gap-3">
                {/* Main Content - Recent Items */}
                <div className="lg:col-span-2 max-[768px]:col-span-1">
                  <Card className="shadow-lg border-gray-800 bg-gray-900">
                    <div className="p-4 max-[768px]:p-3">
                      <div className="flex items-center justify-between mb-4 max-[768px]:mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-400 max-[768px]:w-3 max-[768px]:h-3" />
                          <span className="text-white text-lg font-semibold max-[768px]:text-base">Recent Items</span>
                        </div>
                        <button className="text-purple-400 hover:text-purple-300 text-sm max-[768px]:text-xs">
                          View All
                        </button>
                      </div>
                      <div className="space-y-3 max-[768px]:space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-lg border border-gray-700 max-[768px]:p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center max-[768px]:w-6 max-[768px]:h-6 max-[768px]:rounded-md">
                              <span className="text-sm max-[768px]:text-xs">🚗</span>
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm max-[768px]:text-xs">Ford Focus</div>
                              <div className="text-xs text-gray-400 max-[768px]:text-[10px]">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-amber-900/50 text-amber-300 rounded-full text-xs max-[768px]:px-1.5 max-[768px]:py-0.5 max-[768px]:text-[10px]">
                            Due soon
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-lg border border-gray-700 max-[768px]:p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center max-[768px]:w-6 max-[768px]:h-6 max-[768px]:rounded-md">
                              <span className="text-sm max-[768px]:text-xs">🔧</span>
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm max-[768px]:text-xs">Bosch Drill</div>
                              <div className="text-xs text-gray-400 max-[768px]:text-[10px]">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-600 max-[768px]:px-1.5 max-[768px]:py-0.5 max-[768px]:text-[10px]">
                            Up to date
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-lg border border-gray-700 max-[768px]:p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center max-[768px]:w-6 max-[768px]:h-6 max-[768px]:rounded-md">
                              <span className="text-sm max-[768px]:text-xs">🏠</span>
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm max-[768px]:text-xs">Boiler</div>
                              <div className="text-xs text-gray-400 max-[768px]:text-[10px]">Status: Good</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-600 max-[768px]:px-1.5 max-[768px]:py-0.5 max-[768px]:text-[10px]">
                            Up to date
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sidebar - Made more compact for mobile */}
                <div className="space-y-4 max-[768px]:space-y-3">
                  {/* This Week Calendar */}
                  <Card className="shadow-lg border-gray-800 bg-gray-900">
                    <div className="p-4 max-[768px]:p-3">
                      <div className="flex items-center text-base mb-3 max-[768px]:text-sm max-[768px]:mb-2">
                        <Calendar className="mr-2 h-4 w-4 text-purple-400 max-[768px]:h-3 max-[768px]:w-3" />
                        <span className="text-white">This Week</span>
                      </div>
                      <div className="space-y-2 max-[768px]:space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 max-[768px]:text-xs">Mon</span>
                          <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center max-[768px]:w-4 max-[768px]:h-4 max-[768px]:text-[10px]">2</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 max-[768px]:text-xs">Tue</span>
                          <div className="w-5 h-5 bg-gray-700 rounded text-gray-400 text-xs flex items-center justify-center max-[768px]:w-4 max-[768px]:h-4 max-[768px]:text-[10px]">0</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 max-[768px]:text-xs">Wed</span>
                          <div className="w-5 h-5 bg-purple-500 rounded text-white text-xs flex items-center justify-center max-[768px]:w-4 max-[768px]:h-4 max-[768px]:text-[10px]">1</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 max-[768px]:text-xs">Thu</span>
                          <div className="w-5 h-5 bg-gray-700 rounded text-gray-400 text-xs flex items-center justify-center max-[768px]:w-4 max-[768px]:h-4 max-[768px]:text-[10px]">0</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300 max-[768px]:text-xs">Fri</span>
                          <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center max-[768px]:w-4 max-[768px]:h-4 max-[768px]:text-[10px]">1</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="shadow-lg border-gray-800 bg-gray-900">
                    <div className="p-4 max-[768px]:p-3">
                      <div className="flex items-center text-base mb-3 max-[768px]:text-sm max-[768px]:mb-2">
                        <Wrench className="mr-2 h-4 w-4 text-purple-400 max-[768px]:h-3 max-[768px]:w-3" />
                        <span className="text-white">Quick Stats</span>
                      </div>
                      <div className="space-y-2 max-[768px]:space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400 max-[768px]:text-xs">Total Items</span>
                          <span className="font-medium text-white max-[768px]:text-sm">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400 max-[768px]:text-xs">Due Soon</span>
                          <span className="font-medium text-amber-400 max-[768px]:text-sm">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400 max-[768px]:text-xs">Overdue</span>
                          <span className="font-medium text-red-400 max-[768px]:text-sm">1</span>
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

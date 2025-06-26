
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Wrench } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Your Command Center
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything at a glance — tasks, statuses, items, and calendar.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Enhanced Browser Frame */}
          <div className="bg-gray-800 rounded-t-2xl p-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 flex-1 max-w-md">
                <span className="text-green-400">🔒</span> stckr.app/dashboard
              </div>
            </div>
          </div>

          {/* Enhanced Dashboard Content */}
          <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl p-8 shadow-2xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items List - Enhanced */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Package className="mr-3 h-6 w-6 text-purple-600" />
                      Latest Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        name: "Honda Civic",
                        status: "Excellent",
                        icon: "🚗",
                        maintenance: "Due soon",
                        color: "bg-blue-50 border-blue-200"
                      },
                      {
                        name: "Bosch Drill",
                        status: "Good",
                        icon: "🔧",
                        maintenance: "Up to date",
                        color: "bg-green-50 border-green-200"
                      },
                      {
                        name: "Samsung TV",
                        status: "Good",
                        icon: "📺",
                        maintenance: "Overdue",
                        color: "bg-gray-50 border-gray-200"
                      }
                    ].map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 ${item.color} rounded-xl border`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl">{item.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">Status: {item.status}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            item.maintenance === "Overdue" ? "destructive" : 
                            item.maintenance === "Due soon" ? "secondary" : 
                            "outline"
                          }
                          className="font-medium"
                        >
                          {item.maintenance}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* This Week */}
                <Card className="shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Monday</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg text-white text-sm flex items-center justify-center font-semibold">2</div>
                        <span className="text-sm text-gray-600">tasks</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Wednesday</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg text-white text-sm flex items-center justify-center font-semibold">1</div>
                        <span className="text-sm text-gray-600">task</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Wrench className="mr-3 h-5 w-5 text-green-600" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Items</span>
                      <span className="text-2xl font-bold text-gray-900">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Due Soon</span>
                      <span className="text-2xl font-bold text-orange-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overdue</span>
                      <span className="text-2xl font-bold text-red-600">1</span>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Wrench } from 'lucide-react';
const DashboardPreview = () => {
  return <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Command Center
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">See everything at a glance with our easy to use dashboard</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Browser Frame */}
          <div className="bg-gray-200 rounded-t-xl p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 bg-white rounded px-3 py-1 text-sm text-gray-600">
                stckr.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="bg-white border border-gray-200 rounded-b-xl p-6 shadow-xl">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Recent Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[{
                    name: "Kitchen Toaster",
                    status: "Good",
                    icon: "🍞",
                    maintenance: "Due soon"
                  }, {
                    name: "Garage Drill",
                    status: "Excellent",
                    icon: "🔧",
                    maintenance: "Up to date"
                  }, {
                    name: "Living Room TV",
                    status: "Good",
                    icon: "📺",
                    maintenance: "Overdue"
                  }].map((item, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">Status: {item.status}</div>
                          </div>
                        </div>
                        <Badge variant={item.maintenance === "Overdue" ? "destructive" : item.maintenance === "Due soon" ? "secondary" : "outline"}>
                          {item.maintenance}
                        </Badge>
                      </div>)}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Maintenance Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mon</span>
                      <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">2</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wed</span>
                      <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center">1</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fri</span>
                      <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">3</div>
                    </div>
                  </CardContent>
                </Card>

                {/* QR Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Wrench className="mr-2 h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Items</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Soon</span>
                      <span className="font-medium text-yellow-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="font-medium text-red-600">1</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default DashboardPreview;
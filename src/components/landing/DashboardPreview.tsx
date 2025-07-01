
import { Card, CardContent } from '@/components/ui/card';

const DashboardPreview = () => {
  return (
    <section className="py-20 px-4 bg-white max-[768px]:py-12 max-[768px]:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 max-[768px]:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 max-[768px]:text-2xl max-[768px]:mb-4 max-[768px]:leading-tight max-[768px]:max-w-[85ch] max-[768px]:mx-auto">
            Your digital home inventory awaits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed max-[768px]:text-lg max-[768px]:leading-relaxed max-[768px]:max-w-[85ch]">
            See how easy it is to manage your belongings with our intuitive dashboard
          </p>
        </div>

        <div className="relative">
          {/* Dashboard mockup */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl max-[768px]:p-4 max-[768px]:rounded-xl">
            <div className="bg-gray-800 rounded-xl p-6 max-[768px]:p-4">
              <div className="flex items-center justify-between mb-6 max-[768px]:mb-4">
                <h3 className="text-xl font-bold text-white max-[768px]:text-lg">My Items</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-[768px]:grid-cols-1 max-[768px]:gap-3">
                <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors">
                  <CardContent className="p-4 max-[768px]:p-3">
                    <div className="flex items-center space-x-3 max-[768px]:space-x-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center max-[768px]:w-10 max-[768px]:h-10">
                        <span className="text-xl max-[768px]:text-lg">🚗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white max-[768px]:text-sm">Ford Focus</h4>
                        <p className="text-sm text-gray-400 max-[768px]:text-xs">MOT due soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors">
                  <CardContent className="p-4 max-[768px]:p-3">
                    <div className="flex items-center space-x-3 max-[768px]:space-x-2">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center max-[768px]:w-10 max-[768px]:h-10">
                        <span className="text-xl max-[768px]:text-lg">🔧</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white max-[768px]:text-sm">Boiler</h4>
                        <p className="text-sm text-gray-400 max-[768px]:text-xs">Service up to date</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors">
                  <CardContent className="p-4 max-[768px]:p-3">
                    <div className="flex items-center space-x-3 max-[768px]:space-x-2">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center max-[768px]:w-10 max-[768px]:h-10">
                        <span className="text-xl max-[768px]:text-lg">📱</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white max-[768px]:text-sm">iPhone</h4>
                        <p className="text-sm text-gray-400 max-[768px]:text-xs">Warranty active</p>
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

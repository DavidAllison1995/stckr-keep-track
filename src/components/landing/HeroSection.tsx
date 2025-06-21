
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onGetStarted, onWatchDemo }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-20 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Know Everything 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> You Own</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Scan your belongings with a QR code. Track, maintain, and never lose a receipt again.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-2"
                onClick={onWatchDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end animate-scale-in">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-72 h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-gray-100 h-8 flex items-center justify-between px-6 text-xs font-medium">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-2">Kitchen Toaster</h3>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">🍞</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Next Maintenance</div>
                        <div className="text-lg font-semibold">Clean crumb tray</div>
                        <div className="text-sm text-blue-600">Due in 2 days</div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Warranty</div>
                        <div className="text-lg font-semibold">Valid until Dec 2025</div>
                        <div className="text-sm text-green-600">Receipt stored ✓</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Sticker */}
              <div className="absolute -right-4 top-20 w-16 h-16 bg-white rounded-lg shadow-lg border-4 border-yellow-300 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-black opacity-20 grid grid-cols-3 gap-px">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-black"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

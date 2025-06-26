
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, LogIn } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onGetStarted, onWatchDemo }: HeroSectionProps) => {
  const handleLogin = () => {
    window.location.href = '/auth';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-20 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <img 
          src="/lovable-uploads/b040bcf1-975f-4316-8744-a19b2453d26e.png" 
          alt="STCKR Logo" 
          className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => window.location.href = '/'}
        />
      </div>

      {/* Login button in top right */}
      <div className="absolute top-6 right-6 z-10">
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Log In
        </Button>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                Keep Track of Your Stuff.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  For Keeps.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Scan a QR. Store documents. Schedule reminders — all in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold"
                onClick={onWatchDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Enhanced Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-2xl">📄</span>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center animate-pulse delay-1000">
                <span className="text-xl">⏰</span>
              </div>
              
              {/* Phone Frame */}
              <div className="w-80 h-[640px] bg-gray-900 rounded-[3.5rem] p-4 shadow-2xl relative">
                <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-gray-50 h-8 flex items-center justify-between px-6 text-xs font-medium">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">My Items</h2>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-sm">🔔</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-6 space-y-4">
                    {/* Item Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg">🚗</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Honda Civic</h3>
                          <p className="text-sm text-gray-600">2019 Model</p>
                        </div>
                      </div>
                      <div className="bg-orange-100 px-3 py-2 rounded-lg">
                        <p className="text-sm font-medium text-orange-800">MOT Due in 12 days</p>
                      </div>
                    </div>
                    
                    {/* Documents Card */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Recent Documents</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-blue-500">📄</span>
                          <span className="text-gray-700">Insurance Certificate</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-green-500">📋</span>
                          <span className="text-gray-700">Service Manual</span>
                        </div>
                      </div>
                    </div>
                  </div>
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

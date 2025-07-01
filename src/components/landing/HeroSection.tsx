
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
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 max-[768px]:px-6 max-[768px]:pt-20 max-[768px]:pb-16">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10 max-[768px]:top-4 max-[768px]:left-4">
        <img 
          src="/lovable-uploads/b040bcf1-975f-4316-8744-a19b2453d26e.png" 
          alt="STCKR Logo" 
          className="h-12 cursor-pointer hover:opacity-80 transition-opacity max-[768px]:h-8"
          onClick={() => window.location.href = '/'}
        />
      </div>

      {/* Login button in top right */}
      <div className="absolute top-6 right-6 z-10 max-[768px]:top-4 max-[768px]:right-4">
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm max-[768px]:text-sm max-[768px]:px-3 max-[768px]:py-2"
        >
          <LogIn className="mr-2 h-4 w-4 max-[768px]:h-3 max-[768px]:w-3" />
          Log In
        </Button>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-[768px]:grid-cols-1 max-[768px]:gap-8 max-[768px]:text-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in max-[768px]:space-y-6">
            <div className="space-y-6 max-[768px]:space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight max-[768px]:text-3xl max-[768px]:leading-tight max-[768px]:max-w-[85ch] max-[768px]:mx-auto">
                Everything Stored.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Nothing Missed.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed max-[768px]:text-lg max-[768px]:leading-relaxed max-[768px]:max-w-[85ch]">
                Digitise your items with STCKR,<br className="max-[768px]:hidden" />
                track maintenance, and keep all<br className="max-[768px]:hidden" />
                the important info at your fingertips.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-[768px]:flex-col max-[768px]:gap-4 max-[768px]:items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 max-[768px]:w-full max-[768px]:max-w-xs max-[768px]:text-base max-[768px]:px-6 max-[768px]:py-4"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 max-[768px]:h-4 max-[768px]:w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-purple-600 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 max-[768px]:w-full max-[768px]:max-w-xs max-[768px]:text-base max-[768px]:px-6 max-[768px]:py-4 max-[768px]:border-gray-300 max-[768px]:text-gray-700 max-[768px]:hover:bg-gray-50"
                onClick={onWatchDemo}
              >
                <Play className="mr-2 h-5 w-5 max-[768px]:h-4 max-[768px]:w-4" />
                See How It Works
              </Button>
            </div>
          </div>

          {/* Phone Mockup - Dark App UI */}
          <div className="relative flex justify-center lg:justify-end animate-scale-in max-[768px]:mt-8">
            <div className="relative max-[768px]:scale-90">
              {/* Phone Frame with glassmorphism effect */}
              <div className="w-72 h-[600px] bg-gray-100 rounded-[3rem] p-4 shadow-2xl backdrop-blur-sm max-[768px]:w-64 max-[768px]:h-[530px] max-[768px]:p-3">
                <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative shadow-inner">
                  {/* Status Bar */}
                  <div className="bg-gray-800 h-8 flex items-center justify-between px-6 text-xs font-medium text-white max-[768px]:h-7 max-[768px]:px-4">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm max-[768px]:w-3 max-[768px]:h-1.5"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm max-[768px]:w-3 max-[768px]:h-1.5"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm max-[768px]:w-3 max-[768px]:h-1.5"></div>
                    </div>
                  </div>
                  
                  {/* Dark App Content */}
                  <div className="p-4 space-y-3 bg-gray-900 max-[768px]:p-3 max-[768px]:space-y-2">
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-2 text-white max-[768px]:text-base max-[768px]:mb-1">Car - Ford Focus</h3>
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg max-[768px]:w-16 max-[768px]:h-16 max-[768px]:mb-3">
                        <span className="text-2xl max-[768px]:text-xl">🚗</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-[768px]:space-y-2">
                      <div className="bg-amber-900/30 p-3 rounded-lg border border-amber-600/20 backdrop-blur-sm max-[768px]:p-2">
                        <div className="text-sm font-medium text-gray-400 max-[768px]:text-xs">Upcoming</div>
                        <div className="text-lg font-semibold text-amber-300 max-[768px]:text-base">MOT Due</div>
                        <div className="text-sm text-amber-400 max-[768px]:text-xs">Due in 2 weeks</div>
                      </div>
                      
                      <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-600/20 backdrop-blur-sm max-[768px]:p-2">
                        <div className="text-sm font-medium text-gray-400 max-[768px]:text-xs">Documents</div>
                        <div className="text-lg font-semibold text-blue-300 max-[768px]:text-base">Insurance & V5C</div>
                        <div className="text-sm text-blue-400 max-[768px]:text-xs">Stored securely ✓</div>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 backdrop-blur-sm max-[768px]:p-2">
                        <div className="text-sm font-medium text-gray-400 max-[768px]:text-xs">Item Info</div>
                        <div className="text-lg font-semibold text-gray-200 max-[768px]:text-base">Purchased: Jan 2022</div>
                        <div className="text-sm text-gray-400 max-[768px]:text-xs">Warranty valid until Jan 2025</div>
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

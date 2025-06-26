
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
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-20 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
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
          className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Log In
        </Button>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Everything Stored.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Nothing Missed.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Digitise your items with STCKR,<br />
                track maintenance, and keep all<br />
                the important info at your fingertips.
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
                  <div className="p-4 space-y-3">
                    <div className="text-center">
                      <h3 className="font-bold text-lg mb-2">Car - Ford Focus</h3>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-gray-600">Upcoming</div>
                        <div className="text-lg font-semibold text-yellow-800">MOT Due</div>
                        <div className="text-sm text-yellow-600">Due in 2 weeks</div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-gray-600">Documents</div>
                        <div className="text-lg font-semibold text-blue-800">Insurance & V5C</div>
                        <div className="text-sm text-blue-600">Stored securely ✓</div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-600">Item Info</div>
                        <div className="text-lg font-semibold text-gray-800">Purchased: Jan 2022</div>
                        <div className="text-sm text-gray-600">Warranty valid until Jan 2025</div>
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

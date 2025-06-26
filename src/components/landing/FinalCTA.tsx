
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA = ({ onGetStarted }: FinalCTAProps) => {
  const features = [
    "Works on mobile & desktop", 
    "FREE to start", 
    "No credit card required"
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700">
      <div className="container mx-auto max-w-5xl text-center">
        <div className="space-y-10 text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Bring order to your home.
          </h2>
          
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Join homeowners who never lose track of their stuff.
          </p>

          <div className="flex flex-wrap justify-center gap-8 my-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-purple-100">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 transition-colors duration-300 rounded-2xl font-bold shadow-xl"
            onClick={onGetStarted}
          >
            Start Organizing for Free
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>

          <p className="text-lg text-purple-200 mt-6">
            No spam, no hassle. Just organized living.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;


import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA = ({ onGetStarted }: FinalCTAProps) => {
  const features = [
    "Works on mobile",
    "QR stickers included", 
    "Free to start",
    "No credit card required"
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8 text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Ready to bring order to your home?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of organized homeowners who never lose track of their belongings.
          </p>

          <div className="flex flex-wrap justify-center gap-6 my-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-blue-100">
                <Check className="h-5 w-5 text-green-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            size="lg" 
            className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-colors duration-300"
            onClick={onGetStarted}
          >
            Start Organizing for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-sm text-blue-200 mt-4">
            No spam, no hassle. Just organized living.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

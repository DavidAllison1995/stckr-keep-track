
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA = ({ onGetStarted }: FinalCTAProps) => {
  const features = ["Works on mobile", "Free to start", "No credit card required"];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700 max-[768px]:py-12 max-[768px]:px-3">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8 text-white max-[768px]:space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-[768px]:text-2xl max-[768px]:leading-tight">
            Ready to bring order to your home?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto max-[768px]:text-base max-[768px]:max-w-none">
            Start organising your space and never lose track of your belongings again.
          </p>

          <div className="flex flex-wrap justify-center gap-6 my-8 max-[768px]:gap-4 max-[768px]:my-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-blue-100 max-[768px]:text-sm">
                <Check className="h-5 w-5 text-green-400 max-[768px]:h-4 max-[768px]:w-4" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            size="lg" 
            className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 max-[768px]:text-base max-[768px]:px-8 max-[768px]:py-4 max-[768px]:hover:scale-102" 
            onClick={onGetStarted}
          >
            Start Organising for Free
            <ArrowRight className="ml-2 h-5 w-5 max-[768px]:h-4 max-[768px]:w-4" />
          </Button>

          <p className="text-sm text-blue-200 mt-4 max-[768px]:text-xs max-[768px]:mt-2">
            No spam, no hassle. Just organised living.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

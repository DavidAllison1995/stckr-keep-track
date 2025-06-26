
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Stick a QR",
      description: "Attach to your belongings, packs are universal.",
      visual: "🏷️",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "2", 
      title: "Scan & Add",
      description: "Upload photos, purchase info, maintenance schedules.",
      visual: "📱",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "3",
      title: "Relax & Recall", 
      description: "We'll notify you ahead of time. Never miss deadlines again.",
      visual: "😌",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to never lose track of your belongings again
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step Number */}
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-8 shadow-lg`}>
                {step.number}
              </div>
              
              {/* Visual */}
              <div className="text-7xl mb-8">
                {step.visual}
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>

              {/* Connection Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-8 w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform -translate-y-1/2">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced context section */}
        <div className="mt-20 bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              Perfect for everything you own
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-600 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">🚗</span>
                <span className="font-medium">Cars & Bikes</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">🏠</span>
                <span className="font-medium">Home Appliances</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">🔧</span>
                <span className="font-medium">Tools & Equipment</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">📄</span>
                <span className="font-medium">Important Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

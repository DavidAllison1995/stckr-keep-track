
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Tag Your Stuff",
      description: "Stick a QR code on your belongings — from tools and appliances to important paperwork.",
      visual: "🏷️"
    },
    {
      number: "2", 
      title: "Scan & Upload",
      description: "Use your phone to scan the tag, add details, upload photos, and attach documents.",
      visual: "📱"
    },
    {
      number: "3",
      title: "Stay Notified", 
      description: "Get automatic reminders and quick access to all your item info, anytime.",
      visual: "🔔"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get organised in three simple steps — from physical items to digital peace of mind
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full bg-white">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg">
                    {step.number}
                  </div>
                  
                  {/* Visual */}
                  <div className="text-6xl mb-6">
                    {step.visual}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Additional context section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Perfect for everything you own
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 max-w-2xl mx-auto">
              <div>🚗 Cars & Bikes</div>
              <div>🏠 Home Appliances</div>
              <div>🔧 Tools & Equipment</div>
              <div>📄 Important Documents</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

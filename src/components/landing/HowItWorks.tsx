
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
    <section className="py-20 px-4 bg-gray-50 max-[768px]:py-12 max-[768px]:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 max-[768px]:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 max-[768px]:text-2xl max-[768px]:mb-4 max-[768px]:leading-tight max-[768px]:max-w-[85ch] max-[768px]:mx-auto">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto max-[768px]:text-lg max-[768px]:leading-relaxed max-[768px]:max-w-[85ch]">
            Get organised in three simple steps — from physical items to digital peace of mind
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-[768px]:grid-cols-1 max-[768px]:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full bg-white max-[768px]:hover:-translate-y-0.5">
                <CardContent className="p-8 max-[768px]:p-6">
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg max-[768px]:w-10 max-[768px]:h-10 max-[768px]:text-lg max-[768px]:mb-4">
                    {step.number}
                  </div>
                  
                  {/* Visual */}
                  <div className="text-6xl mb-6 max-[768px]:text-5xl max-[768px]:mb-4">
                    {step.visual}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 max-[768px]:text-lg max-[768px]:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-[768px]:text-sm max-[768px]:leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2 max-[768px]:hidden"></div>
              )}
            </div>
          ))}
        </div>

        {/* Additional context section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-[768px]:mt-10 max-[768px]:p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 max-[768px]:text-xl max-[768px]:mb-3 max-[768px]:leading-tight">
              Perfect for everything you own
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 max-w-2xl mx-auto max-[768px]:grid-cols-2 max-[768px]:gap-3 max-[768px]:text-xs">
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

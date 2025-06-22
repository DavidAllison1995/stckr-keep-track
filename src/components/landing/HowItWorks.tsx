import { Card, CardContent } from '@/components/ui/card';
const HowItWorks = () => {
  const steps = [{
    number: "1",
    title: "Stick a QR code",
    description: "Place our smart QR stickers on your belongings - from appliances to tools to important documents.",
    visual: "🏷️"
  }, {
    number: "2",
    title: "Scan and add your item",
    description: "Use your phone camera to scan the code and add photos, purchase info, and maintenance schedules.",
    visual: "📱"
  }, {
    number: "3",
    title: "Relax — we'll handle reminders",
    description: "Get smart notifications for maintenance, warranty renewals, and never lose track of your stuff again.",
    visual: "🔔"
  }];
  return <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get organised in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => <div key={index} className="relative">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
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
              {index < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2"></div>}
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;
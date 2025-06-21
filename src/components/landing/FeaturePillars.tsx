
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Wrench, Users } from 'lucide-react';

const FeaturePillars = () => {
  const features = [
    {
      icon: QrCode,
      title: "Smart Inventory",
      description: "Stick and scan your way to a smarter home.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Wrench,
      title: "Built-In Maintenance Reminders",
      description: "Never miss a service again — we'll remind you.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Shared Access",
      description: "Let everyone in the house manage things together.",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your home into a well-organized space with smart tracking and maintenance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturePillars;

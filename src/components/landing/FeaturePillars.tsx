
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, Bell } from 'lucide-react';

const FeaturePillars = () => {
  const features = [
    {
      icon: FileText,
      title: "Store What Matters",
      description: "Digitise and organise all your important item documents — warranties, insurance, manuals and receipts.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Track What's Due",
      description: "Automatically stay on top of renewals, maintenance, and tasks — never miss a service again.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Bell,
      title: "Relax With Reminders",
      description: "Get smart alerts for what matters — warranty expirations, car insurance, MOTs, and more.",
      gradient: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Transform chaos into control
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From your boiler manual to your car insurance, keep everything organised and accessible. 
            Never lose important documents or miss critical deadlines again.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg h-full bg-white"
            >
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
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

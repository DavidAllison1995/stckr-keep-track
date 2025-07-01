
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
    <section className="py-20 px-4 bg-white max-[768px]:py-12 max-[768px]:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 max-[768px]:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 max-[768px]:text-2xl max-[768px]:mb-4 max-[768px]:leading-tight max-[768px]:max-w-[85ch] max-[768px]:mx-auto">
            Transform chaos into control
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed max-[768px]:text-lg max-[768px]:leading-relaxed max-[768px]:max-w-[85ch]">
            From your boiler manual to your car insurance, keep everything organised and accessible. 
            Never lose important documents or miss critical deadlines again.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-[768px]:grid-cols-1 max-[768px]:gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg h-full bg-white max-[768px]:hover:-translate-y-1"
            >
              <CardContent className="p-8 text-center h-full flex flex-col max-[768px]:p-6">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg max-[768px]:w-12 max-[768px]:h-12 max-[768px]:mb-4 max-[768px]:rounded-xl`}>
                  <feature.icon className="h-8 w-8 text-white max-[768px]:h-6 max-[768px]:w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 max-[768px]:text-lg max-[768px]:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-grow max-[768px]:text-sm max-[768px]:leading-relaxed">
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

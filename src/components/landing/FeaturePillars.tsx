
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Wrench, Bell } from 'lucide-react';

const FeaturePillars = () => {
  const features = [
    {
      icon: FileText,
      title: "Document Storage",
      description: "All manuals, guarantees & receipts in one place.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Wrench,
      title: "Smart Maintenance", 
      description: "Set reminders for servicing, insurance, warranties.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description: "Get alerts before things expire or are due.",
      gradient: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Everything You Need.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Before You Ask.
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform chaos into control with three powerful features that work together seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className={`w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturePillars;

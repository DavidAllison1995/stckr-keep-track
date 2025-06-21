
import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "I never lose my receipts anymore",
      author: "Sarah M.",
      role: "Homeowner"
    },
    {
      quote: "My boiler finally gets serviced on time",
      author: "Mike R.",
      role: "Property Manager"
    },
    {
      quote: "I scanned everything in my garage and found stuff I forgot I owned",
      author: "Jennifer K.",
      role: "Busy Parent"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
            <span>Over</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">5,000</span>
            <span>items organized and counting</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4 text-gray-300">"</div>
                <blockquote className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
                  {testimonial.quote}
                </blockquote>
                <div className="border-t pt-6">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "I never lose my receipts anymore. Everything's organised and I can find what I need instantly.",
      author: "Sarah M.",
      role: "Homeowner",
      rating: 5
    },
    {
      quote: "My boiler finally gets serviced on time. The reminders are brilliant and save me so much hassle.",
      author: "Mike R.",
      role: "Property Manager",
      rating: 5
    },
    {
      quote: "I scanned everything in my garage and found stuff I forgot I owned. Proper game-changer!",
      author: "Jennifer K.",
      role: "Busy Parent",
      rating: 5
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
            <span>items organised and counting</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8 text-center">
                {/* Star Rating */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
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

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Never Miss a Renewal Again
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">99%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Access</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">Secure</div>
                <div className="text-sm text-gray-600">Storage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">Free</div>
                <div className="text-sm text-gray-600">To Start</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import Footer from "@/components/landing/Footer";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
            Support
          </h1>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">Get Help</h2>
              <p className="text-gray-300 mb-4">
                Need assistance with STCKR? We're here to help! For any questions, technical issues, or feedback, please reach out to our support team.
              </p>
              
              <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-400/30">
                <h3 className="text-lg font-medium text-white mb-2">Contact Support</h3>
                <p className="text-gray-300 mb-2">Email us at:</p>
                <a 
                  href="mailto:support@stckr.io" 
                  className="text-purple-400 hover:text-purple-300 font-medium text-lg transition-colors"
                >
                  support@stckr.io
                </a>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">What We Can Help With</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Account setup and management</li>
                <li>• QR code generation and scanning issues</li>
                <li>• Item management and organization</li>
                <li>• Maintenance scheduling and tracking</li>
                <li>• Mobile app functionality</li>
                <li>• Technical troubleshooting</li>
                <li>• Feature requests and feedback</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mt-6 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">Response Time</h2>
              <p className="text-gray-300">
                We typically respond to support requests within 24-48 hours during business days. 
                For urgent issues, please include "URGENT" in your email subject line.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;
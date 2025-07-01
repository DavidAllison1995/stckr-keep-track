
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy for Stckr</h1>
          <div className="text-gray-600">
            <p>Effective Date: July 1, 2025</p>
            <p>Last Updated: July 1, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Stckr helps users track household items, store documents, and manage maintenance tasks via QR codes. 
              We respect your privacy and are committed to protecting your personal data.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Data We Collect</h2>
              <p className="text-gray-700 mb-3">We collect the following types of data:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>User-generated content:</strong> item names, categories, notes, documents, tasks</li>
                <li><strong>Device information:</strong> basic data like device type and operating system</li>
                <li><strong>Usage data:</strong> anonymized analytics (if enabled in the future)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
              <p className="text-gray-700 mb-3">Your data is used to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Organize and store your items and tasks</li>
                <li>Deliver features like reminders, document access, and multi-user sharing</li>
                <li>Improve app stability and future updates</li>
              </ul>
              <p className="text-gray-700 mb-3">We do not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Sell your data</li>
                <li>Use your data for advertising</li>
                <li>Share your data with third parties (except secure cloud storage providers like Supabase)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Permissions</h2>
              <p className="text-gray-700 mb-3">The app requires:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Camera:</strong> to scan and link QR codes</li>
                <li><strong>Storage:</strong> to upload and view your documents</li>
                <li><strong>Internet:</strong> to sync data across devices via Supabase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700">
                We use Supabase with industry-standard security practices including authentication and encrypted cloud storage. 
                Your data is only accessible by you (and any users you've invited).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Delete your account and data</li>
                <li>Access your stored data</li>
                <li>Revoke permissions at any time</li>
              </ul>
              <p className="text-gray-700">
                For deletion requests, email: <a href="mailto:support@stckr.io" className="text-purple-600 hover:underline">support@stckr.io</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions or concerns, contact us at:<br />
                <a href="mailto:support@stckr.io" className="text-purple-600 hover:underline">support@stckr.io</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

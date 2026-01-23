import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const VerificationPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Verification Pending</h1>
            <p className="text-gray-600">
              Thank you for completing your payment! Our team is currently reviewing your application.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-green-800 mb-2">What happens next?</h2>
            <ul className="text-sm text-green-700 text-left space-y-2">
              <li>• Our team will verify your details within 24-48 hours</li>
              <li>• You&apos;ll receive an email notification once verified</li>
              <li>• You can then log in and access the dashboard</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = 'mailto:support@Goupbroad.com'}
              className="w-full bg-primary-1/95 cursor-pointer hover:bg-primary-1 text-white"
            >
              Contact Support
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;

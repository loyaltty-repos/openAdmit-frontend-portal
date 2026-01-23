import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const PaymentFailed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">
              We were unable to process your payment. This could be due to:
            </p>
            <ul className="text-sm text-gray-600 text-left mb-6 space-y-2">
              <li>• Insufficient funds</li>
              <li>• Bank declined the transaction</li>
              <li>• Network connectivity issues</li>
              <li>• Payment session timeout</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link to="/auth/payment-required">
              <Button className="w-full">
                Try Payment Again
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@Goupbroad.com'}
              className="w-full"
            >
              Contact Support
            </Button>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;

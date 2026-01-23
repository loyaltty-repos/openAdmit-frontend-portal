// import { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { apiService } from '@/services/api.services';
// import { getUser, clearAuth } from '@/lib/auth';
// import { toast } from 'sonner';
// import { useRazorpay } from '@/hooks/use-razorpay';
// import Cookies from 'js-cookie';
// import { motion } from 'framer-motion';
// import {
//     CreditCard,
//     Clock,
//     Shield,
//     CheckCircle,
//     Loader2,
//     ArrowLeft,
//     University,
//     Globe
// } from 'lucide-react';

// const PaymentRequired = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [countdown, setCountdown] = useState(8);
//     const [loading, setLoading] = useState(false);

//     // Get plan details from location state or use default values
//     const planType = location.state?.planType || 'basic';
//     const planCategory = location.state?.category || 'masters';
//     const planPrice = location.state?.price || 0;
//     const planDetails = location.state?.planDetails || {};

//     // Get user data either from location state or from auth
//     const userFromState = location.state?.user;
//     const user = userFromState || getUser();

//     const razorpayLoaded = useRazorpay();

//     const handleProceed = useCallback(async () => {
//         if (loading || !razorpayLoaded) return;

//         try {
//             setLoading(true);
//             // Initialize payment with the selected plan details
//             const response = await apiService.post('/payment/initiate', {
//                 "planType": planType,
//                 "category": planCategory
//             });

//             // If fee is already paid, clear auth and redirect to login to refresh user data
//             if (response.message === 'Already Fee Paid') {
//                 toast.success('Payment already completed! Redirecting to signin...');
//                 clearAuth();
//                 navigate('/signin');
//                 return;
//             }

//             if (!response.data?.orderId || !response.data?.key) {
//                 throw new Error('Invalid payment details received');
//             }

//             const options = {
//                 key: response.data.key,
//                 amount: response.data.amount,
//                 currency: response.data.currency || 'INR',
//                 name: 'Open Admits',
//                 description: `${planCategory.charAt(0).toUpperCase() + planCategory.slice(1)} ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
//                 order_id: response.data.orderId,
//                 prefill: {
//                     name: user?.name || '',
//                     email: user?.email || '',
//                     contact: user?.phoneNumber || ''
//                 },
//                 handler: async function (response) {
//                     try {
//                         const verifyResponse = await apiService.post('/payment/verify', {
//                             paymentId: response.razorpay_payment_id,
//                             orderId: response.razorpay_order_id,
//                             signature: response.razorpay_signature
//                         });
//                         if (verifyResponse.success) {
//                             toast.success('Payment successful!');

//                             // Store the current user data before clearing auth
//                             const currentUser = getUser();

//                             // Clear auth tokens
//                             // localStorage.removeItem('user');
//                             // localStorage.removeItem('authToken');
//                             // Cookies.remove('accessToken');

//                             // Navigate to order confirmation with payment details
//                             navigate('/order-confirmation', {
//                                 state: {
//                                     orderDetails: verifyResponse.data.orderDetails
//                                 }
//                             });
//                         } else {
//                             throw new Error('Payment verification failed');
//                         }
//                     } catch (error) {
//                         console.error('Payment verification failed:', error);
//                         toast.error('Payment verification failed. Please contact support.');
//                     }
//                 },
//                 modal: {
//                     ondismiss: function () {
//                         setLoading(false);
//                         setCountdown(5);
//                     }
//                 }
//             };

//             const razorpay = new window.Razorpay(options);
//             razorpay.on('payment.failed', function () {
//                 toast.error('Payment failed');
//                 setLoading(false);
//                 navigate('/auth/payment-failed');
//             });
//             razorpay.open();
//         } catch (error) {
//             console.error('Payment initiation failed:', error);
//             toast.error(error.message || 'Failed to initiate payment. Please try again.');
//             setLoading(false);
//         }
//     }, [loading, navigate, user, razorpayLoaded]);

//     useEffect(() => {
//         if (!user) {
//             navigate('/signin');
//             return;
//         }

//         if (user.isVerified && user.isFeePaid) {
//             clearAuth();
//             navigate('/signin');
//             return;
//         }

//         let timer;
//         if (!user.isFeePaid) {
//             if (countdown > 0 && razorpayLoaded) {
//                 timer = setInterval(() => setCountdown(c => c - 1), 1000);
//             } else if (countdown === 0 && !loading && razorpayLoaded) {
//                 handleProceed();
//             }
//         }

//         return () => {
//             if (timer) clearInterval(timer);
//             if (window.Razorpay && window.Razorpay.cleanup) {
//                 window.Razorpay.cleanup();
//             }
//         };
//     }, [countdown, user, navigate, loading, handleProceed, razorpayLoaded]);

//     // Loading state for Razorpay
//     if (!razorpayLoaded) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
//                 >
//                     <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <Loader2 className="w-8 h-8 text-primary-1 animate-spin" />
//                     </div>
//                     <h1 className="text-2xl font-semibold text-slate-800 mb-4">
//                         Loading Payment Gateway...
//                     </h1>
//                     <p className="text-slate-600">
//                         Please wait while we set up the secure payment system.
//                     </p>
//                 </motion.div>
//             </div>
//         );
//     }

//     // Verification pending state
//     if (user?.isFeePaid && !user?.isVerified) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
//                 >
//                     <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <Clock className="w-8 h-8 text-primary-600" />
//                     </div>
//                     <h1 className="text-2xl font-semibold text-slate-800 mb-4">
//                         Verification Pending
//                     </h1>
//                     <p className="text-slate-600 mb-4">
//                         Your payment has been received successfully. Our team will verify your details shortly.
//                     </p>
//                     <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
//                         <p className="text-primary-700 text-sm">
//                             <strong>Next Steps:</strong> You&apos;ll receive an email confirmation once verification is complete.
//                         </p>
//                     </div>
//                     <p className="text-slate-500 text-sm mb-6">
//                         For any queries, contact us at <span className="font-medium text-primary-1">contactus@openadmits.com</span>
//                     </p>
//                     <Button asChild variant="outline" className="w-full">
//                         <Link to="/auth/sigin" className="flex items-center justify-center gap-2">
//                             <ArrowLeft className="w-4 h-4" />
//                             Back to Signin
//                         </Link>
//                     </Button>
//                 </motion.div>
//             </div>
//         );
//     }

//     // Main payment required state 
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
//             <div className="w-full max-w-4xl">
//                 {/* Header */}
//                 <motion.div
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="text-center mb-8"
//                 >
//                     <div className="flex items-center justify-center gap-2 mb-4 bg-primary p-2 rounded-lg shadow-lg">
//                         <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />

//                     </div>
//                     <h1 className="text-3xl font-bold text-primary mb-2">Complete Your Registration</h1>
//                     <p className="text-slate-600">Secure your spot and unlock access to premium university guidance</p>
//                 </motion.div>

//                 <div className="grid lg:grid-cols-2 gap-8 items-center">
//                     {/* Left side - Features */}
//                     <motion.div
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="space-y-6"
//                     >
//                         <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
//                             <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                                 <University className="w-5 h-5 text-primary" />
//                                 What You&apos;ll Get Access To
//                             </h3>
//                             <div className="space-y-4">
//                                 <div className="flex items-start gap-3">
//                                     <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Personalized University Shortlist</p>
//                                         <p className="text-slate-600 text-sm">Get matched with 46+ universities based on your profile</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Expert Guidance & Support</p>
//                                         <p className="text-slate-600 text-sm">Direct access to education consultants and advisors</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Application Tracking</p>
//                                         <p className="text-slate-600 text-sm">Monitor your application progress and deadlines</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Document Management</p>
//                                         <p className="text-slate-600 text-sm">Secure storage and organization of all your documents</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-primary-100 border border-primary-200 rounded-xl p-4">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <Shield className="w-5 h-5 text-primary-1" />
//                                 <span className="font-medium text-primary-800">Secure Payment</span>
//                             </div>
//                             <p className="text-primary-700 text-sm">
//                                 Your payment is protected by industry-standard encryption and security measures.
//                             </p>
//                         </div>
//                     </motion.div>

//                     {/* Right side - Payment Card */}
//                     <motion.div
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.4 }}
//                         className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
//                     >
//                         <div className="text-center mb-6">
//                             <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                 <CreditCard className="w-8 h-8 text-primary" />
//                             </div>
//                             <h2 className="text-2xl font-semibold text-primary mb-2">Registration Payment</h2>
//                             <p className="text-slate-600">Complete your payment to access the dashboard</p>
//                             <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
//                                 <p className="text-primary font-semibold">{planCategory.charAt(0).toUpperCase() + planCategory.slice(1)} {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</p>
//                                 <p className="text-2xl font-bold text-primary mt-1">₹{planPrice.toLocaleString('en-IN')}</p>
//                             </div>
//                         </div>

//                         {/* Countdown Timer */}
//                         <motion.div
//                             initial={{ scale: 0.95 }}
//                             animate={{ scale: 1 }}
//                             className="bg-gradient-to-r from-primary-100 to-primary-300 rounded-xl p-4 mb-6 border border-emerald-200"
//                         >
//                             <div className="flex items-center justify-center gap-2 mb-2">
//                                 <Clock className="w-5 h-5 text-primary" />
//                                 <span className="font-medium text-primary">Auto-redirect in</span>
//                             </div>
//                             <div className="text-center">
//                                 <motion.div
//                                     key={countdown}
//                                     initial={{ scale: 1.2 }}
//                                     animate={{ scale: 1 }}
//                                     className="text-3xl font-bold text-primary mb-1"
//                                 >
//                                     {countdown}
//                                 </motion.div>
//                                 <p className="text-primary-700 text-sm">seconds</p>
//                             </div>
//                         </motion.div>

//                         {/* User Info */}
//                         <div className="bg-primary-50 rounded-lg p-4 mb-6">
//                             <p className="text-primary-800 text-sm mb-1">Registering as:</p>
//                             <p className="font-medium text-primary-800">{user?.name}</p>
//                             <p className="text-primary-800 text-sm">{user?.email}</p>
//                         </div>

//                         {/* Payment Button */}
//                         <Button
//                             onClick={handleProceed}
//                             disabled={loading}
//                             className="w-full h-12 bg-primary hover:bg-primary-700 cursor-pointer text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
//                         >
//                             {loading ? (
//                                 <div className="flex items-center gap-2">
//                                     <Loader2 className="w-5 h-5 animate-spin" />
//                                     Processing Payment...
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2">
//                                     <CreditCard className="w-5 h-5" />
//                                     Proceed to Secure Payment
//                                 </div>
//                             )}
//                         </Button>

//                         <p className="text-center text-primary-500 text-xs mt-4">
//                             By proceeding, you agree to our Terms of Service and Privacy Policy
//                         </p>
//                     </motion.div>
//                 </div>

//                 {/* Footer */}
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.6 }}
//                     className="text-center mt-8 text-slate-500 text-sm"
//                 >
//                     <p>Need help? Contact us at <span className="text-primary font-medium">contactus@openadmits.com</span></p>
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default PaymentRequired;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api.services';
import { getUser, clearAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  ArrowLeft,
  University,
} from 'lucide-react';

/**
 * Cashfree v3 SDK loader (CDN).
 * <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
 */
const CASHFREE_SDK_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js';

function loadCashfreeSdk() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Cashfree) return resolve(true);

    const existing = document.querySelector(`script[src="${CASHFREE_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = CASHFREE_SDK_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });
}

const PaymentRequired = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [countdown, setCountdown] = useState(8);
  const [loading, setLoading] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  // Plan details (kept compatible with your existing state usage)
  const planType = location.state?.planType || 'basic';
  const planCategory = location.state?.category || 'masters';
  const planPrice = location.state?.price || 0;

  // User data
  const userFromState = location.state?.user;
  const user = userFromState || getUser();

  /**
   * Cashfree mode:
   * - Prefer env: VITE_CASHFREE_MODE = 'sandbox' | 'production'
   * - Fallback: infer from key (TEST => sandbox)
   */
  const cashfreeMode = useMemo(() => {
    const envMode = import.meta?.env?.VITE_CASHFREE_MODE;
    if (envMode === 'sandbox' || envMode === 'production') return envMode;

    const maybeKey = location.state?.key; // if you ever pass it
    if (typeof maybeKey === 'string' && maybeKey.toUpperCase().startsWith('TEST')) return 'sandbox';

    return 'sandbox';
  }, [location.state?.key]);

  const verifyCashfreePayment = useCallback(
    async ({ orderId, paymentId }) => {
      try {
        const verifyResponse = await apiService.post('/payment/verify', {
          orderId,
          ...(paymentId ? { paymentId } : {}),
        });

        toast.success('Payment successful!');

        navigate('/order-confirmation', {
          state: {
            orderDetails: verifyResponse?.data?.orderDetails,
          },
        });

        return true;
      } catch (error) {
        console.error('Payment verification failed:', error);

        const serverMsg =
          error?.response?.data?.message ||
          error?.message ||
          'Payment verification failed. If amount was debited, contact support.';

        toast.error(serverMsg);
        return false;
      }
    },
    [navigate]
  );

  const handleProceed = useCallback(async () => {
    if (loading || !cashfreeLoaded) return;

    try {
      setLoading(true);

      // Initiate order (your backend returns orderId + paymentSessionId)
      const response = await apiService.post('/payment/initiate', {
        planType,
        category: planCategory,
      });

      // Keep your existing "Already Fee Paid" behavior
      if (response?.message === 'Already Fee Paid') {
        toast.success('Payment already completed! Redirecting to signin...');
        clearAuth();
        navigate('/signin');
        return;
      }

      const orderId = response?.data?.orderId;
      const paymentSessionId = response?.data?.paymentSessionId;

      if (!orderId || !paymentSessionId) {
        throw new Error('Invalid payment init response (missing orderId/paymentSessionId).');
      }

      if (!window.Cashfree) throw new Error('Cashfree SDK not available');

      const cashfree = window.Cashfree({ mode: cashfreeMode });

      // Popup modal checkout (keeps SPA intact)
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: '_modal',
      };

      const result = await cashfree.checkout(checkoutOptions);

      // If Cashfree reports an error/cancel
      if (result?.error) {
        toast.error(result?.error?.message || 'Payment cancelled/failed.');
        setLoading(false);
        setCountdown(5);
        return;
      }

      /**
       * Payment ID extraction (optional).
       * Your verify controller DOES NOT require paymentId; it can auto-pick SUCCESS payment.
       * Still, we try to pass it if Cashfree returns any identifier in the resolved payload.
       */
      const possiblePaymentId =
        result?.paymentDetails?.cf_payment_id ||
        result?.paymentDetails?.paymentId ||
        result?.paymentDetails?.payment_id ||
        result?.cf_payment_id ||
        result?.payment_id;

      const ok = await verifyCashfreePayment({
        orderId,
        paymentId: possiblePaymentId ? String(possiblePaymentId) : undefined,
      });

      if (!ok) {
        setLoading(false);
        setCountdown(5);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error(error?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  }, [
    loading,
    cashfreeLoaded,
    planType,
    planCategory,
    cashfreeMode,
    navigate,
    verifyCashfreePayment,
  ]);

  // Load Cashfree SDK once
  useEffect(() => {
    let mounted = true;

    loadCashfreeSdk()
      .then(() => {
        if (mounted) setCashfreeLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Unable to load payment gateway. Please refresh and try again.');
        if (mounted) setCashfreeLoaded(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Countdown + auth rules (kept same intent as your existing logic)
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // If already verified + paid, force re-login (kept same behavior)
    if (user.isVerified && user.isFeePaid) {
      clearAuth();
      navigate('/signin');
      return;
    }

    let timer;

    if (!user.isFeePaid) {
      if (countdown > 0 && cashfreeLoaded) {
        timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      } else if (countdown === 0 && !loading && cashfreeLoaded) {
        handleProceed();
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, user, navigate, loading, handleProceed, cashfreeLoaded]);

  // Loading state for gateway
  if (!cashfreeLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-primary-1 animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-4">
            Loading Payment Gateway...
          </h1>
          <p className="text-slate-600">
            Please wait while we set up the secure payment system.
          </p>
        </motion.div>
      </div>
    );
  }

  // Verification pending state
  if (user?.isFeePaid && !user?.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-4">
            Verification Pending
          </h1>
          <p className="text-slate-600 mb-4">
            Your payment has been received successfully. Our team will verify your details shortly.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-primary-700 text-sm">
              <strong>Next Steps:</strong> You&apos;ll receive an email confirmation once verification is complete.
            </p>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            For any queries, contact us at{' '}
            <span className="font-medium text-primary-1">contactus@openadmits.com</span>
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/signin" className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Signin
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main payment required state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4 bg-primary p-2 rounded-lg shadow-lg">
            <img src="/images/logo-light.svg" alt="openAdmitlogo" className="w-[250px] 0" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Complete Your Registration</h1>
          <p className="text-slate-600">
            Secure your spot and unlock access to premium university guidance
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <University className="w-5 h-5 text-primary" />
                What You&apos;ll Get Access To
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">Personalized University Shortlist</p>
                    <p className="text-slate-600 text-sm">
                      Get matched with 46+ universities based on your profile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">Expert Guidance & Support</p>
                    <p className="text-slate-600 text-sm">
                      Direct access to education consultants and advisors
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">Application Tracking</p>
                    <p className="text-slate-600 text-sm">
                      Monitor your application progress and deadlines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">Document Management</p>
                    <p className="text-slate-600 text-sm">
                      Secure storage and organization of all your documents
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-100 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary-1" />
                <span className="font-medium text-primary-800">Secure Payment</span>
              </div>
              <p className="text-primary-700 text-sm">
                Your payment is protected by industry-standard encryption and security measures.
              </p>
            </div>
          </motion.div>

          {/* Right side - Payment Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-semibold text-primary mb-2">Registration Payment</h2>
              <p className="text-slate-600">Complete your payment to access the dashboard</p>

              <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-primary font-semibold">
                  {planCategory.charAt(0).toUpperCase() + planCategory.slice(1)}{' '}
                  {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  ₹{Number(planPrice || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-primary-100 to-primary-300 rounded-xl p-4 mb-6 border border-emerald-200"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Auto-redirect in</span>
              </div>

              <div className="text-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-primary mb-1"
                >
                  {countdown}
                </motion.div>
                <p className="text-primary-700 text-sm">seconds</p>
              </div>
            </motion.div>

            {/* User Info */}
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <p className="text-primary-800 text-sm mb-1">Registering as:</p>
              <p className="font-medium text-primary-800">{user?.name}</p>
              <p className="text-primary-800 text-sm">{user?.email}</p>
            </div>

            {/* CTA */}
            <Button
              onClick={handleProceed}
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-700 cursor-pointer text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Proceed to Secure Payment
                </div>
              )}
            </Button>

            <p className="text-center text-primary-500 text-xs mt-4">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-slate-500 text-sm"
        >
          <p>
            Need help? Contact us at{' '}
            <span className="text-primary font-medium">contactus@openadmits.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentRequired;

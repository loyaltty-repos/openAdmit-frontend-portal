// src/components/modals/LLMCreditUpgradeModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, Minus, Zap } from 'lucide-react';
import { apiService } from '@/services/api.services';
import { getUserProfile } from '@/services/api.services'; // Import this!

const CREDIT_PACK = 5;
const PRICE_PER_PACK = 50;

export default function LLMCreditUpgradeModal({ open, onClose, onSuccess }) {
    const [credits, setCredits] = useState(CREDIT_PACK);
    const [loading, setLoading] = useState(false);

    const totalPrice = (credits / CREDIT_PACK) * PRICE_PER_PACK;

    const handlePayment = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await apiService.post('/payment/initiateForLLMUpgrade', {
                amount: totalPrice,
            });

            if (!response.data?.orderId) {
                throw new Error('Failed to create payment order');
            }
            onClose()
            const options = {
                key: response.data.key,
                amount: response.data.amount,
                currency: response.data.currency,
                name: 'Goupbroad',
                description: `Buy ${credits} LLM Credits`,
                order_id: response.data.orderId,
                handler: async function (razorpayResponse) {
                    try {
                        const verifyRes = await apiService.post('/payment/verifyForLLMUpgrade', {
                            paymentId: razorpayResponse.razorpay_payment_id,
                            orderId: razorpayResponse.razorpay_order_id,
                            signature: razorpayResponse.razorpay_signature,
                        });

                        if (verifyRes.success || verifyRes.creditsAdded >= 0) {
                            toast.success(`Success! +${verifyRes.creditsAdded || credits} credits added`);

                            // CRITICAL FIX: Re-fetch latest user profile so parent sees updated credits
                            try {
                                await getUserProfile(); // This updates the global user state (via setUser or context)
                                // If your app uses a global auth store, trigger refresh there too
                            } catch (err) {
                                console.warn("Could not refresh profile after payment");
                            }

                            // Now safe to proceed
                            onSuccess?.();
                            onClose();
                        } else {
                            toast.error('Payment verified but credits not added. Contact support.');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Payment verification failed');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                theme: { color: '#145044' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setLoading(false);
            });
            razorpay.open();
        } catch (error) {
            toast.error(error.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        Upgrade Get University Finder Credits
                    </DialogTitle>
                    <DialogDescription>
                        You've used up your free credits to get personalized university recommendations. Buy more credits to continue.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-600">Each pack gives you</p>
                            <p className="text-3xl font-bold text-emerald-700">{CREDIT_PACK} Searches</p>
                            <p className="text-2xl font-semibold mt-2">₹{PRICE_PER_PACK}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCredits(Math.max(CREDIT_PACK, credits - CREDIT_PACK))}
                                disabled={credits === CREDIT_PACK}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>

                            <div className="text-center px-8">
                                <div className="text-4xl font-bold text-emerald-700">{credits}</div>
                                <div className="text-sm text-gray-600">credits</div>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCredits(credits + CREDIT_PACK)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-emerald-200">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total Amount</span>
                                <span className="text-2xl font-bold text-emerald-700">₹{totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 space-y-1">
                        <p>Minimum purchase: 5 credits (₹50)</p>
                        <p>Credits never expire • Instant activation</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-[#145044] hover:bg-[#0f3c34]"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-4 w-4" />
                                Pay ₹{totalPrice} & Unlock
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
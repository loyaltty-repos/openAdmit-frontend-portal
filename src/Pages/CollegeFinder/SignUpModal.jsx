// src/components/questionnaire/SignUpModal.jsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, RefreshCw, Edit2 } from 'lucide-react';
import OTPInput from 'react-otp-input';
import { sendEmailOtp, registerUser } from '@/services/api.services';
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUpModal = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const continueBtnRef = useRef(null);

  // Dynamic Google button width — same logic as SignUp.jsx / SignIn.jsx
  const [googleWidth, setGoogleWidth] = useState(320);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  // Fixed: Measure the actual modal content container (not a missing card)
  useEffect(() => {
    const updateWidth = () => {
      // Target the modal's content area (common in shadcn/ui Dialog)
      const modalContainer = document.querySelector('[role="dialog"]')
        || document.querySelector('.space-y-6') // fallback to our root container
        || document.body;

      const rect = modalContainer.getBoundingClientRect();
      // Same clamping logic as in your main SignUp.jsx / SignIn.jsx
      const clamped = Math.max(280, Math.min(400, Math.floor(rect.width - 48)));
      setGoogleWidth(clamped);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (otpSent && !editingEmail) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(30);
    }
  }, [otpSent, editingEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'confirmPassword') setPasswordError('');
    if (apiError) setApiError('');
  };

  const handleResendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOtpError('');
    const result = await sendEmailOtp(formData.email);
    setIsLoading(false);
    if (result.success) {
      toast.success('OTP resent successfully');
      setOtp('');
      setCountdown(30);
    } else {
      setOtpError(result.error);
    }
  };

  const handleEditEmail = () => {
    setEditingEmail(true);
    setOtpSent(false);
    setOtpError('');
    setOtp('');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setTermsAccepted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setOtpError('');
    setApiError('');

    if (!otpSent) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setPasswordError('Password must be at least 8 characters with a number and a special character');
        return;
      }
      if (!termsAccepted) {
        toast.error('You must agree to the Terms of Service and Privacy Policy');
        return;
      }

      try {
        setIsLoading(true);
        const result = await sendEmailOtp(formData.email);
        if (result.success) {
          setOtpSent(true);
          setEditingEmail(false);
          toast.success('OTP sent to your email');
        } else {
          setApiError(result.error);
        }
      } catch (error) {
        setApiError('Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        setOtpError('Please enter a valid 6-digit OTP');
        return;
      }

      try {
        setIsLoading(true);
        const userData = { email: formData.email, password: formData.password, otp };
        const registerResult = await registerUser(userData);
        if (registerResult.success && registerResult.data?.data?.accessToken) {
          onSuccess(registerResult.data.data.accessToken, registerResult.data.data.user);
          toast.success('Account created successfully!');
        } else {
          setApiError(registerResult.error);
        }
      } catch (error) {
        console.error('Signup failed:', error);
        setApiError(error.response?.data?.message || 'Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse?.credential;
      if (!googleToken) {
        toast.error('Missing Google token');
        return;
      }

      setIsLoading(true);
      setApiError('');
      const userData = { google_credential: googleToken };
      const registerResult = await registerUser(userData);
      if (registerResult.success && registerResult.data?.data?.accessToken) {
        onSuccess(registerResult.data.data.accessToken, registerResult.data.data.user);
        toast.success('Account created successfully!');
      } else {
        setApiError(registerResult.error);
      }
    } catch (error) {
      console.error('Google signup failed:', error);
      setApiError(error.response?.data?.message || 'Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google signup was cancelled');
  };

  const isResendDisabled = isLoading || countdown > 0;

  return (
    // Root container — used as fallback for width measurement
    <div className="w-full max-w-md mx-auto space-y-6">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label>Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 h-12"
              required
              disabled={otpSent && !editingEmail}
            />
          </div>
        </div>

        {/* Password & Confirm */}
        {!otpSent || editingEmail ? (
          <>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12"
                  required
                  disabled={otpSent && !editingEmail}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={otpSent && !editingEmail}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">At least 8 characters with number & special character</p>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
          </>
        ) : null}

        {/* OTP */}
        {otpSent && !editingEmail ? (
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="w-full overflow-hidden">
              <div className="flex justify-center">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderInput={(props) => <input {...props} />}
                  containerStyle={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                  }}
                  inputStyle={{
                    width: '2.5rem',
                    height: '2.5rem',
                    fontSize: '1.1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                  inputMode="numeric"
                />
              </div>
            </div>
            {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
          </div>
        ) : null}

        {/* Edit & Resend */}
        {otpSent && !editingEmail ? (
          <div className="flex justify-between items-center space-x-4">
            <Button type="button" variant="ghost" onClick={handleEditEmail} className="flex-1 justify-start">
              <Edit2 className="h-4 w-4 mr-2" /> Edit Email
            </Button>
            <Button type="button" variant="ghost" onClick={handleResendOtp} disabled={isResendDisabled} className="flex-1">
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
            </Button>
          </div>
        ) : null}

        {/* Continue Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-primary-800 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify & Create Account' : 'Continue')}
        </Button>
      </form>

      {/* Google Button — Now matches main SignUp.jsx exactly */}
      {(!otpSent || editingEmail) && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="w-full flex justify-center overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  ux_mode="popup"
                  shape="rectangular"
                  text="continue_with"
                  size="large"
                  theme="outline"
                  width={googleWidth}
                  disabled={isLoading}
                  containerProps={{
                    className: "w-full flex justify-center overflow-hidden"
                  }}
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </>
      )}
    </div>
  );
};

export default SignUpModal;
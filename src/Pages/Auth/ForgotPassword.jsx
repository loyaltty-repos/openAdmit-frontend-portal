import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, RefreshCw, Edit2 } from 'lucide-react';
import OTPInput from 'react-otp-input';
import { verifyOtp, requestPasswordReset, setNewPassword } from '@/services/api.services'; // Import setNewPassword
import { isAuthenticated } from '@/lib/auth';
import logo from '../../assets/logo.svg';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'newPassword'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [countdown, setCountdown] = useState(60);
const SIGNIN_PATH = import.meta.env.VITE_HOME_PATH ;
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Countdown for resend OTP
  useEffect(() => {
    if (step === 'otp' && !editingEmail) {
      setCountdown(60);
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
    }
  }, [step, editingEmail]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP sent to your email');
      setStep('otp');
      setEditingEmail(false);
    } else {
      setError(result.error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    const result = await verifyOtp({ email, otp });
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP verified');
      setStep('newPassword'); // Only show password fields
    } else {
      setOtpError(result.error);
    }
  };

  // Step 3: Set New Password
  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (newPassword1 !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword1)) {
      setPasswordError('Password must be 8+ chars with a number and special character');
      return;
    }

    setError('');
    setIsLoading(true);
    const password = newPassword1;
    const result = await setNewPassword({ email, otp, password });
    setIsLoading(false);

    if (result.success) {
      toast.success('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/signin'), 2000);
    } else {
      setError(result.error);
    }
  };

  const handleEditEmail = () => {
    setEditingEmail(true);
    setStep('email');
    setOtp('');
    setOtpError('');
    setNewPassword1('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleResendOtp = async () => {
    if (isLoading || countdown > 0) return;
    setIsLoading(true);
    setOtpError('');

    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP resent');
      setOtp('');
      setCountdown(60);
    } else {
      setOtpError(result.error);
    }
  };

  const isResendDisabled = isLoading || countdown > 0;

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-cover bg-center bg-no-repeat flex justify-center items-center"
      style={{ backgroundImage: "url('/heroBg.png')" }} >
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.assign(SIGNIN_PATH)}>
              <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />

            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Reset Your
                <span className="text-[#F2E3BB] block">Account Password</span>
              </h2>
              <p className="text-lg text-white leading-relaxed">
                Enter your email and we’ll send you a secure code to reset your password.
              </p>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">Secure</div>
              <div className="text-sm text-gray-600">256-bit Encryption</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">Fast</div>
              <div className="text-sm text-gray-600">Under 60 Seconds</div>
            </div>
          </div> */}
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center flex-col justify-center">

          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center">
              <div className="flex mx-auto  md:hidden mb-4  items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />

              </div>
              {/* <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">Reset Password</span>
              </div> */}
              <CardTitle className="text-2xl font-bold text-gray-800">
                {step === 'otp' ? 'Verify OTP' : step === 'newPassword' ? 'New Password' : 'Forgot Password'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {step === 'otp'
                  ? `Enter the 6-digit code sent to ${email}`
                  : step === 'newPassword'
                    ? 'Create a strong password'
                    : 'We’ll send a code to your email'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* STEP 1: EMAIL */}
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-800 text-white font-semibold cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Code'}
                  </Button>
                </form>
              )}

              {/* STEP 2: OTP */}
              {/* {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Verification Code</Label>
                    <div className="flex justify-center">
                      <OTPInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        inputStyle={{
                          width: '3rem',
                          height: '3rem',
                          margin: '0 0.5rem',
                          fontSize: '1.25rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                        containerStyle={{ justifyContent: 'center' }}
                        inputMode="numeric"
                        renderInput={(props) => <input {...props} />}
                      />
                    </div>
                    {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
                  </div>

                  <div className="flex justify-between items-center space-x-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 justify-start h-10 px-2 text-primary hover:bg-primary/5"
                      onClick={handleEditEmail}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Email
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 h-10"
                      onClick={handleResendOtp}
                      disabled={isResendDisabled}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : isResendDisabled ? (
                        `Resend in ${countdown}s`
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-800 text-white font-semibold"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </form>
              )} */}
              {/* STEP 2: OTP */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Verification Code</Label>

                    {/* Responsive OTP Container */}
                    <div className="flex justify-center">
                      <div className="w-full max-w-sm px-4">
                        <OTPInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={6}
                          renderInput={(props) => <input {...props} className="outline-none focus:ring-2 focus:ring-primary focus:border-primary" />}
                          containerStyle={{ justifyContent: 'space-between', gap: '0.5rem' }}
                          inputStyle={{
                            width: '100%',
                            maxWidth: '52px',
                            height: '52px',
                            fontSize: '1.25rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                          }}
                          inputMode="numeric"
                          shouldAutoFocus
                        />
                      </div>
                    </div>

                    {otpError && <p className="text-xs text-red-500 text-center -mt-2">{otpError}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 cursor-pointer"
                      onClick={handleEditEmail}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Email
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 cursor-pointer"
                      onClick={handleResendOtp}
                      disabled={isResendDisabled}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        `Resend in ${countdown}s`
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend OTP
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-800 text-white font-semibold"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </form>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {step === 'newPassword' && (
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword1}
                        onChange={(e) => setNewPassword1(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-800 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Reset Password'}
                  </Button>
                </form>
              )}

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/signin" className="text-primary hover:text-primary-600 font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
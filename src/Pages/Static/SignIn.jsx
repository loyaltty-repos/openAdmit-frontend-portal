
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/services/api.services';
import { setAuth, isAuthenticated, getUser, clearAuth } from '@/lib/auth';
import logo from '../../assets/logo.svg';
import { toast } from 'sonner'; // 1. Import the toast function
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleWidth, setGoogleWidth] = useState(320);
  const SIGNIN_PATH = import.meta.env.VITE_HOME_PATH ;
  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  // match Google button width to card width (clamped 240–400)
  useEffect(() => {
    const updateWidth = () => {
      const card = document.getElementById("signin-card");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const clamped = Math.max(280, Math.min(400, Math.floor(rect.width - 48)));

      setGoogleWidth(clamped);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    // Clear any previous session data on component mount
    clearAuth();
  }, []);

  // This effect handles messages passed via state or URL parameters
  useEffect(() => {
    let urlWasCleaned = false;

    // Handle success messages from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clean the state from history
      window.history.replaceState({}, document.title);
    }

    // 2. Check for 'expired' or 'error' parameters in the URL
    const tokenExpired = searchParams.get('expired');
    const authError = searchParams.get('error');

    if (tokenExpired === 'true') {
      setTimeout(() => {
        toast.error('Your session has expired. Please sign in again.');
      }, 0);
      urlWasCleaned = true;
    }

    if (authError) {
      // 3. Display the error from the URL as a toast
      setTimeout(() => {
        toast.error(decodeURIComponent(authError));
      }, 0);
      urlWasCleaned = true;
    }

    // 4. If we showed a toast from a URL param, clean the URL
    if (urlWasCleaned) {
      navigate('/signin', { replace: true });
    }

  }, [location.state, searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);

    try {
      const userData = { email, password };
      const response = await loginUser(userData);
      console.log(response)
      if (response.success) {
        setAuth({
          accessToken: response.data.accessToken,
          user: response.data.user
        });

        const userRole = response.data.user.role;

        if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
          navigate('/admin/dashboard');
        } else {
          if (!response.data.user.isFeePaid || !response.data.user.isVerified) {
            navigate('/pricing', { state: { fromAuth: true, user: response.data.user } });
          } else {
            const redirectPath = location.state?.from || '/dashboard';
            navigate(redirectPath);
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
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
      const response = await loginUser(userData);
      console.log(response)
      if (response.success) {
        setAuth({
          accessToken: response.data.accessToken,
          user: response.data.user
        });

        const userRole = response.data.user.role;

        if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
          navigate('/admin/dashboard');
        } else {
          if (!response.data.user.isFeePaid || !response.data.user.isVerified) {
            navigate('/pricing', { state: { fromAuth: true, user: response.data.user } });
          } else {
            const redirectPath = location.state?.from || '/dashboard';
            navigate(redirectPath);
          }
        }
      }
    } catch (error) {
      console.error('Google login failed:', error);
      const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google login was cancelled');
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-cover bg-center bg-no-repeat flex justify-center items-center"
      style={{ backgroundImage: "url('/heroBg.png')" }} >      <div className="mx-auto w-full max-w-6xl px-2 py-6 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 cursor-pointer"   onClick={() => window.location.assign(SIGNIN_PATH)}>
                <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />
                {/* <h1 className="text-3xl font-bold text-primary-700"></h1> */}
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  Welcome Back to Your
                  <span className="text-[#F2E3BB] block">Study Journey</span>
                </h2>
                <p className="text-lg text-white leading-relaxed">
                  Continue exploring thousands of universities worldwide and connect with a global community of students pursuing their dreams.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-primary-700">150+</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-primary-700">Alumni in 10+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-primary-700">1k+</div>
                <div className="text-sm text-gray-600">Students Helped</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-primary-700">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="flex items-center flex-col justify-center">

            <Card id="signin-card" className="w-full max-w-md shadow-2xl border-0">
              <div className="flex mx-auto mt-2 md:hidden  items-center space-x-3 cursor-pointer"   onClick={() => window.location.assign(SIGNIN_PATH)}>
                <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />

              </div>
              {/* <div className="flex mx-auto md:hidden  items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Goupbroadlogo" className='w-[50px] h-[50px] ' />
              <h1 className="text-3xl font-bold text-primary-700">Goupbroad</h1>
            </div> */}
              <CardHeader className="space-y-2 text-center">
                {/* <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                  <div className="bg-primary p-2 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-primary">StudyAbroad</span>
                </div> */}
                <CardTitle className="text-2xl font-bold text-gray-800">Sign In</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                    {successMessage}
                  </div>
                )}
                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {apiError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (apiError) setApiError('');
                        }}
                        className="pl-10 h-12 border-gray-200 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (apiError) setApiError('');
                        }}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked)}
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-600 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary-800 cursor-pointer text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
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
                        width={googleWidth}
                        containerProps={{
                          className: "w-full flex justify-center overflow-hidden"
                        }}
                      />
                    </div>
                  </GoogleOAuthProvider>
                </div>


                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-primary hover:text-primary-600 font-medium">
                      Sign up here
                    </Link>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
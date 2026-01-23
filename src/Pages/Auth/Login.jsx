import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/services/api.services';
import { setAuth, isAuthenticated, getUser, clearAuth } from '@/lib/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  useEffect(() => {
    clearAuth();

    if (isAuthenticated()) {
      const user = getUser();
      if (!user.isFeePaid || !user.isVerified) {
        navigate('/auth/payment-required');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }

    const tokenExpired = searchParams.get('expired');
    if (tokenExpired === 'true') {
      setApiError('Your session has expired. Please log in again.');
    }
  }, [location.state, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError('');

    try {
      setIsLoading(true);

      const userData = {
        email: formData.email,
        password: formData.password
      };

      const response = await loginUser(userData);

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
            navigate('/auth/payment-required');
          } else {
            const redirectPath = location.state?.from || '/dashboard';
            navigate(redirectPath);
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);

      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Invalid email or password. Please try again.');
      } else {
        setApiError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row">

      <div className="w-full md:w-full p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">

          <div className="mb-10">
            <img src="/logo.svg" alt="Goupbroad Logo" className="h-10 w-10" />
          </div>

          <h1 className="text-2xl font-semibold mb-2">Login</h1>
          <p className="text-gray-600 mb-8">Don&apos;t have an account? <Link to="/signup" className="text-primary-1 hover:underline">Sign Up</Link></p>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-1/50 focus:border-primary-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-500 flex items-center"
                >
                  {showPassword ? 'Hide' : 'Show'}
                  {showPassword ? <EyeOff className="ml-1 h-4 w-4" /> : <Eye className="ml-1 h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-1/50 focus:border-primary-1"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-primary-1 hover:bg-primary-1/90 text-white py-2 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-primary-1 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to Goupbroad&apos;s <a href="#" className="text-primary-1 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-1 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-gray-900 relative overflow-hidden">
        <img
          src="/auth.png"
          alt="Abstract 3D shapes"
          className="w-full h-screen object-center"
        />
      </div>
    </div>
  );
};

export default Login;
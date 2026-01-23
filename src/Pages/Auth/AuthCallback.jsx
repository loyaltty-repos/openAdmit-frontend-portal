// src/Pages/Auth/AuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuth } from '@/lib/auth'; // Adjust path if needed
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accesstoken');
    const userParam = searchParams.get('user');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'; // Default to dashboard

    if (accessToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setAuth({ accessToken, user });

        // If redirecting to pricing, pass the user object in state
        if (redirectTo === '/pricing') {
          navigate(redirectTo, { replace: true, state: { fromAuth: true, user } });
        } else {
          navigate(redirectTo, { replace: true });
        }
      } catch (err) {
        console.error('Auth callback failed:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/signin', { replace: true });
      }
    } else {
      // If no tokens are present, something went wrong.
      toast.error('Invalid authentication redirect.');
      navigate('/signin', { replace: true });
    }
  }, [navigate, searchParams]);

  // Render a loading state while processing
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authenticating, please wait...</h2>
    </div>
  );
};

export default AuthCallback;
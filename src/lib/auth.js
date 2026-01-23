import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  expires: 1,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'strict',
  path: '/'
};


const authListeners = [];

export function subscribeToAuth(listener) {
  authListeners.push(listener);
  return () => {
    const index = authListeners.indexOf(listener);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
}

function notifyAuthChange(isAuthenticated) {
  authListeners.forEach(listener => listener(isAuthenticated));
}

export function setAuth(authData) {
  if (!authData) return;

  logout();

  if (authData.accessToken) {
    localStorage.setItem('authToken', authData.accessToken);
    Cookies.set('accessToken', authData.accessToken, COOKIE_OPTIONS);
  }

  if (authData.user) {
    localStorage.setItem('user', JSON.stringify(authData.user));
  }


  notifyAuthChange(true);
}

export function getToken() {
  const cookieToken = Cookies.get('accessToken');
  if (cookieToken) return cookieToken;

  return localStorage.getItem('authToken');
}

export function clearAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  Cookies.remove('accessToken', COOKIE_OPTIONS);
  notifyAuthChange(false);
}

export function getUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

export function updateUserData(userData) {
  if (!userData) return;
  localStorage.setItem('user', JSON.stringify(userData));
  notifyAuthChange(true);
}

export function isAuthenticated() {
  return !!getToken();
}
export function clearCollegeFinderCache() {
  const prefix = 'college_finder_cache_';
  // console.log(prefix)
  // Remove ALL keys that start with the prefix (covers guest + any logged-in user)
  Object.keys(localStorage)
    .filter(key => key.startsWith(prefix))
    .forEach(key => {
      console.log('Clearing college finder cache:', key);
      localStorage.removeItem(key);
    });
}
export function logout() {
  clearAuth();
  clearCollegeFinderCache();
}

export function getUserInitials() {
  const user = getUser();
  if (!user) return 'GU';

  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }

  if (user.email) {
    const emailParts = user.email.split('@');
    if (emailParts[0]) {
      const nameParts = emailParts[0].split('.');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return emailParts[0].substring(0, 2).toUpperCase();
    }
  }

  return 'NU';
}

export function isAdminRoute(pathname) {
  return pathname.startsWith('/admin') && pathname !== '/admin/login';
}

export function isPublicRoute(pathname) {
  const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/admin/login'];
  return publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(`${route}/`));
}
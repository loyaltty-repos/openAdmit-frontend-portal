import { useState, useEffect } from 'react';
import { Menu, MonitorCheck, MonitorX, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAuthenticated, subscribeToAuth } from '@/lib/auth';
import PropTypes from 'prop-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function ServerStatusIndicator({ status }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {status ? <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <MonitorCheck color="#145044" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Server Online</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
        :
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MonitorX color="red" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Server Offline</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    </div>
  );
}

export const Navbar = ({ status }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isOnline = status;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {

    setIsLoggedIn(isAuthenticated());


    const unsubscribe = subscribeToAuth((authenticated) => {
      setIsLoggedIn(authenticated);
    });

    return () => unsubscribe();
  }, []);

  const buttonText = isLoggedIn ? 'Dashboard' : 'Get Started';
  const buttonPath = isLoggedIn ? '/dashboard' : '/signup';

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold">Goupbroad</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/about-us"
              className="text-sm font-medium text-gray-700 hover:text-primary-1 dark:text-gray-300 transition-colors"
            >
              About Us
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-primary-1 dark:text-gray-300 dark:hover:text-primary-1 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-primary-1 dark:text-gray-300 dark:hover:text-primary-1 transition-colors"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-between justify-between gap-6">
            <ServerStatusIndicator status={isOnline} />
            <Link to={buttonPath} className="group hidden md:inline-flex py-2 relative px-1.5 text-base text-primary-1 dark:text-primary-1">
              <span className="absolute inset-0 border border-dashed border-primary-1 bg-primary-1/10 group-hover:bg-primary-1/20 dark:border-primary-1"></span>
              {buttonText}
              <svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] left-[-2px] fill-primary-1 dark:fill-primary-1"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
              <svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] right-[-2px] fill-primary-1 dark:fill-primary-1"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
              <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-primary-1 dark:fill-primary-1"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
              <svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] bottom-[-2px] fill-primary-1 dark:fill-primary-1"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
            </Link>
            <button
              className="md:hidden text-primary-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-1 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-1 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-1 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-1 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-1 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-1 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <Link
              to={buttonPath}
              className="block px-3 py-2 rounded-md text-base font-medium text-primary-1 hover:bg-gray-50 dark:text-primary-1 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              {buttonText}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

ServerStatusIndicator.propTypes = {
  status: PropTypes.bool.isRequired,
};

Navbar.propTypes = {
  status: PropTypes.bool.isRequired,
};

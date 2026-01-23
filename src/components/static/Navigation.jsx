
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { isAuthenticated, subscribeToAuth } from '@/lib/auth';
import logo from '../../assets/logo.svg'
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    const unsubscribe = subscribeToAuth((authenticated) => {
      setIsLoggedIn(authenticated);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: 'University Finder', href: '/university-finder' },
    // { name: 'Scholarships', href: '#scholarships' },
    // { name: 'Communit'y', href: '/community' },
    { name: 'CGPA To GPA', href: '/cgp-to-gpa-converter' },
    { name: 'About', href: '/about' },
    { name: 'Plans & Pricing', href: '/pricing' }
  ];

  const buttonText = isLoggedIn ? 'Dashboard' : 'Get Started';
  const buttonPath = isLoggedIn ? '/dashboard' : '/signin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}

          <div className="flex-shrink-0 cursor-pointer" onClick={() => {
            navigate('/')
          }}>
            <div className='flex items-center justify-center gap-2'>

              <img src={logo} alt="Goupbroad logo" className='w-[50px] h-[50px]' />
              <h1 className="text-3xl font-bold text-[#145044] ">Goupbroad</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to={buttonPath}>
              <Button className="bg-primary-700  text-white">
                {buttonText}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
              <div className="pt-2">
                <Link to={buttonPath}>
                  <Button className="w-full bg-primary-700 text-white">
                    {buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

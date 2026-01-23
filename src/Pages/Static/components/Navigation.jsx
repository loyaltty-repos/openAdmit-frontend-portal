import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, FileText, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { isAuthenticated, subscribeToAuth, logout } from '@/lib/auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// const BASE_URL = 'https://openadmits.com';
const BASE_URL = import.meta.env.VITE_HOME_PATH;
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState('mba'); // for desktop dropdown
  const SIGNIN_PATH = import.meta.env.VITE_HOME_PATH;
  const [isPaid, setIsPaid] = useState(false);
 useEffect(() => {
  const syncAuth = () => {
    const authed = isAuthenticated();
    setIsLoggedIn(authed);

    const raw = localStorage.getItem("user"); // change if needed
    const user = raw ? JSON.parse(raw) : null;
console.log(user)
    const paid =
      user?.isFeePaid === true ||
      user?.subscriptionActive === true ||
      user?.planDetails?.planId ||
      user?.plan === "paid" ||
      user?.paymentStatus === "PAID" ||
      user?.paymentStatus === "SUCCESS";

    setIsPaid(paid);

    // Debug (remove after checking)
    console.log("authed:", authed, "paid:", paid, "user:", user);
  };

  syncAuth();
  const unsubscribe = subscribeToAuth(syncAuth);
  return () => unsubscribe();
}, []);




  const isPricingPage = location.pathname === '/pricing';

  const SIGNIN_URL = SIGNIN_PATH; // ✅ alias so you can keep window.location.assign

  let buttonText = "Sign in";
  let buttonPath = SIGNIN_URL;     // used only when we render <Link>
  let buttonOnClick = () => window.location.assign(SIGNIN_URL);

  // Logged in:
  if (isLoggedIn) {
    if (isPaid) {
      buttonText = "Dashboard";
      buttonPath = "/dashboard";
      buttonOnClick = undefined; // use <Link>
    } else {
      buttonText = "Logout";
      buttonPath = "#";
      buttonOnClick = () => {
        logout();
        navigate("/");
      };
    }
  }


  // Pricing page special-case (optional)
  if (isPricingPage && isLoggedIn) {
    if (isPaid) {
      buttonText = "Dashboard";
      buttonPath = "/dashboard";
      buttonOnClick = undefined;
    } else {
      buttonText = "Logout";
      buttonPath = "#";
      buttonOnClick = () => {
        logout();
        navigate("/");
      };
    }
  }
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#031A30]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-16 flex items-center justify-between h-16 text-white">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => window.location.assign(SIGNIN_PATH)}>
          <img src="/images/logo-light.svg" alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-8">
            {/* Services Dropdown */}
            <div
              className="relative group"
              onMouseLeave={() => setHoveredCategory('mba')}
            >
              <button className="flex items-center gap-1 text-white/90 hover:text-[#F2E3BB] bg-transparent text-sm font-medium">
                Services
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full pt-2 opacity-0 invisible border border-white rounded-md group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-[#00162B] rounded-md shadow-lg">
                  <div className="p-4 lg:w-[920px]">
                    <div className="grid grid-cols-12 gap-6">
                      {/* Left Column - Categories */}
                      <div className="col-span-5 flex flex-col gap-8 rounded-lg bg-[#071F37] p-4">
                        <div>
                          <div className="mb-2 text-sm text-white/60 uppercase tracking-wider">
                            Category
                          </div>
                          <a
                            href={`${BASE_URL}/services/mba-admissions-consulting`}
                            className="flex items-center justify-between font-semibold text-white text-xl hover:text-[#F2E3BB]"
                            onMouseEnter={() => setHoveredCategory('mba')}
                          >
                            MBA Admissions Consulting
                            <ChevronRight className="h-5 w-5 text-white/60" />
                          </a>
                        </div>

                        <div className="space-y-6 text-xl">
                          <a
                            href={`${BASE_URL}/services/graduate-admissions`}
                            className="block font-semibold text-white hover:text-[#F2E3BB]"
                          >
                            Master’s
                          </a>
                          <a
                            href={`${BASE_URL}/services/undergraduate-admissions`}
                            className="block font-semibold text-white hover:text-[#F2E3BB]"
                          >
                            Undergrad
                          </a>
                          <a
                            href={`${BASE_URL}/services/6th-8th-grade`}
                            className="flex items-center justify-between font-semibold text-white text-xl hover:text-[#F2E3BB]"
                            onMouseEnter={() => setHoveredCategory('pre-college')}
                          >
                            Pre-College Programs
                            <ChevronRight className="h-5 w-5 text-white/60" />
                          </a>
                          <a
                            href={`${BASE_URL}/services/a-la-carte-services`}
                            className="block font-semibold text-white hover:text-[#F2E3BB]"
                          >
                            A-La-Carte Services
                          </a>
                        </div>
                      </div>

                      {/* Right Column - Dynamic Packages */}
                      <div className="col-span-7">
                        {hoveredCategory === 'mba' ? (
                          <ul className="space-y-4">
                            <li><a href={`${BASE_URL}/services/mba-admissions-consulting/comprehensive-mba-packages`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Comprehensive MBA Packages</a></li>
                            <li><a href={`${BASE_URL}/services/mba-admissions-consulting/deferred-mba-packages`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Deferred MBA Packages</a></li>
                            <li><a href={`${BASE_URL}/services/mba-admissions-consulting/emba-packages`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">EMBA packages</a></li>
                            <li><a href={`${BASE_URL}/services/mba-admissions-consulting/mba-interview-preparation`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">MBA Interview Preparation</a></li>
                            <li><a href={`${BASE_URL}/services/mba-admissions-consulting/mba-ding-analysis`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">MBA Ding Analysis</a></li>
                          </ul>
                        ) : (
                          <ul className="space-y-4">
                            <li><a href={`${BASE_URL}/services/6th-8th-grade`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Grades 6-8</a></li>
                            <li><a href={`${BASE_URL}/services/9th-10th-grade`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Grades 9-10</a></li>
                            <li><a href={`${BASE_URL}/services/11th-grade`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Grade 11</a></li>
                            <li><a href={`${BASE_URL}/services/12th-grade`} className="block rounded-md p-3 font-semibold text-lg text-white hover:bg-[#0C2A4A]">Grade 12</a></li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <a href={`${BASE_URL}/success-stories`} className="text-white/90 hover:text-[#F2E3BB] text-sm font-medium">
              Success Stories
            </a>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/90 hover:text-[#F2E3BB] bg-transparent text-sm font-medium">
                Resources
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-[#00162B] rounded-md shadow-lg p-3 min-w-[280px]">
                  <a href={`${BASE_URL}/blog`} className="flex items-center gap-2 rounded-md p-3 text-white hover:bg-[#0C2A4A]">
                    <BookOpen className="size-5 text-white" />
                    <div className="font-medium">Blog</div>
                  </a>
                  <a href={`${BASE_URL}/case-studies`} className="flex items-center gap-2 rounded-md p-3 text-white hover:bg-[#0C2A4A]">
                    <FileText className="size-5 text-white" />
                    <div className="font-medium">Case Studies</div>
                  </a>
                </div>
              </div>
            </div>

            {/* About Us */}
            <a href={`${BASE_URL}/about-us`} className="text-white/90 hover:text-[#F2E3BB] text-sm font-medium">
              About Us
            </a>

            {/* Contact */}
            <a href="https://tally.so/r/wdBxJK" className="text-white/90 hover:text-[#F2E3BB] text-sm font-medium">
              Contact
            </a>

            {/* Free Webinar */}
            {/* <a
              href="https://luma.com/user/openatlas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#F2E3BB] hover:text-[#F2E3BB] text-sm font-medium rounded-md px-3 py-2 hover:bg-[#F2E3BB]/10"
            >
              Free Webinar
              <ExternalLink className="size-4" />
            </a> */}
          </div>
        </div>

        {/* Desktop CTA - Book Free Consultation */}
        <div className="hidden md:block">
          <Button
            asChild={!buttonOnClick}
            variant="outline"
            className="group cursor-pointer mr-2 gap-1 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={buttonOnClick}
          >
            {buttonOnClick ? (
              <span className="inline-flex items-center gap-1">
                {buttonText}
                <ChevronRight className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
              </span>
            ) : (
              <Link to={buttonPath}>
                {buttonText}
                <ChevronRight className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
              </Link>
            )}
          </Button>

          <Button
            asChild
            className="group cursor-pointer gap-1 rounded-full border border-[#F2E3BB] bg-transparent text-[#F2E3BB] hover:bg-transparent hover:text-[#F2E3BB]"
          >
            <a
              href="https://meet.openadmits.com/#/IvyLeague"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Your Free Consultation
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#00162B] text-white">
          <div className="flex h-[calc(100vh-64px)] flex-col overflow-y-auto">
            <div className="flex-1 p-4">
              <Accordion type="single" collapsible defaultValue="services" className="w-full">
                <AccordionItem value="services" className="border-none">
                  <AccordionTrigger className="py-4 text-left text-lg font-semibold hover:no-underline">
                    Services
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {/* MBA */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value="mba" className="border-none">
                          <AccordionTrigger className="py-2 text-left font-semibold hover:no-underline">
                            MBA Admissions Consulting
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {[
                                'comprehensive-mba-packages',
                                'deferred-mba-packages',
                                'emba-packages',
                                'mba-interview-preparation',
                                'mba-ding-analysis',
                              ].map((slug) => (
                                <a
                                  key={slug}
                                  href={`${BASE_URL}/services/mba-admissions-consulting/${slug}`}
                                  className="block rounded-md p-3 text-left hover:bg-[#0C2A4A]"
                                  onClick={closeMobileMenu}
                                >
                                  {slug
                                    .replace(/-/g, ' ')
                                    .replace('mba', 'MBA')
                                    .replace('emba', 'EMBA')
                                    .split(' ')
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(' ')}
                                </a>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Simple Links */}
                      <div className="flex flex-col gap-4">
                        <a href={`${BASE_URL}/services/graduate-admissions`} className="font-semibold" onClick={closeMobileMenu}>Master's</a>
                        <a href={`${BASE_URL}/services/undergraduate-admissions`} className="font-semibold" onClick={closeMobileMenu}>Undergrad</a>
                        <a href={`${BASE_URL}/services/a-la-carte-services`} className="font-semibold" onClick={closeMobileMenu}>A-La-Carte Services</a>
                      </div>

                      {/* Pre-College */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value="precollege" className="border-none">
                          <AccordionTrigger className="py-2 text-left font-semibold hover:no-underline">
                            Pre-College Programs
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <a href={`${BASE_URL}/services/6th-8th-grade`} className="block rounded-md p-3 text-left hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Grades 6-8</a>
                              <a href={`${BASE_URL}/services/9th-10th-grade`} className="block rounded-md p-3 text-left hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Grades 9-10</a>
                              <a href={`${BASE_URL}/services/11th-grade`} className="block rounded-md p-3 text-left hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Grade 11</a>
                              <a href={`${BASE_URL}/services/12th-grade`} className="block rounded-md p-3 text-left hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Grade 12</a>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 space-y-2">
                <a href={`${BASE_URL}/success-stories`} className="block rounded-md p-3 text-lg font-medium hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Success Stories</a>

                <Accordion type="single" collapsible>
                  <AccordionItem value="resources" className="border-none">
                    <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">Resources</AccordionTrigger>
                    <AccordionContent>
                      <a href={`${BASE_URL}/blog`} className="flex items-center gap-2 rounded-md p-3 hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>
                        <BookOpen className="size-4" /> <span className="font-medium">Blog</span>
                      </a>
                      <a href={`${BASE_URL}/case-studies`} className="flex items-center gap-2 rounded-md p-3 hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>
                        <FileText className="size-4" /> <span className="font-medium">Case Studies</span>
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <a href={`${BASE_URL}/about-us`} className="block rounded-md p-3 text-lg font-medium hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>About Us</a>
                <a href="https://tally.so/r/wdBxJK" className="block rounded-md p-3 text-lg font-medium hover:bg-[#0C2A4A]" onClick={closeMobileMenu}>Contact</a>
                {/* <a
                  href="https://luma.com/user/openatlas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md p-3 text-lg font-medium text-[#F2E3BB] hover:bg-[#F2E3BB]/10 border border-[#F2E3BB]/30"
                  onClick={closeMobileMenu}
                >
                  Free Webinar <ExternalLink className="size-4" />
                </a> */}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="border-t border-white/10 p-4 flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="group cursor-pointer gap-1 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/">
                  Sign in
                  <ChevronRight className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                className="w-full cursor-pointer gap-1 rounded-full border border-[#F2E3BB] bg-transparent text-[#F2E3BB] hover:bg-transparent hover:text-[#F2E3BB] group"
              >
                <a
                  href="https://meet.openadmits.com/#/IvyLeague"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Your Free Consultation
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
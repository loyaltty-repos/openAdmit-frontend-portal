import { Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-gray-300 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/images/logo-light.svg" alt="openAdmitlogo" className='w-[250px] 0 ' />

        </div>
        <p className="text-gray-200">
          © {new Date().getFullYear()} Open Admits. Maintained by{' '}
          <span className="text-primary-2 font-semibold">Open Admits</span>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
import { Link } from "react-router-dom";


const BASE_URL = import.meta.env.VITE_HOME_PATH;
export default function Footer() {

  return (
    <footer className="bg-[#002041] border-t-4 border-t-[#183B5D]">
      <div className="mx-auto w-full max-w-screen-xl p-8 lg:py-8 text-[#B3D3F3]">
        <div className="flex flex-col md:flex-row md:justify-between">
          {/* Company Info */}
          <div className="mb-6 flex flex-col gap-2 md:mb-0">
            <img
              src="/images/logo-light.svg"
              alt="OpenAdmits Logo"
              width={248}
              height={14}
              className="mb-2"
            />
            <span className="text-sm max-w-sm">
              Mowry Ave, Fremont, CA 94538
            </span>
            <a
              href="mailto:contactus@openadmits.com"
              className="text-sm hover:underline"
            >
              contactus@openadmits.com
            </a>
            <span className="text-sm">
              © {new Date().getUTCFullYear()} OpenAdmits. All Rights Reserved.
            </span>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {/* Quick Links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Quick Links
              </h2>
              <ul className="font-medium">
                <li className="mb-4">
                  <Link to={`${BASE_URL}`} className="hover:underline">
                    Home
                  </Link>
                </li>
                {/* <li className="mb-4">
                  <Link to="/pricing" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li className="mb-4">
                  <Link to="/premium" className="hover:underline">
                    Premium
                  </Link>
                </li> */}
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/success-stories?id=12234jiwuijduiwdeuiwhduiedh`}
                    className="hover:underline"
                  >
                    Success Stories
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/case-studies`}
                    className="hover:underline"
                  >
                    Case Studies
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/blog`}
                    className="hover:underline"
                  >
                    Blogs
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/about-us`}
                    className="hover:underline"
                  >
                    About Us
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://tally.so/r/wdBxJK"
                    className="hover:underline"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Follow us
              </h2>
              <ul className="font-medium">
                <li className="mb-4">
                  <a
                    href="https://www.linkedin.com/company/openadmits/"
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://m.facebook.com/61575283220530/"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href="https://www.instagram.com/openadmits/"
                    className="hover:underline"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Legal
              </h2>
              <ul className="font-medium">
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/terms-and-conditions`}
                    className="hover:underline"
                  >
                    Terms &amp; Conditions
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/refund-policy`}
                    className="hover:underline"
                  >
                    Refund Policy
                  </a>
                </li>
                <li className="mb-4">
                  <a
                    href={`${BASE_URL}/privacy-policy`}
                    className="hover:underline"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
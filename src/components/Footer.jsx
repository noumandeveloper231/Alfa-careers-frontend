import { Facebook, X, Linkedin, Instagram, Youtube, Monitor, ChevronDown } from "lucide-react";
import { useState } from "react";
import FooterBottom from "./FooterBottom";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

const Footer = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const location = useLocation();
  return (
    <footer className={`${(
      location.pathname.includes('/dashboard') ||
      location.pathname.includes('/admin') ||
      location.pathname.includes('/login') ||
      location.pathname.includes('/register')
    ) ? 'hidden' : 'block'} bg-white border-t border-gray-200 text-gray-700`}>

      {/* Newsletter Pre-footer */}
      <div className="border border-gray-200 py-12">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-6">
          {/* Left side - Icon, Title and Description */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-gray-900 mb-1">
                Subscribe to our newsletter
              </span>
              <span className="text-md text-gray-600">
                We'll keep you updated with the best new jobs.
              </span>
            </div>
          </div>

          {/* Right side - Email Input and Subscribe Button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="!rounded-full"
            />
            <button onClick={() => toast.info("Feature is not available yet")} className="primary-btn">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 ">
          <div className="py-12 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {/* About Us */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-4">About Us</h4>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Alfa Careers is a job portal that specializes in connecting job
                seekers with employers in need of skilled professionals. We
                provide a user-friendly platform for employers to post job
                openings and for job seekers to browse and apply for suitable
                positions.
              </p>
              <p className="text-sm mb-1">
                <span className="font-semibold">T.</span> (00) 658 54332
              </p>
              <p className="text-sm">
                <span className="font-semibold">E.</span>{" "}
                <a href="mailto:hello@uxper.co" className="hover:underline">
                  hello@alfacareers.com
                </a>
              </p>
            </div>

            {/* Company */}
            <div>
              <span
                onClick={() => toggleSection('company')}
                className="flex md:hidden items-center justify-between w-full text-lg font-semibold mb-4 text-left"
              >
                Company
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.company ? 'rotate-180' : ''}`} />
              </span>
              <h4 className="hidden md:block text-lg font-semibold mb-4">Company</h4>
              <ul className={`space-y-4 text-sm text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${openSections.company ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100 md:block`}>
                <li><Link to={'/about-us'} className="hover:text-[var(--primary-color)]">About us</Link></li>
                <li><Link to={'/jobs'} className="hover:text-[var(--primary-color)]">Career</Link></li>
                <li><Link to={'/blogs'} className="hover:text-[var(--primary-color)]">Blogs</Link></li>
                <li><Link to={'/faqs'} className="hover:text-[var(--primary-color)]">FAQ's</Link></li>
                <li><Link to={'/contact'} className="hover:text-[var(--primary-color)]">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <span
                onClick={() => toggleSection('services')}
                className="flex md:hidden items-center justify-between w-full text-lg font-semibold mb-4 text-left"
              >
                Services
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.services ? 'rotate-180' : ''}`} />
              </span>
              <h4 className="hidden md:block text-lg font-semibold mb-4">Services</h4>
              <ul className={`space-y-4 text-sm text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${openSections.services ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100 md:block`}>
                <li><Link to={'/jobs'} className="hover:text-[var(--primary-color)]">Jobs</Link></li>
                <li><Link to={'/companies'} className="hover:text-[var(--primary-color)]">Companies</Link></li>
                <li><Link to={'/candidates'} className="hover:text-[var(--primary-color)]">Candidates</Link></li>
                <li><Link to={'/pricing'} className="hover:text-[var(--primary-color)]">Pricing</Link></li>
                <li><Link to={'/employer-landing'} className="hover:text-[var(--primary-color)]">Partner</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <span
                onClick={() => toggleSection('support')}
                className="flex md:hidden items-center justify-between w-full text-lg font-semibold mb-4 text-left"
              >
                Support
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.support ? 'rotate-180' : ''}`} />
              </span>
              <h4 className="hidden md:block text-lg font-semibold mb-4">Support</h4>
              <ul className={`space-y-4 text-sm text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${openSections.support ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100 md:block`}>
                <li><Link to="/privacy-policy" className="hover:text-[var(--primary-color)]">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-[var(--primary-color)]">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[var(--primary-color)]">Help Center</a></li>
                <li><a href="#" className="hover:text-[var(--primary-color)]">Updates</a></li>
                <li><a href="#" className="hover:text-[var(--primary-color)]">Documentation</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <span
                onClick={() => toggleSection('connect')}
                className="flex md:hidden items-center justify-between w-full text-lg font-semibold mb-4 text-left"
              >
                Connect
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.connect ? 'rotate-180' : ''}`} />
              </span>
              <h4 className="hidden md:block text-lg font-semibold mb-4">Connect</h4>
              <ul className={`space-y-4 text-sm text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${openSections.connect ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100 md:block`}>
                <li className="flex items-center gap-2">
                  <Linkedin size={20} /> Linkedin
                </li>
                <li className="flex items-center gap-2">
                  <X size={20} /> X
                </li>
                <li className="flex items-center gap-2">
                  <Facebook size={20} /> Facebook
                </li>
                <li className="flex items-center gap-2">
                  <Instagram size={20} /> Instagram
                </li>
                <li className="flex items-center gap-2">
                  <Youtube size={20} /> Youtube
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Line */}
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

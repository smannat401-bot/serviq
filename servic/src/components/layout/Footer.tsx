import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#060a14] border-t border-gray-200 dark:border-gray-800 transition-colors pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="group inline-block">
              <Logo size="sm" />
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We Care | We Fix | We Deliver.
              <br />
              The premium marketplace for trusted local repair experts.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-brand-electricBlue transition-colors text-sm font-medium">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-brand-electricBlue transition-colors text-sm font-medium">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-brand-electricBlue transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-brand-electricBlue transition-colors text-sm font-medium">LinkedIn</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Find Partners</Link></li>
              <li><Link to="/categories" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Services Directory</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">How it Works</Link></li>
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6">For Partners</h4>
            <ul className="space-y-3">
              <li><Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Join as a Pro</Link></li>
              <li><Link to="/worker-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Partner Dashboard</Link></li>
              <li><Link to="/success-stories" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Success Stories</Link></li>
              <li><Link to="/community" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Community Forum</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">About Us</Link></li>
              <li><a href="tel:6283622025" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors flex items-center gap-2">Customer Support: 6283622025</a></li>
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue dark:hover:text-brand-gold text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} SERVIQ Technologies Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-500">Made with ❤️ in Silicon Valley</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

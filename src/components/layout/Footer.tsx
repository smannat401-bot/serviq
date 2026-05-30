import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { Mail, Phone, Globe, MessageCircle, Share2, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-white/5 transition-colors pt-12 lg:pt-24 pb-8 lg:pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10 lg:mb-20">
          {/* Brand */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:space-y-8">
            <Link to="/" className="group inline-block">
              <Logo size="sm" />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-sm">
              Connecting elite repair professionals with clients who value quality, speed, and reliability.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: MessageCircle, href: '#' },
                { icon: Share2, href: '#' },
                { icon: Globe, href: '#' },
                { icon: Users, href: '#' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-brand-electricBlue hover:text-white transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Quick Links */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="font-bold text-brand-black dark:text-white mb-6 lg:mb-8 text-xl">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Find Partners</Link></li>
              <li><Link to="/categories" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Services</Link></li>
              <li><Link to="/pricing" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Pricing Plans</Link></li>
              <li><Link to="/how-it-works" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Workflow</Link></li>
            </ul>
          </div>

          {/* For Workers */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="font-bold text-brand-black dark:text-white mb-6 lg:mb-8 text-xl">Partners</h4>
            <ul className="space-y-4">
              <li><Link to="/register" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Join as Pro</Link></li>
              <li><Link to="/worker-dashboard" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Dashboard</Link></li>
              <li><Link to="/success-stories" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Success Stories</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="font-bold text-brand-black dark:text-white mb-6 lg:mb-8 text-xl">Get in Touch</h4>
            <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
              <a href="mailto:support@serviq.com" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue">
                   <Mail size={18} />
                </div>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-brand-electricBlue transition-colors">support@serviq.com</span>
              </a>
              <a href="tel:6283622025" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                   <Phone size={18} />
                </div>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-brand-gold transition-colors">6283622025</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 lg:pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 text-center lg:text-left">
          <p className="text-xs lg:text-sm text-gray-500 font-medium">
            © {new Date().getFullYear()} SERVIQ Technologies. Empowering professionals across India.
          </p>
          <div className="flex gap-6 lg:gap-8 text-xs lg:text-sm font-bold">
            <Link to="/privacy" className="text-gray-400 hover:text-brand-electricBlue transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-brand-electricBlue transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

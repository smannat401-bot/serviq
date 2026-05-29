import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { Mail, Phone, Globe, MessageCircle, Share2, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-white/5 transition-colors pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand */}
          <div className="md:col-span-4 space-y-8">
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
          <div className="hidden md:block md:col-span-1"></div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-brand-black dark:text-white mb-8 text-xl">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Find Partners</Link></li>
              <li><Link to="/categories" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Services</Link></li>
              <li><Link to="/pricing" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Pricing Plans</Link></li>
              <li><Link to="/how-it-works" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Workflow</Link></li>
            </ul>
          </div>

          {/* For Workers */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-brand-black dark:text-white mb-8 text-xl">Partners</h4>
            <ul className="space-y-4">
              <li><Link to="/register" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Join as Pro</Link></li>
              <li><Link to="/worker-dashboard" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Dashboard</Link></li>
              <li><Link to="/success-stories" className="text-gray-500 dark:text-gray-400 hover:text-brand-electricBlue transition-colors font-medium">Success Stories</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-brand-black dark:text-white mb-8 text-xl">Get in Touch</h4>
            <div className="space-y-6">
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

        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500 font-medium">
            © {new Date().getFullYear()} SERVIQ Technologies. Empowering professionals across India.
          </p>
          <div className="flex gap-8 text-sm font-bold">
            <Link to="/privacy" className="text-gray-400 hover:text-brand-electricBlue transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-brand-electricBlue transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

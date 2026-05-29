import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import Logo from '../ui/Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth state
  const userString = localStorage.getItem('serviq_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('serviq_user');
    localStorage.removeItem('serviq_token');
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavLinks = () => {
    const links = [{ name: 'Home', path: '/' }];
    
    if (!user) {
      links.push({ name: 'Explore', path: '/explore' });
      return links;
    }

    if (user.role === 'client') {
      links.push({ name: 'Find Workers', path: '/explore' });
      links.push({ name: 'My Bookings', path: '/client-dashboard' });
    } else if (user.role === 'worker') {
      links.push({ name: 'My Jobs', path: '/worker-dashboard' });
      links.push({ name: 'Earnings', path: '/worker-dashboard' }); // Can point to a specific tab if needed
    } else if (user.role === 'admin') {
      links.push({ name: 'Admin Panel', path: '/admin-dashboard' });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'py-3 glass' : 'py-6 bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-[15px] font-semibold text-gray-700 hover:text-brand-electricBlue dark:text-gray-300 dark:hover:text-brand-gold transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-electricBlue dark:bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
              <Search size={18} />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-800">
              <Link 
                to={user.role === 'worker' ? '/worker-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/client-dashboard'} 
                className="text-sm font-bold text-brand-black dark:text-white hover:text-brand-electricBlue transition-colors"
              >
                Dashboard
              </Link>
              <div className="group relative">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full border-2 border-brand-electricBlue object-cover cursor-pointer hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-electricBlue/20 text-brand-electricBlue flex items-center justify-center font-bold text-lg cursor-pointer hover:scale-110 transition-transform">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-[15px] font-bold text-brand-black dark:text-white hover:text-brand-electricBlue transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-7 py-3 rounded-full bg-brand-black text-white dark:bg-brand-white dark:text-brand-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-2xl"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 p-2.5 bg-gray-100 dark:bg-white/5 rounded-full"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-brand-darkBlue border-t border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-electricBlue/20 text-brand-electricBlue flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-brand-black dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        {user.role === 'worker' ? 'Partner' : user.role === 'client' ? 'User' : user.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={user.role === 'worker' ? '/worker-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/client-dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-brand-black dark:text-white"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-lg font-medium text-red-500 text-left"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-brand-black dark:text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-brand-electricBlue dark:text-brand-gold"
                  >
                    Sign Up / Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

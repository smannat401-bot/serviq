import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Search, User } from 'lucide-react';
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
  const userString = localStorage.getItem('servic_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('servic_user');
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Services', path: '/services' },
    { name: 'Dashboard', path: '/worker-dashboard' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'py-4 glass' : 'py-6 bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium text-gray-600 hover:text-brand-electricBlue dark:text-gray-300 dark:hover:text-brand-gold transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-electricBlue dark:bg-brand-gold transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
            <Search size={20} />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gray-200 dark:border-gray-800">
              <Link 
                to={user.role === 'worker' ? '/worker-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/client-dashboard'} 
                className="text-sm font-bold text-brand-black dark:text-white hover:text-brand-electricBlue transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Log Out
              </button>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full border-2 border-brand-electricBlue object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-electricBlue/20 text-brand-electricBlue flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-brand-black dark:text-white hover:text-brand-electricBlue transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-black text-white dark:bg-brand-white dark:text-brand-black font-medium hover:scale-105 transition-transform shadow-md hover:shadow-xl ml-2"
              >
                <User size={18} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Search, Bell, Home, Compass, LayoutDashboard, Settings, LogOut, UserPlus, LogIn, MapPin, ChevronDown } from 'lucide-react';
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
      links.push({ name: 'Earnings', path: '/worker-dashboard' });
    } else if (user.role === 'admin') {
      links.push({ name: 'Admin Panel', path: '/admin-dashboard' });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'worker') return '/worker-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/client-dashboard';
  };

  const mobileMenuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'py-2 lg:py-3 glass' : 'py-3 lg:py-6 bg-transparent max-lg:bg-[#0a0a0a] max-lg:border-b max-lg:border-white/5'
      )}
    >
      <div className="container mx-auto px-4 lg:px-6 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop Nav - UNCHANGED */}
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

          {/* Desktop Actions - UNCHANGED */}
          <div className="hidden lg:flex items-center gap-4">
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
          <div className="lg:hidden flex items-center gap-2">
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 p-2 bg-gray-100 dark:bg-white/5 rounded-full"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Location Badge - EXACTLY AS MOCKUP */}
        <div className="lg:hidden flex items-center gap-1.5 text-xs text-gray-400 pl-1 pb-1">
          <MapPin size={13} className="text-blue-500" />
          <span className="font-semibold text-gray-300">{user?.serviceArea || 'Lokhandwala, Andheri West'}</span>
          <ChevronDown size={13} className="text-gray-500" />
        </div>
      </div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-white dark:bg-[#0a0a0a] overflow-y-auto z-[100]"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <Logo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-4 py-6 flex flex-col gap-1">
              {/* User Profile Card */}
              {user && (
                <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-brand-black dark:text-white text-base">{user.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      {user.role === 'worker' ? 'Service Partner' : user.role === 'client' ? 'Customer' : user.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Nav Links with Icons */}
              {mobileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[48px]"
                >
                  <item.icon size={20} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              ))}

              <div className="h-px bg-gray-100 dark:bg-white/10 my-3"></div>

              {/* Settings */}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[48px]"
              >
                <Settings size={20} className="text-gray-400 dark:text-gray-500" />
                <span className="text-base font-medium">Settings</span>
              </Link>

              <div className="h-px bg-gray-100 dark:bg-white/10 my-3"></div>

              {/* Auth Actions */}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors min-h-[48px] w-full text-left"
                >
                  <LogOut size={20} />
                  <span className="text-base font-medium">Log Out</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[48px]"
                  >
                    <LogIn size={20} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-base font-medium">Log In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mt-3 px-4 py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-base min-h-[48px] active:scale-[0.98] transition-transform"
                  >
                    <UserPlus size={20} />
                    <span>Join Now</span>
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

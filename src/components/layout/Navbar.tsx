import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, Search, Bell, Home, Compass, LayoutDashboard,
  Settings, LogOut, UserPlus, LogIn, MapPin, ChevronDown, CheckCircle,
  Briefcase, MessageSquare, ChevronRight, Shield, FileText, Info, Wallet, Calendar, IndianRupee
} from 'lucide-react';
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

  // const getDashboardPath = () => {
  //   if (!user) return '/login';
  //   if (user.role === 'worker') return '/worker-dashboard';
  //   if (user.role === 'admin') return '/admin-dashboard';
  //   return '/client-dashboard';
  // };

  // const mobileMenuItems = [
  //   { name: 'Home', path: '/', icon: Home },
  //   { name: 'Explore', path: '/explore', icon: Compass },
  //   { name: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
  // ];

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
          {/* Logo (Desktop) */}
          <Link to="/" className="hidden lg:flex group items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Mobile Left Section: Hamburger Menu, Logo, Location */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-600 dark:text-gray-300 p-1.5 hover:bg-white/5 rounded-full"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img src="/logo.jpg" alt="Serviq Logo" className="w-[85%] h-[85%] object-contain" />
              </div>
            </Link>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 border border-white/5 px-2 py-1 rounded-full">
              <MapPin size={10} className="text-blue-500" />
              <span className="font-semibold text-gray-300 truncate max-w-[80px]">{user?.serviceArea?.split(',')[0] || 'Ludhiana'}</span>
              <ChevronDown size={10} className="text-gray-500" />
            </div>
          </div>

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

          {/* Mobile Actions (Right Section) */}
          <div className="lg:hidden flex items-center gap-2">
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#0a0a0a] rounded-full"></span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user ? (
              <Link to={user.role === 'worker' ? '/worker-dashboard?tab=profile' : '/client-dashboard'} className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 overflow-hidden shrink-0 ml-1">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-xs uppercase">{user.name?.charAt(0) || 'P'}</span>
                )}
              </Link>
            ) : (
              <Link to="/login" className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 ml-1">
                <LogIn size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Sidebar) Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-[90]"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#070b13]/95 backdrop-blur-xl text-white z-[100] flex flex-col p-6 border-r border-blue-500/10 shadow-[5px_0_25px_rgba(0,0,0,0.5)] overflow-y-auto"
            >
              {/* Glowing decorative gradient blur */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl pointer-events-none z-0" />
              {/* Glowing Wave graphic */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500">
                  <path d="M0 0 C 30 20, 40 40, 100 20 L 100 0 Z" fill="currentColor" />
                  <path d="M0 0 C 50 30, 20 70, 100 80 L 100 0 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
              </div>

              {/* Drawer Header */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <div className="w-full h-full rounded-full bg-[#0A0F1D] flex items-center justify-center font-bold text-xl text-white overflow-hidden">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl uppercase">{user.name?.charAt(0) || 'P'}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base capitalize tracking-wide">{user.name}</h3>
                      <p className="text-[9px] text-blue-400/80 tracking-wider font-semibold uppercase">
                        {user.role === 'worker' ? 'SERVICE PARTNER' : user.role === 'client' ? 'CUSTOMER' : user.role}
                      </p>
                      {user.role === 'worker' && (
                        <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                          <span>Verified Worker</span>
                          <CheckCircle className="w-3 h-3 fill-blue-500 text-[#0A0F1D]" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Logo size="sm" />
                    <div>
                      <h3 className="font-bold text-white text-lg">SERVIQ</h3>
                      <p className="text-[9px] text-blue-400/80 tracking-wider font-semibold uppercase">Guest Session</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 space-y-6 relative z-10 text-sm">
                {user?.role === 'worker' ? (
                  // Worker Drawer Links (Second screenshot exact match)
                  <>
                    <div className="space-y-1">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                            <Home size={16} />
                          </div>
                          <span className="font-medium">Home</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                            <Compass size={16} />
                          </div>
                          <span className="font-medium">Explore</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/worker-dashboard?tab=overview" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.05)]">
                            <LayoutDashboard size={16} />
                          </div>
                          <span className="font-medium">Dashboard</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/worker-dashboard?tab=Services" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                            <Briefcase size={16} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Services</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-purple-500 text-white rounded-full leading-none">New</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/worker-dashboard?tab=messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                            <MessageSquare size={16} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Chat</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-green-500 text-white rounded-full leading-none">2</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-blue-400/60 tracking-wider px-2">WORKER TOOLS</div>
                      <div className="space-y-1">
                        <Link to="/worker-dashboard?tab=overview" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                              <LayoutDashboard size={16} />
                            </div>
                            <span className="font-medium">Overview</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                        </Link>

                        <Link to="/worker-dashboard?tab=wallet" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                              <Wallet size={16} />
                            </div>
                            <span className="font-medium">Wallet & Earnings</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                        </Link>

                        <Link to="/worker-dashboard?tab=calendar" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                              <Calendar size={16} />
                            </div>
                            <span className="font-medium">My Schedule</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                        </Link>

                        <Link to="/worker-dashboard?tab=pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.05)]">
                              <IndianRupee size={16} />
                            </div>
                            <span className="font-medium">Charges & Profit</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link to="/worker-dashboard?tab=profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Settings size={18} className="text-gray-400" />
                        <span className="font-medium">Settings</span>
                      </Link>

                      <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Shield size={18} className="text-gray-400" />
                        <span className="font-medium">Privacy Policy</span>
                      </Link>

                      <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium">Terms & Conditions</span>
                      </Link>

                      <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Info size={18} className="text-gray-400" />
                        <span className="font-medium">About Us</span>
                      </Link>

                      <div className="h-px bg-white/5 my-2" />

                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                ) : user?.role === 'client' ? (
                  // Client Drawer Links
                  <>
                    <div className="space-y-1">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                            <Home size={16} />
                          </div>
                          <span className="font-medium">Home</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                            <Compass size={16} />
                          </div>
                          <span className="font-medium">Explore</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/client-dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center">
                            <LayoutDashboard size={16} />
                          </div>
                          <span className="font-medium">My Bookings</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/client-dashboard?tab=messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                            <MessageSquare size={16} />
                          </div>
                          <span className="font-medium">Chat</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <Link to="/client-dashboard?tab=profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Settings size={18} className="text-gray-400" />
                        <span className="font-medium">Settings</span>
                      </Link>

                      <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Shield size={18} className="text-gray-400" />
                        <span className="font-medium">Privacy Policy</span>
                      </Link>

                      <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium">Terms & Conditions</span>
                      </Link>

                      <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Info size={18} className="text-gray-400" />
                        <span className="font-medium">About Us</span>
                      </Link>

                      <div className="h-px bg-white/5 my-2" />

                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  // Guest Drawer Links
                  <>
                    <div className="space-y-1">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                            <Home size={16} />
                          </div>
                          <span className="font-medium">Home</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                            <Compass size={16} />
                          </div>
                          <span className="font-medium">Explore</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </Link>

                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LogIn size={18} className="text-gray-400" />
                        <span className="font-medium">Log In</span>
                      </Link>

                      <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <UserPlus size={18} className="text-gray-400" />
                        <span className="font-medium">Join Now</span>
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Shield size={18} className="text-gray-400" />
                        <span className="font-medium">Privacy Policy</span>
                      </Link>

                      <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium">Terms & Conditions</span>
                      </Link>

                      <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Info size={18} className="text-gray-400" />
                        <span className="font-medium">About Us</span>
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

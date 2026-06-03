import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import AIChatWidget from '../ui/AIChatWidget';
import CookieConsent from '../ui/CookieConsent';

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, darkMode, toggleDarkMode }: LayoutProps) {
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, ''); // Remove trailing slash
  const isDashboardRoute = ['/client-dashboard', '/worker-dashboard', '/admin-dashboard'].some(dashboardPath => path === dashboardPath || path.startsWith(dashboardPath + '/'));

  return (
    <div className="min-h-screen flex flex-col bg-brand-white dark:bg-brand-darkBlue transition-colors duration-300">
      {!isDashboardRoute && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      <main className={`flex-grow ${isDashboardRoute ? 'mt-0 pb-0' : 'mt-16 lg:mt-24 pb-20 lg:pb-0'}`}>
        {children}
      </main>
      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && <BottomNav />}
      <AIChatWidget />
      <CookieConsent />
    </div>
  );
}

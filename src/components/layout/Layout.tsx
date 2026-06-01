import type { ReactNode } from 'react';
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
  return (
    <div className="min-h-screen flex flex-col bg-brand-white dark:bg-brand-darkBlue transition-colors duration-300">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow mt-16 lg:mt-24 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <AIChatWidget />
      <CookieConsent />
    </div>
  );
}

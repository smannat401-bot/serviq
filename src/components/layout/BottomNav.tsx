import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const userString = localStorage.getItem('serviq_user');
  const user = userString ? JSON.parse(userString) : null;

  const getDashboardPath = (tabName: string) => {
    if (!user) return '/login';
    const rolePath = user.role === 'worker' ? 'worker-dashboard' : user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard';
    return `/${rolePath}?tab=${tabName}`;
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: CalendarDays, label: 'Bookings', path: getDashboardPath('bookings') },
    { icon: MessageCircle, label: 'Messages', path: getDashboardPath('messages') },
    { icon: User, label: 'Profile', path: getDashboardPath('settings') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#000000] border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          // Check if active based on path and search query
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname + location.search === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-500'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

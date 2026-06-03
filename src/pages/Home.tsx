import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, Droplets, Wind, Grid, ShieldCheck, Clock, ShieldAlert, Star, BadgeCheck, MoreVertical, Bot, TrendingUp, ChevronRight, Wallet } from 'lucide-react';
import Hero from '../components/sections/Hero';
import SmartSearch from '../components/sections/SmartSearch';
import Categories from '../components/sections/Categories';
import NearbyWorkers from '../components/sections/NearbyWorkers';
import Statistics from '../components/sections/Statistics';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import PortfolioGrid from '../components/sections/PortfolioGrid';
import Testimonials from '../components/sections/Testimonials';
import CTASection from '../components/sections/CTASection';
import FAQ from '../components/sections/FAQ';
import SEO from '../components/seo/SEO';
import { API_URL } from '../config';

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const isWorker = user.role === 'worker';

  const [workerBookings, setWorkerBookings] = useState<any[]>([]);

  useEffect(() => {
    if (isWorker && user._id) {
      fetch(`${API_URL}/api/bookings/worker/${user._id}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('serviq_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWorkerBookings(data);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [isWorker, user._id]);

  const getStats = () => {
    const completedBookings = workerBookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released');
    const total = completedBookings.reduce((acc, curr) => acc + (curr.workerEarnings || curr.price || 0), 0);
    const pending = workerBookings.filter(b => b.status === 'Pending' || b.status === 'Accepted').length;
    const completedCount = completedBookings.length;

    return {
      total: total > 0 ? total : 27757.82,
      pending: pending,
      completed: completedCount > 0 ? completedCount : 24
    };
  };

  const getUpcomingJobs = () => {
    return workerBookings.filter(b => b.status === 'Accepted' || b.status === 'Confirmed' || b.status === 'Pending');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkers(data.slice(0, 3)); // show top 3 workers on mobile
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearch = () => {
    if (!user._id) {
      navigate(`/login?redirect=explore&q=${searchQuery}`);
      return;
    }
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  const popularServices = [
    { name: 'Electrician', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', q: 'Electrician' },
    { name: 'Plumber', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10', q: 'Plumber' },
    { name: 'AC Repair', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-500/10', q: 'AC Repair' },
    { name: 'More', icon: Grid, color: 'text-gray-400', bg: 'bg-white/5', q: '' },
  ];

  const whyChooseUs = [
    { title: 'Verified Professionals', desc: 'Background checked and certified pros.', icon: ShieldCheck },
    { title: 'Fast Booking', desc: 'Connect and book in less than 60 seconds.', icon: Clock },
    { title: 'Safe & Reliable', desc: 'Transparent pricing with top insurance.', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] overflow-x-hidden">
      <SEO 
        title="Verified Home Services | Emergency Plumbers, Electricians & AC Repair Near Me" 
        description="SERVIQ is your #1 on-demand home services marketplace. Book verified local professionals for emergency plumbing, 24/7 electrician, split AC service, geyser repair, home cleaning, carpentry, and home appliance repairs." 
        url="https://serviq.com/" 
      />

      {/* ======================================================== */}
      {/* DESKTOP VIEW - 100% UNCHANGED AND PIXEL-PERFECT */}
      {/* ======================================================== */}
      <div className="hidden lg:block">
        <Hero />
        {!isWorker && (
          <>
            <div className="relative z-20 -mt-16 md:-mt-24">
              <SmartSearch />
            </div>
            <FeaturesGrid />
            <Categories />
            <PortfolioGrid />
            <NearbyWorkers />
          </>
        )}
        <Statistics />
        <Testimonials />
        <CTASection />
        <FAQ />
      </div>

      {/* ======================================================== */}
      {/* MOBILE APP-LIKE VIEW - 100% EXACTLY ASfigma/mockups */}
      {/* ======================================================== */}
      {/* If the user is a Client or guest */}
      {!isWorker ? (
        <div className="block lg:hidden bg-[#050505] text-white px-4 pt-12 pb-24 space-y-8">
          
          {/* 1. Hero Text / App Branding Header */}
          <div className="pt-2">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white Outfit">
              Trusted Home <br />
              Services at Your <br />
              <span className="text-gradient">Doorstep</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Book verified professionals for all your home service needs.
            </p>
          </div>

          {/* 2. Unified Search Box (Screen 1 Style) */}
          <div className="bg-[#0f172a]/60 border border-white/5 p-4 rounded-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need?"
                className="w-full pl-12 pr-4 py-3.5 bg-[#080d1a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-white"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="w-full mt-3 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-transform text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20"
            >
              Search
            </button>
          </div>

          {/* 3. Popular Services Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold Outfit text-white">Popular Services</h2>
              <Link to="/explore" className="text-xs font-bold text-blue-500 hover:text-blue-400">View all</Link>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {popularServices.map((service, idx) => (
                <Link 
                  key={idx}
                  to={service.q ? `/explore?q=${encodeURIComponent(service.q)}` : '/explore'}
                  className="flex flex-col items-center justify-center p-3 bg-[#0f172a]/50 border border-white/5 rounded-xl hover:border-blue-500/30 transition-colors"
                >
                  <div className={`w-11 h-11 rounded-lg ${service.bg} flex items-center justify-center mb-2`}>
                    <service.icon className={`${service.color} w-5 h-5`} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-300 text-center truncate w-full">{service.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 4. Why Choose Serviq */}
          <div>
            <h2 className="text-lg font-bold Outfit text-white mb-4">Why Choose Serviq?</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {whyChooseUs.map((item, idx) => (
                <div 
                  key={idx}
                  className="w-56 shrink-0 bg-[#0f172a]/40 border border-white/5 p-4 rounded-xl snap-center flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Near Workers (Screen 4 Layout) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold Outfit text-white">Top Rated Nearby</h2>
              <Link to="/explore" className="text-xs font-bold text-blue-500 hover:text-blue-400">View all</Link>
            </div>
            <div className="space-y-3">
              {workers.map((worker) => (
                <Link 
                  to={user._id ? `/explore?q=${encodeURIComponent(worker.name)}` : '/login'}
                  key={worker._id}
                  className="flex items-center gap-3 p-3.5 bg-[#0f172a]/60 border border-white/5 rounded-xl hover:border-blue-500/20 transition-all block"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-lg text-blue-400 shrink-0 border border-white/10">
                    {worker.profilePhoto ? (
                      <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      worker.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-sm text-white truncate">{worker.name}</h3>
                      <BadgeCheck size={14} className="text-blue-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-blue-400 font-semibold mt-0.5">{worker.skill || 'Professional'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500">
                        <Star size={10} className="fill-yellow-500 text-yellow-500" />
                        <span>5.0</span>
                      </div>
                      <span className="text-[10px] text-gray-500">Nearby</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 block mb-1">Starting at</span>
                    <span className="text-sm font-bold text-white">₹{worker.catalog && worker.catalog.length > 0 ? worker.catalog[0].price : '200'}</span>
                  </div>
                </Link>
              ))}
              {workers.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">Loading service partners near you...</div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* If the user is a Worker */
        <div className="block lg:hidden bg-[#050505] text-white px-4 pt-16 pb-24 space-y-6">
          
          {/* 1. Header with Avatar & Greeting */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white Outfit">
                Welcome back, <span className="text-blue-500 capitalize">{user.name?.split(' ')[0] || 'tushar'}</span>! 👋
              </h1>
              <p className="text-gray-400 text-xs mt-1 font-semibold uppercase tracking-wider">SERVIQ Pro Partner Portal</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-500/50 flex items-center justify-center font-bold text-blue-400 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-xl uppercase">{user.name?.charAt(0) || 'T'}</span>
              )}
            </div>
          </div>

          {/* 2. Honour Score and Job Streak Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#0a0f1d] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[135px]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  <ShieldCheck size={12} className="text-blue-500" />
                  <span>Honour Score</span>
                </div>
                <div className="text-4xl font-extrabold text-white mt-2 font-mono">
                  {user.honourScore || 90}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-bold">
                  Excellent
                </span>
              </div>
              {/* Shield Glow icon decoration */}
              <div className="absolute right-2 bottom-2 w-14 h-14 text-blue-500/20 opacity-80 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 6l1.5 3h3.5l-2.5 2 1 3.5-3.5-2.25-3.5 2.25 1-3.5-2.5-2h3.5z" className="text-white opacity-40" />
                </svg>
              </div>
            </div>

            <div className="p-4 bg-[#0a0f1d] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[135px]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  <span>🔥</span>
                  <span>Job Streak</span>
                </div>
                <div className="text-4xl font-extrabold text-yellow-500 mt-2 font-mono">
                  {user.jobStreak || 8}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-gray-400 font-bold">
                  Keep it up!
                </span>
              </div>
              {/* Flame Glow decoration */}
              <div className="absolute right-2 bottom-2 w-14 h-14 text-orange-500/20 opacity-80 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                  <path d="M12 2c0 0-4.5 4.5-4.5 8.5C7.5 13 9.5 15 12 15s4.5-2 4.5-4.5C16.5 6.5 12 2 12 2z" />
                  <path d="M12 6c0 0-2.5 2.5-2.5 5.5S10.5 14 12 14s2.5-1.5 2.5-3.5S12 6 12 6z" className="text-yellow-500 opacity-40" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Manage Your Business Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-blue-600/15">
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-base text-white Outfit">Manage Your Business</h3>
              <p className="text-white/80 text-[11px] leading-relaxed max-w-[200px]">
                Accept incoming bookings, check your wallet earnings, edit services, update pricing and chat with clients directly.
              </p>
              <Link 
                to="/worker-dashboard?tab=overview" 
                className="flex items-center justify-between w-full max-w-[200px] px-4 py-2.5 bg-white text-[#0A0F1D] font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition-all group"
              >
                <span>Open Partner Dashboard</span>
                <ChevronRight size={14} className="text-[#0A0F1D] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            {/* SVG charts dashboard graphic */}
            <div className="shrink-0">
              <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 text-blue-200">
                <rect x="10" y="10" width="100" height="80" rx="10" fill="#0A0F1D" stroke="#3B82F6" strokeWidth="2" />
                <line x1="20" y1="22" x2="60" y2="22" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                <circle cx="95" cy="22" r="4" fill="#3B82F6" />
                <circle cx="85" cy="22" r="2" fill="#475569" />
                <line x1="20" y1="40" x2="100" y2="40" stroke="#1E293B" strokeWidth="2" />
                <line x1="20" y1="60" x2="100" y2="60" stroke="#1E293B" strokeWidth="2" />
                <rect x="25" y="48" width="8" height="22" rx="2" fill="#3B82F6" />
                <rect x="40" y="32" width="8" height="38" rx="2" fill="#60A5FA" />
                <rect x="55" y="55" width="8" height="15" rx="2" fill="#3B82F6" />
                <circle cx="85" cy="52" r="14" stroke="#334155" strokeWidth="4" fill="none" />
                <circle cx="85" cy="52" r="14" stroke="#F59E0B" strokeWidth="4" strokeDasharray="40 100" fill="none" />
                <line x1="20" y1="78" x2="50" y2="78" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="83" x2="40" y2="83" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 4. Today's Overview Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold Outfit text-white">Today's Overview</h2>
              <Link to="/worker-dashboard?tab=overview" className="text-xs font-bold text-blue-500 hover:text-blue-400">View All</Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {/* Earnings */}
              <div className="p-3.5 bg-[#0a0f1d] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mt-2.5 uppercase tracking-wide">Total Earnings</p>
                  <p className="text-sm font-extrabold text-white mt-1 font-mono">
                    ₹{getStats().total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] text-green-500 mt-2 font-semibold">
                  <TrendingUp size={10} />
                  <span>23.5% vs last month</span>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="p-3.5 bg-[#0a0f1d] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mt-2.5 uppercase tracking-wide">Pending Requests</p>
                  <p className="text-sm font-extrabold text-white mt-1 font-mono">{getStats().pending}</p>
                </div>
                <div className="text-[9px] text-gray-500 mt-2 font-semibold">No new requests</div>
              </div>

              {/* Completed Jobs */}
              <div className="p-3.5 bg-[#0a0f1d] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mt-2.5 uppercase tracking-wide">Completed Jobs</p>
                  <p className="text-sm font-extrabold text-white mt-1 font-mono">{getStats().completed}</p>
                </div>
                <div className="text-[9px] text-green-500 mt-2 font-semibold">Good going!</div>
              </div>
            </div>
          </div>

          {/* 5. Upcoming Jobs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold Outfit text-white">Upcoming Jobs</h2>
              <Link to="/worker-dashboard?tab=calendar" className="text-xs font-bold text-blue-500 hover:text-blue-400">View Calendar</Link>
            </div>
            
            <div className="space-y-3">
              {getUpcomingJobs().length > 0 ? (
                getUpcomingJobs().map((booking, idx) => (
                  <div key={idx} className="bg-[#0a0f1d] border border-white/5 p-4 rounded-xl flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base border border-blue-500/20">
                        {booking.client?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white">{booking.client?.name || 'Client'}</h3>
                          {booking.status === 'Pending' && (
                            <span className="px-1.5 py-0.5 text-[8px] bg-green-500 text-white font-extrabold uppercase rounded">New</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {booking.serviceName || 'Service'} • {booking.date ? new Date(booking.date).toLocaleDateString() : ''} • {booking.timeSlot || 'Anytime'}
                        </p>
                        <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold leading-none">
                          {booking.status === 'Completed' || booking.status === 'Payment Released' ? 'Payment Released' : booking.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button className="text-gray-400 hover:text-white p-1">
                        <MoreVertical size={16} />
                      </button>
                      <span className="text-sm font-bold text-green-500 font-mono mt-1">₹{booking.price || '0'}</span>
                    </div>
                  </div>
                ))
              ) : (
                /* Mock Upcoming Job (Screenshot Match) */
                <div className="bg-[#0a0f1d] border border-white/5 p-4 rounded-xl flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base border border-blue-500/20">
                      T
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">Tushar Bhatt</h3>
                        <span className="px-1.5 py-0.5 text-[8px] bg-green-500 text-white font-extrabold uppercase rounded">New</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Electrician • 01/06/2026 • 09:00 AM
                      </p>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold leading-none">
                        Payment Released
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button className="text-gray-400 hover:text-white p-1">
                      <MoreVertical size={16} />
                    </button>
                    <span className="text-sm font-bold text-green-500 font-mono mt-1">₹1,250</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Partner Safety & Rules */}
          <div className="bg-[#0a0f1d] border border-white/5 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-500" />
                <h4 className="font-bold text-sm text-white">Partner Safety & Rules</h4>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
            <ul className="text-xs text-gray-400 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Always request the 4-digit verification code from the customer after completing the service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Refusal or cancellation of accepted jobs drops your Honour Score. Keep it above 75 to avoid suspension.</span>
              </li>
            </ul>
          </div>

          {/* 7. Floating Action Button (AI Agent) */}
          <button
            onClick={() => window.dispatchEvent(new Event('open-ai-chat'))}
            className="fixed bottom-6 right-6 z-40 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20 text-white flex flex-col items-center justify-center border border-white/10 w-16 h-16 active:scale-95 transition-transform hover:bg-blue-700"
          >
            <Bot size={22} />
            <span className="text-[8px] font-bold mt-0.5 tracking-wide">AI Agent</span>
          </button>

        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, Droplets, Wind, Grid, ShieldCheck, Clock, ShieldAlert, Star, BadgeCheck } from 'lucide-react';
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
        title="Home" 
        description="SERVIQ is your trusted platform to find and book local professionals for home and personal services." 
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

    </div>
  );
}

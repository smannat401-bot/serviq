import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, BadgeCheck, Zap, Droplets, Hammer, Wrench, Lock } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import BookingModal from '../components/modals/BookingModal';
import { API_URL } from '../config';

const categoryIcons = [
  { name: 'Electrician', icon: Zap },
  { name: 'Plumber', icon: Droplets },
  { name: 'AC Repair', icon: Wrench },
  { name: 'Cleaner', icon: Hammer },
];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('l') || '');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);
  const user = localStorage.getItem('servic_user');

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkers(data);
          applyFilters(data, searchQuery, locationQuery);
        }
      })
      .catch(err => console.error('Failed to fetch workers:', err));
  }, []);

  const applyFilters = (data: any[], q: string, l: string) => {
    const filtered = data.filter(worker => {
      const matchQuery = !q || 
        worker.name.toLowerCase().includes(q.toLowerCase()) || 
        worker.skill?.toLowerCase().includes(q.toLowerCase()) ||
        (worker.catalog || []).some((s: any) => s.title.toLowerCase().includes(q.toLowerCase()));
      
      const matchLocation = !l || 
        worker.serviceArea?.toLowerCase().includes(l.toLowerCase());
        
      return matchQuery && matchLocation;
    });
    setFilteredWorkers(filtered);
  };

  useEffect(() => {
    applyFilters(workers, searchQuery, locationQuery);
  }, [searchQuery, locationQuery, workers]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-8 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-brand-black dark:text-white mb-2">Find a Professional</h1>
            <p className="text-gray-500 dark:text-gray-400">Book trusted, verified workers near you.</p>
          </div>
          <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Electrician)..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white shadow-sm"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location (e.g. Tibba Road)..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {!user ? (
          <div className="glass-card p-12 text-center flex flex-col items-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-brand-electricBlue/10 rounded-full flex items-center justify-center text-brand-electricBlue">
              <Lock size={40} />
            </div>
            <h2 className="text-3xl font-bold text-brand-black dark:text-white">Login Required to View Professionals</h2>
            <p className="text-gray-500 dark:text-gray-400">
              For security and to ensure quality service, you must be logged in to view expert details, locations, and pricing.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="px-8 py-3 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
                Login Now
              </Link>
              <Link to="/register" className="px-8 py-3 glass text-brand-black dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Categories */}
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {categoryIcons.map((cat, i) => {
                const realCount = workers.filter(w => 
                  w.skill?.toLowerCase() === cat.name.toLowerCase() || 
                  (w.catalog || []).some((s: any) => s.title.toLowerCase().includes(cat.name.toLowerCase()))
                ).length;

                return (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    onClick={() => setSearchQuery(cat.name)}
                    className="glass-card p-6 flex flex-col items-center text-center cursor-pointer hover:border-brand-electricBlue/50 transition-colors group"
                  >
                    <div className="w-16 h-16 bg-brand-electricBlue/10 rounded-2xl flex items-center justify-center text-brand-electricBlue mb-4 group-hover:scale-110 transition-transform">
                      <cat.icon size={32} />
                    </div>
                    <h3 className="font-bold text-brand-black dark:text-white mb-1">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{realCount} Partners</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Featured Pros */}
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-brand-black dark:text-white">
                {searchQuery || locationQuery ? `Search Results (${filteredWorkers.length})` : 'Featured Partners'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredWorkers.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No partners found matching "{searchQuery}" in "{locationQuery || 'Anywhere'}".
                </div>
              )}
              {filteredWorkers.map((pro) => (
                <motion.div 
                  key={pro._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card overflow-hidden flex flex-col group relative"
                >
                  <div className="p-6 flex flex-col items-center text-center relative">
                    <div className="absolute top-4 left-4 bg-brand-black/5 dark:bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-brand-black dark:text-white">
                      <MapPin size={12} className="text-brand-electricBlue" /> {pro.serviceArea || 'Local'}
                    </div>
                    
                    <div className="w-24 h-24 rounded-full bg-brand-electricBlue/20 flex items-center justify-center text-3xl text-brand-electricBlue font-bold shadow-md mb-4 border-4 border-white dark:border-[#0f172a]">
                      {pro.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-lg text-brand-black dark:text-white flex items-center justify-center gap-1 mb-1">
                      {pro.name} <BadgeCheck size={16} className="text-brand-electricBlue" />
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{pro.skill || 'Professional'}</p>
                    <div className="flex items-center justify-center gap-1 text-sm bg-gray-50 dark:bg-[#0f172a] px-3 py-1 rounded-full mb-4">
                      <Star size={14} className="text-brand-gold fill-brand-gold" />
                      <span className="font-bold text-brand-black dark:text-white">5.0</span>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Starting at</span>
                      <span className="font-bold text-brand-electricBlue">
                        ${pro.catalog && pro.catalog.length > 0 ? pro.catalog[0].price : 'Ask'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(pro)}
                      className="w-full py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Modal Overlay Placeholder */}
        {selectedBooking && (
          <BookingModal 
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            workerId={selectedBooking._id}
            workerName={selectedBooking.name}
            serviceName={selectedBooking.skill || 'General Service'}
            basePrice={`$${selectedBooking.catalog && selectedBooking.catalog.length > 0 ? selectedBooking.catalog[0].price : '0'}`}
            availability={selectedBooking.availability}
          />
        )}
        
      </div>
    </div>
  );
}

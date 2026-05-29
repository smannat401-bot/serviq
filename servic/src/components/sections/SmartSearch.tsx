import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SmartSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const suggestions = [
    'AC Repair', 'Electrician', 'Water Leakage', 'Mobile Repair', 'TV Repair', 'Washing Machine'
  ];

  const handleSearch = () => {
    const user = localStorage.getItem('servic_user');
    if (!user) {
      navigate('/login?redirect=explore&q=' + query + '&l=' + location);
      return;
    }
    
    navigate(`/explore?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative -mt-20 z-20 pb-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto glass-card p-6 rounded-3xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What needs repair today?"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-electricBlue transition-shadow text-brand-black dark:text-white"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 relative hidden sm:block">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <MapPin className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your Location"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-electricBlue transition-shadow text-brand-black dark:text-white"
              />
              <button className="absolute inset-y-0 right-4 flex items-center text-brand-electricBlue hover:text-brand-gold transition-colors">
                <Target size={20} />
              </button>
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-brand-electricBlue to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-brand-electricBlue/30 transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <SparklesIcon /> AI Suggested:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    // Optionally trigger search immediately or just set query
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-brand-electricBlue hover:text-white dark:hover:bg-brand-electricBlue transition-colors border border-transparent dark:border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

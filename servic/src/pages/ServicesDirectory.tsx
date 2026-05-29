import { motion } from 'framer-motion';
import { Zap, Droplets, Wrench, Sparkles, Hammer, Paintbrush, Loader, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  { id: 1, name: 'Electrician', icon: Zap, price: '$45', desc: 'Expert wiring, light installations, and electrical repairs.', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80' },
  { id: 2, name: 'Plumber', icon: Droplets, price: '$50', desc: 'Leak fixes, pipe installations, and bathroom fittings.', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80' },
  { id: 3, name: 'AC Repair', icon: Wrench, price: '$60', desc: 'Cooling issues, gas refill, and regular maintenance.', img: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80' },
  { id: 4, name: 'Home Cleaning', icon: Sparkles, price: '$80', desc: 'Deep cleaning, sanitization, and dust removal.', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80' },
  { id: 5, name: 'Carpenter', icon: Hammer, price: '$55', desc: 'Furniture repair, custom woodwork, and fittings.', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80' },
  { id: 6, name: 'Painter', icon: Paintbrush, price: '$120', desc: 'Interior and exterior wall painting and touch-ups.', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80' },
  { id: 7, name: 'Washing Machine Repair', icon: Loader, price: '$40', desc: 'Motor repair, drainage issues, and full service.', img: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=500&q=80' },
  { id: 8, name: 'RO Water Filter Repair', icon: Droplets, price: '$35', desc: 'Filter replacement, pump fixing, and water testing.', img: 'https://images.unsplash.com/photo-1536939459926-3011eb404ce7?w=500&q=80' }
];

export default function ServicesDirectory() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">Services Directory</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Browse our complete list of professional home services. Verified experts, upfront pricing, and guaranteed satisfaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden flex flex-col group"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={service.img} 
                  alt={service.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {service.name}
                  </h3>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-sm">
                    {service.price}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-gray-500 mb-6 flex-1">{service.desc}</p>
                <Link to="/explore" className="w-full py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  Book Service <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

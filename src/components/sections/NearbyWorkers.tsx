import { motion } from 'framer-motion';
import { Star, MapPin, BadgeCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import WorkerProfileModal from '../modals/WorkerProfileModal';
import BookingModal from '../modals/BookingModal';



export default function NearbyWorkers() {
  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkers(data.slice(0, 4));
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-black dark:text-white mb-4">
              Top Rated <span className="text-gradient">Nearby</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <MapPin size={18} className="text-brand-electricBlue" />
              Showing workers near <span className="font-semibold text-brand-black dark:text-white">San Francisco, CA</span>
            </p>
          </div>
          <Link to="/explore" className="text-brand-electricBlue hover:text-brand-gold font-medium transition-colors">
            View All Workers &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workers
            .filter(worker => user?._id !== worker._id)
            .map((worker, index) => (
            <motion.div
              key={worker._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-brand-electricBlue/30 transition-all group cursor-pointer"
              onClick={() => setSelectedProfile(worker)}
            >
              <div className="relative mb-4">
                <div className="w-full h-48 bg-brand-electricBlue/10 flex items-center justify-center rounded-2xl group-hover:scale-[1.02] transition-transform duration-300">
                  <span className="text-4xl text-brand-electricBlue font-bold">{worker.name.charAt(0)}</span>
                </div>
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Star size={12} className="text-brand-gold fill-brand-gold" />
                  <span>5.0</span>
                  <span className="text-gray-500">(New)</span>
                </div>
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      {worker.name}
                      <BadgeCheck size={16} className="text-brand-electricBlue" />
                    </h3>
                    <p className="text-sm text-brand-electricBlue font-medium">{worker.skill || 'Professional'}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{worker.catalog && worker.catalog.length > 0 ? worker.catalog[0].price : 'Ask'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{worker.serviceArea || 'Nearby'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Available</span>
                  </div>
                </div>

                {(!user?._id) ? (
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full mt-4 bg-gray-50 dark:bg-gray-800 hover:bg-brand-electricBlue hover:text-white dark:hover:bg-brand-electricBlue text-brand-black dark:text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Login to Book
                  </button>
                ) : user?.role === 'client' ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(worker);
                      }}
                      className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-xl hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(worker);
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-brand-black dark:text-white font-medium py-2 rounded-xl transition-colors text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                ) : user?._id === worker._id ? (
                  <div className="w-full mt-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold rounded-xl text-center cursor-not-allowed text-sm">
                    Your Profile
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
          {workers.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">No top rated professionals found yet.</div>
          )}
        </div>
      </div>
      
      {selectedProfile && (
        <WorkerProfileModal 
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          worker={selectedProfile}
          onBook={(Service) => {
            setSelectedProfile(null);
            setSelectedBooking({
              ...selectedProfile,
              skill: Service.title,
              catalog: [{ ...Service }]
            });
          }}
        />
      )}

      {selectedBooking && (
        <BookingModal 
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          workerId={selectedBooking._id}
          workerName={selectedBooking.name}
          serviceName={selectedBooking.skill || 'General Service'}
          basePrice={`₹${selectedBooking.catalog && selectedBooking.catalog.length > 0 ? selectedBooking.catalog[0].price : '200'}`}
          availability={selectedBooking.availability}
        />
      )}
    </section>
  );
}

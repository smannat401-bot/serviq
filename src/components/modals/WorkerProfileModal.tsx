import { X, Star, MapPin, BadgeCheck, Briefcase, Clock, Calendar, CheckCircle, User, IndianRupee, Send } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';

interface Service {
  title: string;
  description?: string;
  price: number;
}

interface WorkerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: {
    _id: string;
    name: string;
    skill?: string;
    bio?: string;
    experience?: number;
    serviceArea?: string;
    catalog?: Service[];
    averageRating?: number;
    reviews?: any[];
    baseCharge?: number;
    distanceRate?: number;
    freeDistanceLimit?: number;
    travelFee?: number;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  };
  onBook: (Service: Service) => void;
}

export default function WorkerProfileModal({ isOpen, onClose, worker, onBook }: WorkerProfileModalProps) {
  const [requestServiceName, setRequestServiceName] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const userString = localStorage.getItem('serviq_user');
  const currentUser = userString ? JSON.parse(userString) : null;

  const handleRequestService = async () => {
    if (!requestServiceName.trim()) return;
    if (!currentUser || !currentUser._id) {
      alert('Please login to request a service');
      return;
    }

    setIsRequesting(true);
    console.log('SENDING REQUEST TO:', `${API_URL}/api/services/request`);
    console.log('PAYLOAD:', {
      workerId: worker._id,
      clientId: currentUser._id,
      clientName: currentUser.name,
      serviceName: requestServiceName.trim()
    });

    try {
      const res = await fetch(`${API_URL}/api/services/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker._id,
          clientId: currentUser._id,
          clientName: currentUser.name,
          serviceName: requestServiceName.trim()
        })
      });

      if (res.ok) {
        setRequestStatus('success');
        setRequestServiceName('');
        setTimeout(() => setRequestStatus('idle'), 3000);
      } else {
        setRequestStatus('error');
      }
    } catch (err) {
      console.error(err);
      setRequestStatus('error');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white dark:bg-[#0b1120] w-full max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Mobile Drag Indicator */}
        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/50 backdrop-blur-md rounded-full z-20"></div>
        {/* Header/Banner */}
        <div className="relative h-32 bg-gradient-to-r from-brand-electricBlue/20 to-brand-gold/10 flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full text-brand-black dark:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#0f172a] p-1.5 shadow-xl">
              <div className="w-full h-full rounded-xl bg-brand-electricBlue/10 flex items-center justify-center text-3xl font-bold text-brand-electricBlue">
                {worker.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
                {worker.name}
                <BadgeCheck size={24} className="text-brand-electricBlue" />
              </h2>
              <p className="text-lg text-brand-electricBlue font-semibold">{worker.skill || 'Professional'}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-black dark:text-white flex items-center justify-center gap-1">
                  <Star size={20} className="text-brand-gold fill-brand-gold" />
                  {worker.averageRating || '5.0'}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rating</p>
              </div>
              <div className="h-10 w-px bg-gray-100 dark:bg-gray-800"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-black dark:text-white">{worker.experience || '3'}+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Years Exp.</p>
              </div>
            </div>
          </div>

          {/* Quick Info Tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#0f172a] rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
              <MapPin size={16} className="text-brand-electricBlue" />
              {worker.serviceArea || 'Local Area'}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#0f172a] rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
              <Clock size={16} className="text-brand-electricBlue" />
              {worker.availability?.startTime || '09:00'} - {worker.availability?.endTime || '17:00'}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#0f172a] rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
              <Calendar size={16} className="text-brand-electricBlue" />
              {worker.availability?.days?.length || 5} Days/Week
            </div>
          </div>

          {/* About Section */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-brand-black dark:text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-brand-electricBlue" />
              About {worker.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-[#0f172a]/30 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
              {worker.bio || `Professional ${worker.skill || 'Service provider'} dedicated to delivering high-quality results. With over ${worker.experience || 3} years of experience in the field, I ensure customer satisfaction and reliable Service.`}
            </p>
          </div>

          {/* Pricing & Travel Charges Section */}
          <div className="mb-10 bg-brand-electricBlue/5 dark:bg-brand-electricBlue/10 p-6 rounded-3xl border border-brand-electricBlue/20">
            <h3 className="text-xl font-bold text-brand-black dark:text-white mb-4 flex items-center gap-2">
              <IndianRupee size={20} className="text-brand-electricBlue" />
              Travel & Visiting Charges
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Visiting Charge</p>
                <p className="text-lg font-bold text-brand-black dark:text-white">₹{worker.baseCharge || 0}</p>
                <p className="text-xs text-gray-400 mt-1">One-time visiting/base fee.</p>
              </div>
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Distance Charges</p>
                <p className="text-lg font-bold text-brand-black dark:text-white">₹{worker.distanceRate || 0} / km</p>
                <p className="text-xs text-gray-400 mt-1">After first {worker.freeDistanceLimit || 0} km.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-brand-electricBlue/10">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-electricBlue/20 flex items-center justify-center text-brand-electricBlue">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-black dark:text-white mb-1">Distance Charge Policy</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Agar aapki location worker se <span className="font-bold text-brand-electricBlue">{worker.freeDistanceLimit || 0}km</span> se zyada door hai, toh extra distance ke liye <span className="font-bold text-brand-electricBlue">₹{worker.distanceRate || 0} prati km</span> charge lagega.
                </p>
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  (Extra distance charges apply if you are more than {worker.freeDistanceLimit || 0}km away.)
                </p>
              </div>
            </div>
          </div>

          {/* Services Catalog */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-brand-black dark:text-white mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-brand-electricBlue" />
              Service Catalog
            </h3>
            <div className="space-y-4">
              {worker.catalog && worker.catalog.length > 0 ? (
                worker.catalog.map((Service, idx) => (
                  <div 
                    key={idx}
                    className="p-5 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center group hover:border-brand-electricBlue/30 transition-all shadow-sm"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-black dark:text-white group-hover:text-brand-electricBlue transition-colors mb-1">{Service.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{Service.description || 'Professional Service with guaranteed quality.'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-brand-electricBlue">₹{Service.price}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Standard</p>
                      </div>
                      <button 
                        onClick={() => onBook(Service)}
                        className="bg-brand-black dark:bg-white text-white dark:text-brand-black px-6 py-2.5 rounded-xl font-bold hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors text-sm shadow-md"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-500">No Services listed in the catalog yet.</p>
                  <div className="mt-4 p-5 bg-brand-gold/5 dark:bg-brand-gold/10 rounded-2xl border border-brand-gold/20 text-left">
                    <p className="text-sm font-bold text-brand-black dark:text-white mb-2">Need a specific Service?</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Sofa Cleaning..."
                        value={requestServiceName}
                        onChange={(e) => setRequestServiceName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 text-sm focus:border-brand-gold outline-none"
                      />
                      <button
                        onClick={handleRequestService}
                        disabled={isRequesting || !requestServiceName.trim()}
                        className="px-4 py-2 bg-brand-gold text-brand-black font-bold rounded-lg hover:bg-brand-gold/80 disabled:opacity-50 transition-all text-xs"
                      >
                        {isRequesting ? '...' : 'Request'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Request Service Section (Always visible) */}
          <div className="mb-10 p-6 bg-brand-gold/5 dark:bg-brand-gold/10 rounded-3xl border border-brand-gold/20">
            <h3 className="text-lg font-bold text-brand-black dark:text-white mb-2 flex items-center gap-2">
              <Send size={18} className="text-brand-gold" />
              Don't see the Service you need?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the Service name below and request {worker.name} to add it to their catalog.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Sofa Cleaning, Tap Repair..."
                value={requestServiceName}
                onChange={(e) => setRequestServiceName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 text-sm focus:border-brand-gold outline-none transition-all"
                maxLength={30}
              />
              <button
                onClick={handleRequestService}
                disabled={isRequesting || !requestServiceName.trim()}
                className="px-6 py-3 bg-brand-gold text-brand-black font-bold rounded-xl hover:bg-brand-gold/80 disabled:opacity-50 transition-all text-sm"
              >
                {isRequesting ? 'Sending...' : 'Request'}
              </button>
            </div>
            
            {requestStatus === 'success' && (
              <p className="text-xs text-green-500 font-bold mt-2">Request sent successfully!</p>
            )}
            {requestStatus === 'error' && (
              <p className="text-xs text-red-500 font-bold mt-2">Failed to send request. Try again.</p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Identity</p>
                <p className="text-sm font-bold text-brand-black dark:text-white">Verified</p>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <BadgeCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Trust Score</p>
                <p className="text-sm font-bold text-brand-black dark:text-white">98% Positive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f172a]/50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            * All Services are subject to availability and distance charges.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 dark:bg-white/10 text-brand-black dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

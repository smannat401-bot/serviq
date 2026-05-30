import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, MapPin, Tag, User } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../../config';
import { useState, useEffect } from 'react';

interface IncomingBookingModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncomingBookingModal({ booking, onClose, onSuccess }: IncomingBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    // Play sound repeatedly until answered or unmounted
    audio.loop = true;
    audio.play().catch(e => console.log('Autoplay prevented:', e));
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  if (!booking) return null;

  const handleAction = async (status: 'Accepted' | 'Rejected') => {
    setIsSubmitting(true);
    audio.pause();
    
    try {
      const res = await fetch(`${API_URL}/api/bookings/${booking._id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status, 
          cancelledBy: status === 'Rejected' ? 'worker' : undefined,
          cancellationReason: status === 'Rejected' ? 'Rejected new booking request' : undefined
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update booking status');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-brand-electricBlue/20"
        >
          {/* Animated Header */}
          <div className="bg-brand-electricBlue p-6 text-center relative overflow-hidden">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
            />
            <h2 className="text-white text-2xl font-bold relative z-10">New Job Request!</h2>
            <p className="text-blue-100 text-sm relative z-10 mt-1">Please respond quickly</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
              <User className="text-brand-electricBlue" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Client Name</p>
                <p className="font-bold text-brand-black dark:text-white">{booking.client?.name || 'Client'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
              <Tag className="text-brand-gold" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Service Requested</p>
                <p className="font-bold text-brand-black dark:text-white">{booking.serviceName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
              <MapPin className="text-green-500" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Location</p>
                <p className="font-bold text-brand-black dark:text-white truncate max-w-[220px]">{booking.client?.serviceArea || booking.location || 'Local Area'}</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => handleAction('Rejected')}
                disabled={isSubmitting}
                className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors rounded-2xl font-bold"
              >
                <XCircle size={28} />
                Reject
              </button>
              <button 
                onClick={() => handleAction('Accepted')}
                disabled={isSubmitting}
                className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-green-50 text-green-500 dark:bg-green-500/10 hover:bg-green-500 hover:text-white transition-colors rounded-2xl font-bold shadow-lg"
              >
                <CheckCircle2 size={28} />
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

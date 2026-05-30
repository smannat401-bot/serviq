import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { API_URL } from '../../config';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess: () => void;
}

export default function CancellationModal({ isOpen, onClose, bookingId, onSuccess }: CancellationModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }

    if (!window.confirm('Are you absolutely sure? This will count towards your cancellation limit.')) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Cancelled', 
          cancelledBy: 'worker',
          cancellationReason: reason 
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="glass-card w-full max-w-md overflow-hidden flex flex-col rounded-t-3xl md:rounded-3xl"
          >
            {/* Mobile Drag Indicator */}
            <div className="md:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-4 mb-0"></div>
            <div className="flex justify-between items-center p-6">
              <h2 className="text-xl font-bold text-brand-black dark:text-white">Cancel Booking</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-xs text-red-600 font-bold">
                    कैंसिलेशन पेनल्टी केवल बुकिंग स्वीकार करने के बाद लागू होगी।
                  </p>
                  <p className="text-[10px] text-red-500 font-medium leading-tight">
                    Cancellation penalties apply only after booking acceptance. Cancelling an active booking affects your Honour Score and may lead to account blocking.
                  </p>
                </div>
              </div>

              {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. My bike broke down, or Health emergency..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-red-500 text-brand-black dark:text-white resize-none"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-xl transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

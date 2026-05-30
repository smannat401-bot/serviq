import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../../config';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess: () => void;
}

export default function CompletionModal({ isOpen, onClose, bookingId, onSuccess }: CompletionModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError('Please enter a valid 4-digit code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setCode('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md overflow-hidden flex flex-col relative rounded-t-3xl md:rounded-3xl"
      >
        {/* Mobile Drag Indicator */}
        <div className="md:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-4 mb-2"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          {success ? (
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-brand-black dark:text-white">Verification Successful!</h3>
              <p className="text-gray-500">Job marked as completed.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-electricBlue/10 rounded-full flex items-center justify-center text-brand-electricBlue mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-2">Verify Completion</h2>
                <p className="text-gray-500 text-sm">Please ask the client for the 4-digit secret code to mark this job as completed.</p>
              </div>

              {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold mb-4 text-center">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input 
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-Digit Code"
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white text-center text-2xl font-bold tracking-[0.5em]"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || code.length !== 4}
                  className="w-full py-4 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Verify & Complete'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

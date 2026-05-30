import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  workerId: string;
  workerName: string;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, bookingId, workerId, workerName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/services/${workerId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          bookingId,
          clientId: user._id,
          clientName: user.name || 'Client'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setRating(5);
        setComment('');
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
              <h3 className="text-2xl font-bold text-brand-black dark:text-white">Review Submitted!</h3>
              <p className="text-gray-500">Thank you for sharing your experience.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-2">Rate {workerName}</h2>
                <p className="text-gray-500 text-sm">How was your Service?</p>
              </div>

              {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold mb-4">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={36} 
                        className={star <= rating ? "fill-brand-gold text-brand-gold" : "text-gray-300 dark:text-gray-700"} 
                      />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Write a Review</label>
                  <textarea 
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Submit Review'
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('serviq_cookie_consent');
    if (!consent) {
      // Show after a small delay to not overwhelm the user immediately on load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('serviq_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('serviq_cookie_consent', 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-[60] flex flex-col gap-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" role="img" aria-label="cookie">🍪</span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">We value your privacy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button 
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Decline
            </button>
            <button 
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition shadow-md"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';

export default function RegisterSelect() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">
          Join <span className="text-gradient">SERVIQ</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          How would you like to use our platform?
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <Link
            to="/register/client"
            className="block h-full glass-card p-10 text-center hover:-translate-y-2 hover:border-brand-electricBlue/50 transition-all duration-300 group"
          >
            <div className="w-24 h-24 mx-auto bg-brand-electricBlue/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User size={48} className="text-brand-electricBlue" />
            </div>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-3">I want to hire</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Find and book trusted professionals for your home repairs and Services.
            </p>
            <span className="inline-block px-8 py-3 rounded-full bg-brand-black text-white dark:bg-white dark:text-brand-black font-semibold group-hover:shadow-lg transition-all">
              Sign up as User
            </span>
          </Link>
        </motion.div>

        {/* Partner Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <Link
            to="/register/worker"
            className="block h-full glass-card p-10 text-center hover:-translate-y-2 hover:border-brand-gold/50 transition-all duration-300 group"
          >
            <div className="w-24 h-24 mx-auto bg-brand-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={48} className="text-brand-gold" />
            </div>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-3">I want to work</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Offer your Services, set your own prices, and grow your independent business.
            </p>
            <span className="inline-block px-8 py-3 rounded-full bg-brand-black text-white dark:bg-white dark:text-brand-black font-semibold group-hover:shadow-lg transition-all">
              Sign up as Partner
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

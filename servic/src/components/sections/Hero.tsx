import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-electricBlue/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Logo size="hero" withTagline={true} className="mb-12" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-brand-electricBlue/30 text-brand-electricBlue dark:text-brand-lightBlue text-sm font-semibold mb-4"
          >
            <Sparkles size={16} />
            <span>AI-Powered Marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-brand-black dark:text-brand-white leading-tight"
          >
            Find Trusted Repair <br />
            <span className="text-gradient">Experts Near You</span> — Instantly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Book verified partners for home repairs, appliances, electrical, AC, plumbing, mobile repair, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-black text-white dark:bg-brand-white dark:text-brand-black font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
              Book Service
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full glass font-semibold text-lg text-brand-black dark:text-brand-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Become a Partner
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

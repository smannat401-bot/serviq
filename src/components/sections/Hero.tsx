import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Hero() {
  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const isWorker = user.role === 'worker';

  return (
    <section className="relative min-h-[100svh] lg:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero_background_Service_1777466291767.png" 
          alt="SERVIQ Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20 scale-105 animate-float-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-white via-brand-white/80 to-brand-white dark:from-[#050505] dark:via-[#050505]/90 dark:to-[#050505]"></div>
      </div>

      {/* Animated Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-brand-electricBlue/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10 w-full">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <Logo size="hero" withTagline={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-2 rounded-full glass-card border-brand-electricBlue/20 text-brand-electricBlue dark:text-brand-lightBlue text-xs md:text-sm font-bold tracking-widest uppercase mb-4"
          >
            <Sparkles size={16} className="animate-spin-slow" />
            <span>AI-Driven Service Ecosystem</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-8xl font-extrabold tracking-tight text-brand-black dark:text-brand-white leading-[1.1]"
          >
            Your Vision, <br />
            <span className="text-gradient">Our Expertise.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            The future of on-demand Services. Connect with elite pros for home, tech, and creative solutions—delivered at the speed of thought.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 lg:gap-6 pt-8 lg:pt-10 w-full px-2 lg:px-0"
          >
            <Link
              to={isWorker ? "/worker-dashboard" : "/explore"}
              className="btn-primary w-full lg:w-auto"
            >
              {isWorker ? "Partner Dashboard" : "Get Started Now"}
              <ArrowRight size={22} className="ml-2" />
            </Link>
            {!user?._id && (
              <Link
                to="/register"
                className="w-full lg:w-auto px-8 py-4 rounded-full glass font-bold text-base lg:text-lg text-brand-black dark:text-brand-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-white/20"
              >
                Join as a Partner
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="section-spacing relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-brand-black dark:bg-white p-8 lg:p-24 text-center">
          {/* Background Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-brand-electricBlue/20 dark:bg-brand-electricBlue/10 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-brand-gold/20 dark:bg-brand-gold/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center gap-1 text-brand-gold"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={24} fill="currentColor" />
              ))}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-7xl font-black text-white dark:text-brand-black tracking-tight"
            >
              Ready to Experience the <br />
              <span className="text-brand-electricBlue">Future of Service?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg lg:text-2xl text-gray-400 dark:text-gray-600 font-medium"
            >
              Join thousands of happy users and verified professionals on India's most advanced Service marketplace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 lg:gap-6 pt-4"
            >
              <Link
                to="/explore"
                className="w-full lg:w-auto px-6 py-4 lg:px-10 lg:py-5 rounded-full bg-brand-electricBlue text-white font-bold text-lg lg:text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(0,82,255,0.4)] flex items-center justify-center gap-3"
              >
                Book Your First Service
                <ArrowRight size={24} />
              </Link>
              <Link
                to="/register"
                className="w-full lg:w-auto px-6 py-4 lg:px-10 lg:py-5 rounded-full border-2 border-white/20 dark:border-brand-black/10 text-white dark:text-brand-black font-bold text-lg lg:text-xl hover:bg-white/10 dark:hover:bg-brand-black/5 transition-all flex items-center justify-center"
              >
                Become a Partner
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

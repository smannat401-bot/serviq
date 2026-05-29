import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-6">About SERVIQ</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mx-auto">
            We are on a mission to organize the unorganized home services sector. By bridging the gap between skilled professionals and homeowners, we are building a marketplace founded entirely on trust.
          </p>
        </div>

        {/* Why we started */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 mb-12 bg-gradient-to-br from-brand-electricBlue/5 to-transparent"
        >
          <div className="w-16 h-16 bg-brand-electricBlue/10 rounded-2xl flex items-center justify-center text-brand-electricBlue mb-6">
            <Heart size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">Why SERVIC was created</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            For decades, local professionals like electricians and plumbers have struggled with inconsistent work, wage theft, and haggling. On the flip side, users have faced issues with unprofessional service, price gouging, and lack of accountability.
          </p>
          <p className="text-gray-500 leading-relaxed">
            SERVIC was created to solve this double-sided problem. We provide a premium, structured platform where professionals are respected and paid fairly, and users receive guaranteed, high-quality service.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-brand-electricBlue" size={28} />
              <h2 className="text-2xl font-bold text-brand-black dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-500 leading-relaxed">
              To empower blue-collar professionals with technology, providing them steady income, dignity of labor, and a platform to build their own successful micro-businesses.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-brand-gold" size={28} />
              <h2 className="text-2xl font-bold text-brand-black dark:text-white">Our Vision</h2>
            </div>
            <p className="text-gray-500 leading-relaxed">
              To become the world's most trusted home services marketplace, where booking a plumber is as easy and safe as ordering a meal online.
            </p>
          </motion.div>
        </div>

        {/* Trust Wallet & Safety */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 md:p-12 border-green-500/20"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">The Trust Wallet Innovation</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Our core innovation is the <strong>Trust Wallet Payment System</strong>. We realized that trust is the biggest barrier in local services. 
            By holding the user's payment in an escrow wallet and only releasing it to the partner upon verification (using a secret 4-digit code), we completely eliminate fraud. 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-brand-black dark:text-white mb-2">Partner Safety</h3>
              <p className="text-sm text-gray-500">Partners are guaranteed payment. No more chasing users for money after the hard work is done.</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-brand-black dark:text-white mb-2">User Safety</h3>
              <p className="text-sm text-gray-500">Users are guaranteed service. The money never leaves the platform until they are 100% satisfied and hand over the code.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, IndianRupee, AlertTriangle } from 'lucide-react';
import SEO from '../components/seo/SEO';


export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <SEO title="Pricing" description="Transparent pricing for all SERVIQ services. No hidden fees." url="https://serviq.com/pricing" />
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">Transparent Pricing</h1>
          <p className="text-gray-500 text-lg">No hidden fees. We believe in clear, fair pricing for both our users and our professional partners.</p>
        </div>

        {/* Core Pricing Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8"
          >
            <div className="w-16 h-16 bg-brand-electricBlue/10 rounded-2xl flex items-center justify-center text-brand-electricBlue mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">Platform Commission</h2>
            <p className="text-gray-500 mb-6">SERVIQ charges a flat <strong className="text-brand-electricBlue">18% commission</strong> on all completed jobs. This fee helps us maintain the platform, provide customer support, and ensure our Trust Wallet security system runs smoothly.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-electricBlue"></span> Platform Maintenance
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-electricBlue"></span> Secure Payment Gateway
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-electricBlue"></span> 24/7 Customer Support
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 bg-gradient-to-br from-brand-electricBlue/5 to-transparent border-brand-electricBlue/20"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6">
              <IndianRupee size={32} />
            </div>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">Partner Earnings</h2>
            <p className="text-gray-500 mb-6">Partners take home <strong className="text-green-500">82%</strong> of every job they complete successfully.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-brand-black dark:text-white font-bold">₹150 Job</span>
                <span className="text-green-500 font-bold flex items-center gap-1"><ArrowRight size={14}/> Partner gets ₹123.00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-brand-black dark:text-white font-bold">₹300 Job</span>
                <span className="text-green-500 font-bold flex items-center gap-1"><ArrowRight size={14}/> Partner gets ₹246.00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-brand-black dark:text-white font-bold">₹400 Job</span>
                <span className="text-green-500 font-bold flex items-center gap-1"><ArrowRight size={14}/> Partner gets ₹328.00</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6 flex gap-4">
            <div className="mt-1">
              <Wallet className="text-brand-gold" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-black dark:text-white mb-2">Trust Wallet System</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                User payments are securely held in the SERVIQ Escrow Wallet. The funds are ONLY released to the partner when the user provides the secret 4-digit verification code after the job is completed to satisfaction.
              </p>
            </div>
          </div>
          
          <div className="glass-card p-6 flex gap-4">
            <div className="mt-1">
              <AlertTriangle className="text-orange-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-black dark:text-white mb-2">Emergency Charges</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Need immediate help? Bookings scheduled within 2 hours or during late night hours (10 PM - 6 AM) incur a ₹150 emergency convenience charge, which goes entirely to the partner to compensate for the urgency.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}

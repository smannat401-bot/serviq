import { motion } from 'framer-motion';
import { Search, CreditCard, Briefcase, CheckCircle, Key, Wallet } from 'lucide-react';
import SEO from '../components/seo/SEO';


const steps = [
  {
    id: 1,
    title: 'User Books a Service',
    desc: 'Browse our directory, select a verified professional, pick a time slot, and book instantly.',
    icon: Search,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 2,
    title: 'Payment Held in Trust Wallet',
    desc: 'Pay securely upfront. The money is held safely in the SERVIQ Escrow Wallet, not given to the partner yet.',
    icon: CreditCard,
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/10',
  },
  {
    id: 3,
    title: 'Partner Accepts & Arrives',
    desc: 'The professional accepts the job request, travels to your location, and begins the work.',
    icon: Briefcase,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 4,
    title: 'Job Completed',
    desc: 'The partner finishes the Service and marks the job as completed in their dashboard.',
    icon: CheckCircle,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 5,
    title: 'User Provides 4-Digit Code',
    desc: 'If satisfied with the work, the user gives a secret 4-digit verification code to the partner.',
    icon: Key,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    id: 6,
    title: 'Payment Automatically Released',
    desc: 'The partner enters the code. 82% is instantly deposited to their wallet, and 18% goes to the platform.',
    icon: Wallet,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <SEO title="How It Works" description="Learn how to book a service or become a verified professional on SERVIQ." url="https://serviq.com/howitworks" />
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">How It Works</h1>
          <p className="text-gray-500 text-lg">Our core Trust System ensures 100% security for both users and professionals.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-8 bottom-8 w-1 bg-gray-200 dark:bg-gray-800 -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center justify-between md:justify-normal ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
              >

                {/* Icon Circle */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white dark:bg-[#0f172a] border-4 border-gray-50 dark:border-[#060a14] flex items-center justify-center z-10 shadow-lg">
                  <div className={`w-12 h-12 rounded-full ${step.bg} flex items-center justify-center ${step.color}`}>
                    <step.icon size={24} />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] ${index % 2 === 0 ? 'ml-auto md:ml-0 md:mr-auto text-left md:text-right' : 'ml-auto text-left'}`}>
                  <div className="glass-card p-6 hover:border-brand-electricBlue/30 transition-colors">
                    <span className="text-sm font-bold text-gray-400 mb-2 block">Step 0{step.id}</span>
                    <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center glass-card p-8 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-4">Zero Risk Guarantee</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Because the payment is never released without the client's verification code, clients are protected from incomplete work, and workers are protected from non-payment.
          </p>
        </div>
      </div>
    </div>
  );
}

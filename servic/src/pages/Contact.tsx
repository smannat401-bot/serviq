import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "How do I book a professional?",
    a: "Browse the directory or search for a specific service. Select a professional, choose your time slot, and click 'Book Now'. You'll then securely pay the amount into the SERVIQ Trust Wallet."
  },
  {
    q: "What is the 4-digit verification code?",
    a: "When you book a service, you receive a secret 4-digit code. You must only give this code to the worker AFTER they have completed the job to your satisfaction. The worker needs this code to release the funds from the Trust Wallet to their account."
  },
  {
    q: "What happens if a worker doesn't show up?",
    a: "If a worker fails to arrive, you can cancel the booking from your dashboard, and the funds held in the Trust Wallet will be refunded to your original payment method immediately."
  },
  {
    q: "How do I become a registered professional?",
    a: "Click on 'Join as a Pro' in the footer, fill out the registration form, upload your ID proof, and our team will verify your account within 24-48 hours."
  }
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">Contact Support</h1>
          <p className="text-gray-500 text-lg">We're here to help! Reach out to us if you have any questions or issues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-electricBlue/10 rounded-2xl flex items-center justify-center text-brand-electricBlue mb-4">
              <Phone size={28} />
            </div>
            <h3 className="font-bold text-brand-black dark:text-white mb-2">Phone Support</h3>
            <p className="text-gray-500 text-sm mb-4">Available 9 AM to 8 PM</p>
            <a href="tel:6283622035" className="text-xl font-bold text-brand-electricBlue hover:underline">6283622035</a>
          </div>

          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-4">
              <Mail size={28} />
            </div>
            <h3 className="font-bold text-brand-black dark:text-white mb-2">Email Support</h3>
            <p className="text-gray-500 text-sm mb-4">Drop us a line anytime</p>
            <a href="mailto:support@servic.com" className="text-lg font-bold text-brand-black dark:text-white hover:text-brand-electricBlue transition-colors">support@servic.com</a>
          </div>

          <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-electricBlue transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></div>
            <div className="relative z-10 w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-4 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <MessageCircle size={28} />
            </div>
            <h3 className="font-bold text-brand-black dark:text-white mb-2 group-hover:text-white transition-colors relative z-10">Live Chat</h3>
            <p className="text-gray-500 text-sm mb-4 group-hover:text-white/80 transition-colors relative z-10">Chat with our support agents</p>
            <button className="px-6 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl relative z-10 group-hover:bg-white group-hover:text-brand-electricBlue shadow-lg">
              Start Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md">
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="glass-card overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center bg-transparent focus:outline-none"
                  >
                    <span className="font-bold text-brand-black dark:text-white">{faq.q}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-100 dark:border-gray-800 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

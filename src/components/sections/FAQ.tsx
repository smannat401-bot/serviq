import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does SERVIQ work?",
    answer: "Simply search for the repair Service you need, view a list of nearby verified professionals, and book them instantly through our platform. You can chat with them directly and track their arrival."
  },
  {
    question: "How do I book a worker?",
    answer: "Once you find a suitable worker, click on their profile to view their availability calendar. Select a date and time slot that works for you, confirm the booking, and you're set!"
  },
  {
    question: "How does worker registration work?",
    answer: "Professionals can sign up via our Pro Portal. You'll need to submit your ID, certifications, and pass a background check. Once approved, you can set your pricing, radius, and availability."
  },
  {
    question: "How does payment work?",
    answer: "Payments are handled securely through our platform. We hold the payment in escrow until the job is completed to your satisfaction. We support all major credit cards and digital wallets."
  },
  {
    question: "How are nearby workers shown?",
    answer: "Our AI-powered recommendation engine uses your device's location to match you with available professionals within your selected radius, prioritizing those with the highest ratings and fastest response times."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-12 lg:py-24 px-4 lg:px-6 bg-white dark:bg-brand-darkBlue">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-2xl lg:text-4xl font-bold text-brand-black dark:text-white mb-2 lg:mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-3 lg:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#0f172a]/50 overflow-hidden"
            >
              <button
                className="w-full px-4 lg:px-6 py-4 lg:py-5 min-h-[44px] flex items-center justify-between text-left focus:outline-none"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="font-semibold text-base lg:text-lg text-brand-black dark:text-white pr-4 lg:pr-8">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`text-brand-electricBlue transition-transform duration-300 flex-shrink-0 ${activeIndex === index ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-4 lg:px-6 pb-4 lg:pb-6 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

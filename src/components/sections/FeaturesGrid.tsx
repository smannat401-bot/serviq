import { motion } from 'framer-motion';
import { Shield, Zap, Clock, Smartphone, Star, Heart } from 'lucide-react';

const features = [
  {
    title: 'Instant Booking',
    description: 'Find and book the perfect repair pro in less than 60 seconds.',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Verified Partners',
    description: 'Every pro is background-checked and skill-verified for your peace of mind.',
    icon: Shield,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: '24/7 Support',
    description: 'Our dedicated support team is always here to help you out.',
    icon: Clock,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    title: 'Mobile Friendly',
    description: 'Manage bookings and track workers directly from your smartphone.',
    icon: Smartphone,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    title: 'Top Rated Pros',
    description: 'Only the best of the best. We maintain a strict quality standard.',
    icon: Star,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'Fair Pricing',
    description: 'Transparent costs with no hidden fees. Pay after you are satisfied.',
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section-spacing bg-white dark:bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-brand-black dark:text-white mb-6"
          >
            Why Choose <span className="text-gradient">SERVIQ</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400"
          >
            We've redefined the Service experience with cutting-edge technology and a focus on quality.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 hover:border-brand-electricBlue/30 group"
            >
              <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-brand-black dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

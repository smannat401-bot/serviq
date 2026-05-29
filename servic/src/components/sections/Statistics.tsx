import { motion } from 'framer-motion';
import { Users, Wrench, Star, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

export default function Statistics() {
  const [counts, setCounts] = useState({ workers: 0, repairs: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          workers: data.totalWorkers || 0,
          repairs: data.totalAllBookings || 0
        });
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const stats = [
    { id: 1, name: 'Repairs Completed', value: counts.repairs > 0 ? `${counts.repairs}+` : '---', icon: Wrench },
    { id: 2, name: 'Verified Partners', value: counts.workers > 0 ? `${counts.workers}+` : '---', icon: Users },
    { id: 3, name: 'User Satisfaction', value: '98%', icon: Star },
    { id: 4, name: 'Service Support', value: '24/7', icon: ShieldCheck },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-brand-black dark:bg-[#040812]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-electricBlue/20 via-transparent to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-electricBlue to-brand-gold flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,82,255,0.4)]">
                <stat.icon size={28} className="text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 font-medium">
                {stat.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

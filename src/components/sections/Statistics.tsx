import { motion, animate } from 'framer-motion';
import { Users, Wrench, Star, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={ref}>0</span>;
}

export default function Statistics() {
  const [counts, setCounts] = useState({ workers: 0, repairs: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          workers: data.totalWorkers || 150, // Fallback for demo
          repairs: data.totalAllBookings || 2500
        });
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setCounts({ workers: 150, repairs: 2500 });
      });
  }, []);

  const stats = [
    { id: 1, name: 'Repairs Completed', value: counts.repairs, suffix: '+', icon: Wrench },
    { id: 2, name: 'Verified Partners', value: counts.workers, suffix: '+', icon: Users },
    { id: 3, name: 'User Satisfaction', value: 98, suffix: '%', icon: Star },
    { id: 4, name: 'Service Support', value: 24, suffix: '/7', icon: ShieldCheck },
  ];

  return (
    <section className="section-spacing relative overflow-hidden bg-[#050505]">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-electricBlue/10 via-transparent to-transparent opacity-60"></div>
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group flex flex-col items-center p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-electricBlue/30 transition-all duration-500"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-electricBlue via-[#8B5CF6] to-brand-gold flex items-center justify-center mb-6 lg:mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-2 lg:mb-3 tracking-tighter">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
                {stat.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

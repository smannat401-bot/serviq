import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, Droplets, Wind, Smartphone, Laptop, Tv, 
  WashingMachine, Refrigerator, Hammer, Wrench, Sparkles, Paintbrush 
} from 'lucide-react';

const categories = [
  { name: 'Electrician', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { name: 'Plumber', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'AC Repair', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { name: 'Mobile Repair', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Laptop Repair', icon: Laptop, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { name: 'TV Repair', icon: Tv, color: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'Washing Machine', icon: WashingMachine, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { name: 'Refrigerator', icon: Refrigerator, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { name: 'Carpenter', icon: Hammer, color: 'text-amber-700', bg: 'bg-amber-700/10' },
  { name: 'Mechanic', icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  { name: 'Home Cleaning', icon: Sparkles, color: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'Painting', icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export default function Categories() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <section className="py-8 lg:py-20 px-4 lg:px-6 bg-gray-50/50 dark:bg-[#080d1a]">
      <div className="container mx-auto">
        <div className="text-center mb-6 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-black dark:text-white mb-4">
            Explore <span className="text-gradient">Categories</span>
          </h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find the right professional for any repair job around your home or office.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.name}
              variants={item}
              className="w-full h-full"
            >
              <Link
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center justify-center p-3 lg:p-6 bg-white dark:bg-[#0f172a] rounded-xl lg:rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-brand-electricBlue/50 hover:shadow-xl hover:shadow-brand-electricBlue/10 transition-all duration-300 h-full w-full"
              >
                <div className={`w-11 h-11 lg:w-16 lg:h-16 rounded-lg lg:rounded-2xl ${category.bg} flex items-center justify-center mb-2 lg:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <category.icon className={`${category.color} w-5 h-5 lg:w-8 lg:h-8`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xs lg:text-sm font-semibold text-center text-gray-800 dark:text-gray-200 group-hover:text-brand-electricBlue transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

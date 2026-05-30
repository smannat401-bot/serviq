import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { API_URL } from '../../config';

const fallbackTestimonials = [
  {
    id: 'f1',
    content: "SERVIQ completely changed how I handle home repairs. Found an electrician in 5 minutes, and he was at my door within the hour. Incredible platform!",
    author: "Jessica M.",
    role: "Verified Homeowner",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    id: 'f2',
    content: "As a freelance plumber, this app is my main source of income now. The AI dashboard is so easy to use, and the premium clients are great to work with.",
    author: "Mark T.",
    role: "Verified Pro",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 'f3',
    content: "Sleek, fast, and reliable. The location tracking feature let me see exactly when the mechanic would arrive to fix my car on the highway.",
    author: "Alex P.",
    role: "Business Owner",
    image: "https://i.pravatar.cc/150?img=33"
  },
  {
    id: 'f4',
    content: "The quality of work is unmatched. I've used SERVIQ for everything from painting to tech support. Always a 5-star experience.",
    author: "David L.",
    role: "Property Manager",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: 'f5',
    content: "Transparent pricing and verified experts. I never have to worry about overpaying or poor craftsmanship anymore.",
    author: "Sarah K.",
    role: "Solo Traveler",
    image: "https://i.pravatar.cc/150?img=20"
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/services/testimonials`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((t, index) => ({
            id: t.id || index,
            content: t.content,
            author: t.author,
            role: t.role || (t.workerSkill ? `${t.workerSkill} Expert` : 'Verified User'),
            image: `https://i.pravatar.cc/150?u=${t.author}`
          }));
          setTestimonials(formatted);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      })
      .catch(() => setTestimonials(fallbackTestimonials));
  }, []);

  // Double the testimonials for seamless loop
  const displayTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="section-spacing bg-white dark:bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 mb-10 lg:mb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-6xl font-black text-brand-black dark:text-white mb-4 lg:mb-6"
        >
          Voices of our <span className="text-gradient">Community.</span>
        </motion.h2>
        <p className="text-base lg:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Hear from the thousands of people who rely on SERVIQ for their daily needs.
        </p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex gap-8 whitespace-nowrap py-10"
        >
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="w-[300px] lg:w-[450px] shrink-0 glass-card p-6 lg:p-10 whitespace-normal border-gray-100 dark:border-white/10"
            >
              <div className="flex gap-1 mb-6 lg:mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-brand-gold fill-brand-gold" />
                ))}
              </div>

              <div className="relative mb-6 lg:mb-10">
                <Quote size={40} className="absolute -top-4 -left-4 text-brand-electricBlue/10" />
                <p className="text-base lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="flex items-center gap-5">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-electricBlue/20 shadow-lg"
                />
                <div>
                  <h4 className="font-bold text-brand-black dark:text-white text-base lg:text-lg leading-tight">{testimonial.author}</h4>
                  <p className="text-xs lg:text-sm text-brand-electricBlue font-bold uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

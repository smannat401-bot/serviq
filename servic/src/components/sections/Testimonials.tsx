import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    content: "SERVIQ completely changed how I handle home repairs. Found an electrician in 5 minutes, and he was at my door within the hour. Incredible platform!",
    author: "Jessica M.",
    role: "Homeowner",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    id: 2,
    content: "As a freelance plumber, this app is my main source of income now. The AI dashboard is so easy to use, and the premium clients are great to work with.",
    author: "Mark T.",
    role: "Verified Pro",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 3,
    content: "Sleek, fast, and reliable. The location tracking feature let me see exactly when the mechanic would arrive to fix my car on the highway.",
    author: "Alex P.",
    role: "Business Owner",
    image: "https://i.pravatar.cc/150?img=33"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gray-50/50 dark:bg-[#080d1a]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-black dark:text-white mb-4">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 relative hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-gray-100/50 dark:shadow-none"
            >
              <div className="absolute top-6 right-6 text-brand-gold/20">
                <Quote size={40} />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-brand-gold fill-brand-gold" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-electricBlue/30"
                />
                <div>
                  <h4 className="font-bold text-brand-black dark:text-white">{testimonial.author}</h4>
                  <p className="text-sm text-brand-electricBlue font-medium">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { TrendingUp, Quote, Award } from 'lucide-react';

const stories = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Master Electrician',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
    earnings: '₹85,000/month',
    story: "Before joining SERVIQ, I struggled to find consistent daily work and had to rely on local contractors who took huge cuts. Now, I have full control over my schedule, my earnings have tripled, and the Trust Wallet guarantees I always get paid for my hard work on time.",
    growth: 'Earnings increased by 300% in 6 months'
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Home Cleaning Expert',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80',
    earnings: '₹45,000/month',
    story: "Safety was my biggest concern as a female professional visiting client homes. SERVIQ's strict verification process and emergency support give me peace of mind. Plus, the clients respect my time because they've already paid upfront into the platform.",
    growth: 'Completed 500+ 5-star jobs'
  },
  {
    id: 3,
    name: 'Amit Kumar',
    role: 'Senior AC Technician',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
    earnings: '₹1,20,000/month (Summer)',
    story: "During peak summer season, managing payments and bargaining with customers was a headache. With SERVIQ's transparent pricing, I just focus on fixing the ACs. The 4-digit code system is brilliant—no more arguments about payment after the job is done.",
    growth: 'Top Rated Pro 2025'
  }
];

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black dark:text-white mb-4">Worker Success Stories</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Real stories from real professionals who have transformed their careers and income using the SERVIQ marketplace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden flex flex-col"
            >
              <div className="p-6 pb-0 flex items-center gap-4 mb-6">
                <img src={story.img} alt={story.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-electricBlue" />
                <div>
                  <h3 className="font-bold text-lg text-brand-black dark:text-white">{story.name}</h3>
                  <p className="text-sm text-brand-electricBlue font-medium">{story.role}</p>
                </div>
              </div>
              
              <div className="px-6 mb-6 flex-1">
                <Quote className="text-gray-300 dark:text-gray-700 w-10 h-10 mb-2 rotate-180" />
                <p className="text-gray-600 dark:text-gray-400 italic text-sm leading-relaxed">{story.story}</p>
              </div>

              <div className="p-6 bg-gray-50/50 dark:bg-[#0f172a]/50 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Average Earnings</p>
                    <p className="font-bold text-brand-black dark:text-white">{story.earnings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Award size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Milestone</p>
                    <p className="font-bold text-brand-black dark:text-white text-sm">{story.growth}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 glass-card p-12 text-center bg-gradient-to-br from-brand-electricBlue/10 to-transparent border-brand-electricBlue/20">
          <h2 className="text-3xl font-bold text-brand-black dark:text-white mb-4">Ready to write your own success story?</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">Join thousands of professionals who are taking control of their income and schedule.</p>
          <a href="/register/worker" className="inline-block px-8 py-4 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-electricBlue/20">
            Join as a Pro Today
          </a>
        </div>
      </div>
    </div>
  );
}

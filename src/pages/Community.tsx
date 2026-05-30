import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, User, Search, PlusCircle } from 'lucide-react';
import SEO from '../components/seo/SEO';


const threads = [
  {
    id: 1,
    author: 'Rahul S.',
    avatar: 'R',
    category: 'Service Problems',
    title: 'How to handle stubborn rust on old AC compressor valves?',
    content: 'I had a job yesterday where the valve was completely rusted shut. WD-40 didn\'t work. What do you guys use in this situation?',
    likes: 24,
    replies: 12,
    time: '2 hours ago'
  },
  {
    id: 2,
    author: 'Priya P.',
    avatar: 'P',
    category: 'Tips & Tricks',
    title: 'Best eco-friendly cleaning solutions for marble floors?',
    content: 'Clients are increasingly asking for chemical-free cleaning. Any recommendations for marble floors that won\'t damage the finish?',
    likes: 45,
    replies: 8,
    time: '5 hours ago'
  },
  {
    id: 3,
    author: 'Admin',
    avatar: 'A',
    category: 'Updates',
    title: 'NEW FEATURE: Wallet Withdrawals now process in 2 hours!',
    content: 'We have upgraded our payment gateway. All withdrawal requests submitted before 4 PM will be processed within 2 hours.',
    likes: 156,
    replies: 34,
    time: '1 day ago'
  }
];

export default function Community() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-16 px-6">
      <SEO title="Community" description="Join the SERVIQ community to share tips and find trusted advice." url="https://serviq.com/community" />
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-brand-black dark:text-white mb-2">Pro Community</h1>
            <p className="text-gray-500 dark:text-gray-400">Ask questions, share tips, and grow together.</p>
          </div>
          <button className="px-6 py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2">
            <PlusCircle size={20} /> New Discussion
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Tips', 'Problems', 'Updates'].map((filter, i) => (
              <button key={i} className={`px-4 py-3 rounded-xl font-bold text-sm border ${i === 0 ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-transparent' : 'bg-white dark:bg-[#0f172a] text-gray-500 border-gray-100 dark:border-gray-800 hover:border-brand-electricBlue'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Forum List */}
        <div className="space-y-4">
          {threads.map((thread, index) => (
            <motion.div 
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 flex gap-4 hover:border-brand-electricBlue/30 transition-colors cursor-pointer"
            >
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center text-xl font-bold text-gray-500 shrink-0">
                {thread.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    thread.category === 'Updates' ? 'bg-green-500/10 text-green-500' :
                    thread.category === 'Tips & Tricks' ? 'bg-brand-gold/10 text-brand-gold' :
                    'bg-brand-electricBlue/10 text-brand-electricBlue'
                  }`}>
                    {thread.category}
                  </span>
                  <span className="text-xs text-gray-500">• {thread.time}</span>
                </div>
                <h3 className="text-lg font-bold text-brand-black dark:text-white mb-2">{thread.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{thread.content}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <User size={16} /> {thread.author}
                  </div>
                  <div className="flex items-center gap-1 hover:text-brand-electricBlue transition-colors">
                    <ThumbsUp size={16} /> {thread.likes}
                  </div>
                  <div className="flex items-center gap-1 hover:text-brand-electricBlue transition-colors">
                    <MessageSquare size={16} /> {thread.replies} Replies
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white dark:bg-[#0f172a] text-brand-black dark:text-white font-bold rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
            Load More Discussions
          </button>
        </div>

      </div>
    </div>
  );
}

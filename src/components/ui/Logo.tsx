import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  withTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'splash';
}

export default function Logo({ className = '', withTagline = false, size = 'md' }: LogoProps) {

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ 
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="relative group"
      >
        {/* Circular White Badge */}
        <div className={`
          flex items-center justify-center 
          bg-white rounded-full 
          shadow-[0_20px_50px_rgba(0,0,0,0.15)] 
          dark:shadow-[0_20px_50px_rgba(0,82,255,0.2)]
          border-4 border-white
          overflow-hidden
          ${size === 'sm' ? 'w-10 h-10' : 
            size === 'md' ? 'w-16 h-16' : 
            size === 'lg' ? 'w-24 h-24' : 
            size === 'xl' ? 'w-32 h-32' : 
            size === 'hero' ? 'w-36 h-36 md:w-48 md:h-48' : 
            'w-44 h-44 md:w-56 md:h-56'}
        `}>
          <motion.img 
            src="/logo.jpg" 
            alt="Serviq Logo" 
            animate={{ 
              y: [0, -5, 0],
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[85%] h-[85%] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iMjQiIHk9IjMyIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDA1MkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>
      </motion.div>
      
      {withTagline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-[10px] md:text-xs font-black tracking-[0.5em] text-gray-500 dark:text-gray-400 uppercase">
            BOOK. <span className="text-brand-gold">CONNECT.</span> GET THINGS DONE.
          </p>
          <div className="mt-2 h-[1px] w-12 mx-auto bg-gradient-to-r from-transparent via-brand-electricBlue to-transparent opacity-50" />
        </motion.div>
      )}
    </div>
  );
}

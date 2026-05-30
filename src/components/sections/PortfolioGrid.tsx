import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Smart AC Installation',
    category: 'Cooling Solutions',
    image: '/portfolio_1_ac_repair_1777466392948.png',
  },
  {
    title: 'Modern Lighting Setup',
    category: 'Electrical',
    image: '/portfolio_2_electrician_1777466472049.png',
  },
  {
    title: 'Custom Furniture Finish',
    category: 'Carpentry',
    image: '/portfolio_3_carpenter_1777466519160.png',
  },
  {
    title: 'Bathroom Renovation',
    category: 'Plumbing',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80',
  },
  {
    title: 'Appliance Restoration',
    category: 'Repair',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80',
  },
  {
    title: 'Kitchen Remodel',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80',
  }
];

export default function PortfolioGrid() {
  return (
    <section className="section-spacing bg-brand-white dark:bg-[#050505]">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 lg:mb-16 gap-4 lg:gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-6xl font-black text-brand-black dark:text-white mb-4 lg:mb-6"
            >
              Excellence in <br />
              <span className="text-gradient">Every Project.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 dark:text-gray-400"
            >
              A glimpse into the high-quality Service delivered by our expert partners every day.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <button className="btn-primary px-10">View Full Gallery</button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[350px] lg:h-[450px] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="inline-block px-3 py-1 lg:px-4 lg:py-1 rounded-full bg-brand-electricBlue text-white text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-3 lg:mb-4">
                  {project.category}
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-white">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 lg:hidden">
           <button className="btn-primary w-full">View Full Gallery</button>
        </div>
      </div>
    </section>
  );
}

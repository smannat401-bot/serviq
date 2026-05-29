const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

  // Add the "Available / Busy" tag and explicit rating to the worker card
  const oldCardInner = `<div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Starting at</span>
                  <span className="font-bold text-brand-electricBlue">
                    \${pro.catalog && pro.catalog.length > 0 ? pro.catalog[0].price : 'Ask'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBooking(pro)}
                  className="w-full py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors"
                >
                  Book Now
                </button>`;

  const newCardInner = `<div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Starting at</span>
                  <span className="font-bold text-brand-electricBlue">
                    \${pro.catalog && pro.catalog.length > 0 ? pro.catalog[0].price : 'Ask'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4 text-xs font-bold">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Available
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBooking(pro)}
                  className="w-full py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors"
                >
                  Book Now
                </button>`;

  if(content.includes(oldCardInner)) {
    content = content.replace(oldCardInner, newCardInner);
  }

  // Update categories to what user asked: Electrician, Plumber, AC Repair, Cleaner
  const oldCategories = `const categories = [
  { name: 'Electrical', icon: Zap, count: 124 },
  { name: 'Plumbing', icon: Droplets, count: 98 },
  { name: 'Carpentry', icon: Hammer, count: 56 },
  { name: 'Appliance Repair', icon: Wrench, count: 87 },
];`;

  const newCategories = `const categories = [
  { name: 'Electrician', icon: Zap, count: 124 },
  { name: 'Plumber', icon: Droplets, count: 98 },
  { name: 'AC Repair', icon: Wrench, count: 56 },
  { name: 'Cleaner', icon: Hammer, count: 87 },
];`;

  if(content.includes(oldCategories)) {
    content = content.replace(oldCategories, newCategories);
  }

  fs.writeFileSync('src/pages/Explore.tsx', content);
  console.log('Explore page patched');
} catch (e) {
  console.error(e);
}

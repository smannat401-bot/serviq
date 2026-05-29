import Hero from '../components/sections/Hero';
import SmartSearch from '../components/sections/SmartSearch';
import Categories from '../components/sections/Categories';
import NearbyWorkers from '../components/sections/NearbyWorkers';
import Statistics from '../components/sections/Statistics';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import PortfolioGrid from '../components/sections/PortfolioGrid';
import Testimonials from '../components/sections/Testimonials';
import CTASection from '../components/sections/CTASection';
import FAQ from '../components/sections/FAQ';

export default function Home() {
  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const isWorker = user.role === 'worker';

  return (
    <div className="flex flex-col bg-brand-white dark:bg-[#050505]">
      <Hero />
      {!isWorker && (
        <>
          <div className="relative z-20 -mt-16 md:-mt-24">
            <SmartSearch />
          </div>
          <FeaturesGrid />
          <Categories />
          <PortfolioGrid />
          <NearbyWorkers />
        </>
      )}
      <Statistics />
      <Testimonials />
      <CTASection />
      <FAQ />
    </div>
  );
}

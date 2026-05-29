import Hero from '../components/sections/Hero';
import SmartSearch from '../components/sections/SmartSearch';
import Categories from '../components/sections/Categories';
import NearbyWorkers from '../components/sections/NearbyWorkers';
import Statistics from '../components/sections/Statistics';
import Testimonials from '../components/sections/Testimonials';
import FAQ from '../components/sections/FAQ';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SmartSearch />
      <Categories />
      <NearbyWorkers />
      <Statistics />
      <Testimonials />
      <FAQ />
    </div>
  );
}

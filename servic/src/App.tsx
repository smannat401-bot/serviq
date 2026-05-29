import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import WorkerDashboard from './pages/WorkerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import RegisterSelect from './pages/RegisterSelect';
import RegisterClient from './pages/RegisterClient';
import RegisterWorker from './pages/RegisterWorker';
import Login from './pages/Login';
import Explore from './pages/Explore';
import AdminDashboard from './pages/AdminDashboard';
import ServicesDirectory from './pages/ServicesDirectory';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import SuccessStories from './pages/SuccessStories';
import Community from './pages/Community';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SplashScreen from './components/ui/SplashScreen';


const libraries: ("places")[] = ["places"];

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loadError) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Error loading Google Maps API</div>;
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-black text-white font-bold">Loading SERVIQ...</div>;
  }

  return (
    <Router>
      <SplashScreen isVisible={showSplash} />
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterSelect />} />
          <Route path="/register/client" element={<RegisterClient />} />
          <Route path="/register/worker" element={<RegisterWorker />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/categories" element={<ServicesDirectory />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

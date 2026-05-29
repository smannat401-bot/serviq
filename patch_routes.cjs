const fs = require('fs');

try {
  let content = fs.readFileSync('src/App.tsx', 'utf8');

  // Add imports
  const importsToAdd = `
import ServicesDirectory from './pages/ServicesDirectory';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import SuccessStories from './pages/SuccessStories';
import Community from './pages/Community';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
`;

  if(!content.includes('import ServicesDirectory')) {
    content = content.replace("import AdminDashboard from './pages/AdminDashboard';", "import AdminDashboard from './pages/AdminDashboard';" + importsToAdd);
  }

  // Add routes
  const routesToAdd = `
          <Route path="/categories" element={<ServicesDirectory />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
`;

  if(!content.includes('<Route path="/categories"')) {
    content = content.replace("<Route path=\"/admin-dashboard\" element={<AdminDashboard />} />", "<Route path=\"/admin-dashboard\" element={<AdminDashboard />} />" + routesToAdd);
  }

  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx routing updated');
} catch (e) {
  console.error(e);
}

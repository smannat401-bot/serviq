import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, CheckCircle, Navigation } from 'lucide-react';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { API_URL, getAuthHeaders } from '../../config';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  serviceName: string;
  basePrice: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const generateMapHtml = (token: string, wlat?: number, wlon?: number, clat?: number, clon?: number) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Map</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f8fafc; }
    .custom-marker-user { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #ef4444; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); color: white; font-size: 16px; cursor: pointer; transition: transform 0.2s ease; }
    .custom-marker-worker { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #3b82f6; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); color: white; font-size: 16px; cursor: pointer; transition: transform 0.2s ease; }
    .mapboxgl-popup-content { border-radius: 12px; padding: 10px 14px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid rgba(226,232,240,0.8); font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
  <script>
    const accessToken = "${token}";
    const wlat = ${wlat !== undefined ? wlat : 'NaN'};
    const wlon = ${wlon !== undefined ? wlon : 'NaN'};
    const clat = ${clat !== undefined ? clat : 'NaN'};
    const clon = ${clon !== undefined ? clon : 'NaN'};

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [!isNaN(clon) ? clon : 75.857, !isNaN(clat) ? clat : 30.901],
      zoom: 13,
      attributionControl: false
    });

    const markers = [];
    if (!isNaN(clat) && !isNaN(clon)) {
      const el = document.createElement('div');
      el.className = 'custom-marker-user';
      el.innerHTML = '🏠';
      markers.push(new mapboxgl.Marker(el).setLngLat([clon, clat]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<b>Your Location</b><br>Service Address')).addTo(map));
    }
    if (!isNaN(wlat) && !isNaN(wlon)) {
      const el = document.createElement('div');
      el.className = 'custom-marker-worker';
      el.innerHTML = '💼';
      markers.push(new mapboxgl.Marker(el).setLngLat([wlon, wlat]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<b>Worker Location</b><br>Service Provider')).addTo(map));
    }

    if (!isNaN(clat) && !isNaN(clon) && !isNaN(wlat) && !isNaN(wlon)) {
      const bounds = new mapboxgl.LngLatBounds().extend([clon, clat]).extend([wlon, wlat]);
      map.fitBounds(bounds, { padding: 60 });
      fetch(\`https://api.mapbox.com/directions/v5/mapbox/driving/\${wlon},\${wlat};\${clon},\${clat}?access_token=\${accessToken}&geometries=geojson&overview=full\`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            map.on('load', () => {
              map.addSource('route', { 'type': 'geojson', 'data': { 'type': 'Feature', 'properties': {}, 'geometry': data.routes[0].geometry } });
              map.addLayer({ 'id': 'route', 'type': 'line', 'source': 'route', 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.85 } });
            });
          } else { drawStraightLine(); }
        })
        .catch(err => { drawStraightLine(); });
    }

    function drawStraightLine() {
      map.on('load', () => {
        map.addSource('route', { 'type': 'geojson', 'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [[wlon, wlat], [clon, clat]] } } });
        map.addLayer({ 'id': 'route', 'type': 'line', 'source': 'route', 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2], 'line-opacity': 0.8 } });
      });
    }
  </script>
</body>
</html>`;
}

export default function BookingModal({ isOpen, onClose, workerId, workerName, serviceName, basePrice, availability }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');


  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [workerBookings, setWorkerBookings] = useState<any[]>([]);
  const [workerPricing, setWorkerPricing] = useState({ baseCharge: 0, distanceRate: 0, travelFee: 0, freeDistanceLimit: 0 });
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [workerCoords, setWorkerCoords] = useState<{lat: number, lon: number} | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const [isCalculatingMap, setIsCalculatingMap] = useState(false);
  
  // Custom states for Autocomplete Dropdown and Geolocation
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');

  // Search suggestions using Mapbox Places API
  const handleSearchSuggestions = async (val: string) => {
    if (!val || val.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    
    let cleanVal = val.trim()
      .replace(/\bchowlk\b/gi, 'chowk')
      .replace(/\bchouk\b/gi, 'chowk')
      .replace(/\bchook\b/gi, 'chowk')
      .replace(/\bnager\b/gi, 'nagar')
      .replace(/\bcolny\b/gi, 'colony')
      .replace(/\brode\b/gi, 'road')
      .replace(/\brod\b/gi, 'road')
      .replace(/\bbajar\b/gi, 'bazaar')
      .replace(/\bbazar\b/gi, 'bazaar');

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanVal)}.json?access_token=${token}&country=IN&proximity=75.857,30.901&limit=5`);
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        const formatted = data.features.map((f: any) => ({
          display_name: f.place_name,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        }));
        setSuggestions(formatted);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching Mapbox suggestions:', err);
    }
  };

  const calculateStraightLineDistance = (cLat: number, cLon: number) => {
    if (!workerCoords) return;
    const R = 6371; // Radius of the earth in km
    const dLat = (cLat - workerCoords.lat) * Math.PI / 180;
    const dLon = (cLon - workerCoords.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(workerCoords.lat * Math.PI / 180) * Math.cos(cLat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    setDistance(parseFloat(d.toFixed(1)));
    setDuration(Math.round(d * 2)); // Approx 2 mins per km
  };

  const handleSelectSuggestion = async (item: any) => {
    const lat = item.lat;
    const lon = item.lon;
    const name = item.display_name;
    
    setLocation(name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    setIsCalculatingMap(true);
    setError('');
    
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    try {
      if (workerCoords) {
        const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${workerCoords.lon},${workerCoords.lat};${lon},${lat}?access_token=${token}&geometries=geojson&overview=full`);
        const route = await res.json();
        if (route.routes && route.routes.length > 0) {
          setDistance(parseFloat((route.routes[0].distance / 1000).toFixed(1)));
          setDuration(Math.round(route.routes[0].duration / 60));
        } else {
          calculateStraightLineDistance(lat, lon);
        }
        setMapUrl(generateMapHtml(token, workerCoords?.lat, workerCoords?.lon, lat, lon));
      } else {
        setMapUrl(generateMapHtml(token, undefined, undefined, lat, lon));
      }
    } catch (err) {
      console.error('Mapbox Directions failed, falling back:', err);
      calculateStraightLineDistance(lat, lon);
      if (workerCoords) {
        setMapUrl(generateMapHtml(token, workerCoords?.lat, workerCoords?.lon, lat, lon));
      } else {
        setMapUrl(generateMapHtml(token, undefined, undefined, lat, lon));
      }
    } finally {
      setIsCalculatingMap(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLocating(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&limit=1`);
          const data = await res.json();
          const addressName = (data.features && data.features.length > 0) 
            ? data.features[0].place_name 
            : `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          
          setLocation(addressName);
          setSuggestions([]);
          setShowSuggestions(false);
          
          setIsCalculatingMap(true);
          
          if (workerCoords) {
            const routeRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${workerCoords.lon},${workerCoords.lat};${lon},${lat}?access_token=${token}&geometries=geojson&overview=full`);
            const route = await routeRes.json();
            if (route.routes && route.routes.length > 0) {
              setDistance(parseFloat((route.routes[0].distance / 1000).toFixed(1)));
              setDuration(Math.round(route.routes[0].duration / 60));
            } else {
              calculateStraightLineDistance(lat, lon);
            }
            setMapUrl(generateMapHtml(token, workerCoords?.lat, workerCoords?.lon, lat, lon));
          } else {
            setMapUrl(generateMapHtml(token, undefined, undefined, lat, lon));
          }
        } catch (err) {
          console.error('Geolocation reverse geocoding/routing error:', err);
          setLocation(`Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
          calculateStraightLineDistance(lat, lon);
          if (workerCoords) {
            setMapUrl(generateMapHtml(token, workerCoords?.lat, workerCoords?.lon, lat, lon));
          } else {
            setMapUrl(generateMapHtml(token, undefined, undefined, lat, lon));
          }
        } finally {
          setIsLocating(false);
          setIsCalculatingMap(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        setError('Could not detect location. Please type your address manually.');
      },
    );
  };
  // Fetch worker bookings to disable booked slots
  useEffect(() => {
    if (isOpen && workerId) {
      fetch(`${API_URL}/api/bookings/worker/${workerId}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWorkerBookings(data);
          }
        })
        .catch(err => console.error(err));
      
      // Fetch worker pricing
      fetch(`${API_URL}/api/services/${workerId}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (data) {
            setWorkerPricing({
              baseCharge: data.baseCharge || 0,
              distanceRate: data.distanceRate || 0,
              travelFee: data.travelFee || 0,
              freeDistanceLimit: data.freeDistanceLimit || 0
            });
            
            if (data.serviceArea) {
              const geocodeWorker = async () => {
                const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
                try {
                  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(data.serviceArea)}.json?access_token=${token}&limit=1&country=in`);
                  const geo = await res.json();
                  if (geo && Array.isArray(geo.features) && geo.features.length > 0) {
                    const coords = geo.features[0].geometry.coordinates;
                    setWorkerCoords({ lat: coords[1], lon: coords[0] });
                    return;
                  }
                } catch (e) {
                  console.error('Worker geocode Mapbox error:', e);
                }

                // Fallback: Ludhiana center
                setWorkerCoords({ lat: 30.901, lon: 75.857 });
              };

              geocodeWorker();
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, workerId]);

  useEffect(() => {
    console.log('BookingModal mounted for worker:', workerId, 'Current User:', user._id);
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate slots
  const generateSlots = () => {
    if (!availability || !availability.startTime || !availability.endTime) return ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
    const slots = [];
    const [startHour] = availability.startTime.split(':').map(Number);
    const [endHour] = availability.endTime.split(':').map(Number);

    // Simple 1-hour interval generator
    for (let h = startHour; h < endHour; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      const strTime = `${displayH.toString().padStart(2, '0')}:00 ${ampm}`;
      slots.push(strTime);
    }
    return slots.length > 0 ? slots : ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
  };

  const getBookedSlotsForDate = (selectedDate: string) => {
    return workerBookings
      .filter(b => b && b.date && b.date.startsWith(selectedDate) && (b.status === 'Pending' || b.status === 'Accepted'))
      .map(b => b.time);
  };

  const availableSlots = generateSlots();
  const bookedSlots = date ? getBookedSlotsForDate(date) : [];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setTime(''); // reset time
    setError('');

    // Validate Day of Week
    if (availability && availability.days && availability.days.length > 0 && selectedDate) {
      const dayIndex = new Date(selectedDate).getDay();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysOfWeek[dayIndex];

      if (!availability.days.includes(dayName)) {
        setError(`${workerName} is not available on ${dayName}s. Available days: ${availability.days.join(', ')}`);
        setDate('');
      }
    }
  };

  const handleContinue = async () => {
    if (!date || !time) {
      setError('Please select a date and time for your booking.');
      return;
    }
    
    if (!location) {
      setError('Please type your address and click "Calculate Distance & Show Map" button first.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const bookingData = {
        client: user._id,
        worker: workerId,
        serviceName,
        date,
        time,
        location,
        basePrice,
        totalPrice: `₹${(parseInt(basePrice.replace(/\D/g, '')) + (workerPricing.baseCharge || 0) + (workerPricing.travelFee || 0) + (Math.max(0, distance - (workerPricing.freeDistanceLimit || 0)) * (workerPricing.distanceRate || 0)) + 2.50).toFixed(2)}`,
        distance: distance,
        travelFee: (workerPricing.travelFee || 0) + (Math.max(0, distance - (workerPricing.freeDistanceLimit || 0)) * (workerPricing.distanceRate || 0))
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Booking failed');
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-bold text-brand-black dark:text-white">
            {step === 1 ? 'Schedule Service' : step === 2 ? 'Secure Payment' : 'Booking Confirmed!'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-48 overflow-y-auto relative">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-brand-black dark:text-white mb-1">{serviceName}</h3>
                  <p className="text-sm text-gray-500">with {workerName}</p>
                </div>
                <button 
                  onClick={async () => {
                    const currentUser = JSON.parse(localStorage.getItem('serviq_user') || '{}');
                    alert(`API URL: ${API_URL}\nUser: ${currentUser._id || 'Not Logged In'}`);
                    try {
                      const res = await fetch(`${API_URL}/api/payment/create-order`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ amount: 100 })
                      });
                      const data = await res.json();
                      alert('Server Response: ' + JSON.stringify(data));
                    } catch (e: any) {
                      alert('FETCH ERROR: ' + e.message);
                    }
                  }}
                  className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  Test Connection
                </button>
              </div>

              {/* Error Message */}
              {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold">{error}</div>}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              {date && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setTime(slot)}
                          className={`py-2 px-1 text-sm font-bold rounded-lg border transition-all ${isBooked
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-400 dark:text-red-500/50 cursor-not-allowed'
                            : time === slot
                              ? 'bg-brand-electricBlue border-brand-electricBlue text-white shadow-md'
                              : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-gray-800 text-brand-black dark:text-white hover:border-brand-electricBlue/50 hover:bg-brand-electricBlue/5'
                            }`}
                        >
                          {slot}
                          {isBooked && <span className="block text-[10px] font-normal mt-0.5">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Address</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-electricBlue z-10" size={18} />
                    <input
                      type="text"
                      placeholder="E.g. Samrala Chowk, Ludhiana"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        handleSearchSuggestions(e.target.value);
                      }}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white text-sm"
                    />
                    {location && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocation('');
                          setSuggestions([]);
                          setShowSuggestions(false);
                          setMapUrl('');
                          setDistance(0);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X size={16} />
                      </button>
                    )}

                    {/* Autocomplete suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                        {suggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 flex items-start gap-3"
                          >
                            <MapPin className="text-brand-electricBlue mt-1 flex-shrink-0" size={16} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-brand-black dark:text-white truncate">
                                {item.display_name.split(',')[0]}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-400 truncate">
                                {item.display_name.split(',').slice(1).join(',').trim()}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isCalculatingMap || !location}
                    onClick={async () => {
                      setIsCalculatingMap(true);
                      setError('');
                      
                      const searchAddress = async (query: string) => {
                        let cleanQuery = query.trim()
                          .replace(/\bchowlk\b/gi, 'chowk')
                          .replace(/\bchouk\b/gi, 'chowk')
                          .replace(/\bchook\b/gi, 'chowk')
                          .replace(/\bnager\b/gi, 'nagar')
                          .replace(/\bcolny\b/gi, 'colony')
                          .replace(/\brode\b/gi, 'road')
                          .replace(/\brod\b/gi, 'road')
                          .replace(/\bbajar\b/gi, 'bazaar')
                          .replace(/\bbazar\b/gi, 'bazaar');
                        
                        if (!cleanQuery) return null;
                        
                        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
                        try {
                          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${token}&country=IN&proximity=75.857,30.901&limit=1`);
                          const geo = await res.json();
                          if (geo && Array.isArray(geo.features) && geo.features.length > 0) {
                            return { 
                              lat: geo.features[0].geometry.coordinates[1], 
                              lon: geo.features[0].geometry.coordinates[0], 
                              display_name: geo.features[0].place_name 
                            };
                          }
                        } catch (err) {
                          console.error('Manual geocode Mapbox error:', err);
                        }
                        return null;
                      };

                      const result = await searchAddress(location);
                      
                      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
                      if (result) {
                        const cLat = result.lat;
                        const cLon = result.lon;
                        setLocation(result.display_name); // Auto-correct to full address
                        
                        if (workerCoords) {
                          try {
                            const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${workerCoords.lon},${workerCoords.lat};${cLon},${cLat}?access_token=${token}&geometries=geojson&overview=full`);
                            const route = await res.json();
                            if (route.routes && route.routes.length > 0) {
                              setDistance(parseFloat((route.routes[0].distance / 1000).toFixed(1)));
                              setDuration(Math.round(route.routes[0].duration / 60));
                            } else {
                              calculateStraightLineDistance(cLat, cLon);
                            }
                          } catch (err) {
                            console.error('Routing error:', err);
                            calculateStraightLineDistance(cLat, cLon);
                          } finally {
                            setIsCalculatingMap(false);
                          }
                          
                          setMapUrl(generateMapHtml(token, workerCoords?.lat, workerCoords?.lon, cLat, cLon));
                        } else {
                          setMapUrl(generateMapHtml(token, undefined, undefined, cLat, cLon));
                          setIsCalculatingMap(false);
                        }
                      } else {
                        // RESILIENT FALLBACK: Never block user bookings!
                        const fallbackLat = workerCoords ? workerCoords.lat : 30.901;
                        const fallbackLon = workerCoords ? workerCoords.lon : 75.857;
                        setDistance(5.0); // standard 5km distance
                        setDuration(10);
                        setIsCalculatingMap(false);
                        
                        if (workerCoords) {
                          setMapUrl(generateMapHtml(token, workerCoords.lat, workerCoords.lon, fallbackLat, fallbackLon));
                        } else {
                          setMapUrl(generateMapHtml(token, undefined, undefined, fallbackLat, fallbackLon));
                        }
                        
                        setError('Address map pin not found, but we applied a default 5 km distance so you can book now! Click Confirm Booking.');
                      }
                    }}
                    className="bg-brand-electricBlue hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isCalculatingMap ? 'Loading...' : 'Calculate Distance'}
                  </button>
                </div>
                
                {/* Geolocation Button */}
                <div className="flex justify-between items-center mt-2 px-1">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-electricBlue hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Navigation size={12} className={isLocating ? "animate-spin" : ""} />
                    {isLocating ? "Detecting location..." : "Use current location"}
                  </button>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Type address & select from dropdown list
                  </span>
                </div>
              </div>

              {/* Map UI & Distance */}
              {location && mapUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative h-64 bg-gray-100 dark:bg-gray-800 flex flex-col">
                  <iframe 
                    srcDoc={mapUrl} 
                    className="w-full h-full border-0" 
                    title="Booking Route Map" 
                  />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-[#0f172a] px-5 py-3 rounded-full shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-brand-electricBlue/20 flex items-center justify-center text-brand-electricBlue">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Distance</p>
                      <p className="text-sm font-bold text-brand-black dark:text-white">{distance} km (approx. {duration} mins)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h4 className="font-bold text-brand-black dark:text-white mb-4">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Base Service Price</span>
                    <span>{basePrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Worker Base Charge</span>
                    <span>₹{(workerPricing.baseCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Travel Fee</span>
                    <span>₹{(workerPricing.travelFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Distance Charge (Extra {Math.max(0, distance - (workerPricing.freeDistanceLimit || 0)).toFixed(1)} km)</span>
                    <span>₹{(Math.max(0, distance - (workerPricing.freeDistanceLimit || 0)) * (workerPricing.distanceRate || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform Fee</span>
                    <span>₹2.50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-brand-black dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Total Estimate</span>
                    <span>₹{(parseInt(basePrice.replace(/\D/g, '')) + (workerPricing.baseCharge || 0) + (workerPricing.travelFee || 0) + (Math.max(0, distance - (workerPricing.freeDistanceLimit || 0)) * (workerPricing.distanceRate || 0)) + 2.50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-brand-black dark:text-white">Request Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {workerName} has been notified. They will review and accept your request shortly.
              </p>
              <div className="mt-6 p-6 bg-brand-electricBlue/10 border border-brand-electricBlue/20 rounded-2xl w-full text-left">
                <p className="text-sm font-bold text-brand-electricBlue mb-4">How it works now:</p>
                <ul className="text-xs text-gray-500 space-y-4">
                  <li className="flex gap-3">
                    <span className="bg-brand-electricBlue text-white w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Worker accepts and completes the work at your location.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-electricBlue text-white w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>You pay online via Dashboard <b>after</b> work is done.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-electricBlue text-white w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>A verification code will be generated for you to share with the worker.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 dark:bg-[#0f172a]/50">
          {step === 1 ? (
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-black dark:bg-white text-brand-gold dark:text-brand-black font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Confirm Booking'
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-4 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
            >
              View in Dashboard
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

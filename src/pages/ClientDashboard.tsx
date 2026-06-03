import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClipboardList, Heart, MessageSquare, Settings, Bell, MapPin, Search, BadgeCheck, Tag, LogOut, Star, Upload, Trash, Phone, CreditCard, ArrowLeft, ChevronRight,
  Home, User, ChevronLeft, Share2, Clock, Filter, Lock, Navigation
} from 'lucide-react';
import BookingModal from '../components/modals/BookingModal';
import ReviewModal from '../components/modals/ReviewModal';
import { API_URL, getAuthHeaders } from '../config';

const LOCAL_COORDINATES_MAP: { [key: string]: { lat: number; lon: number } } = {
  "lokhandwala, andheri west": { lat: 19.1308, lon: 72.8292 },
  "lokhandwala": { lat: 19.1308, lon: 72.8292 },
  "andheri west": { lat: 19.1363, lon: 72.8276 },
  "andheri": { lat: 19.1176, lon: 72.8480 },
  "bandra": { lat: 19.0596, lon: 72.8295 },
  "juhu": { lat: 19.1048, lon: 72.8267 },
  "mumbai": { lat: 19.0760, lon: 72.8777 },
  "ludhiana": { lat: 30.9010, lon: 75.8570 },
  "delhi": { lat: 28.6139, lon: 77.2090 },
  "bangalore": { lat: 12.9716, lon: 77.5946 },
};

const getCoordinatesForAddress = async (address: string, token: string): Promise<{ lat: number; lon: number }> => {
  const clean = address.trim().toLowerCase();
  for (const [key, value] of Object.entries(LOCAL_COORDINATES_MAP)) {
    if (clean.includes(key)) {
      return value;
    }
  }
  try {
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=IN&limit=1`);
    const geo = await res.json();
    if (geo && Array.isArray(geo.features) && geo.features.length > 0) {
      const coords = geo.features[0].geometry.coordinates;
      return { lat: coords[1], lon: coords[0] };
    }
  } catch (e) {
    console.error('Error geocoding address:', address, e);
  }
  return { lat: 19.1308, lon: 72.8292 };
};

const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

const isFuzzyMatch = (text: string, query: string): boolean => {
  const cleanText = text.toLowerCase().trim();
  const cleanQuery = query.toLowerCase().trim();
  if (cleanText.includes(cleanQuery) || cleanQuery.includes(cleanText)) return true;

  const textWords = cleanText.split(/\s+/);
  const queryWords = cleanQuery.split(/\s+/);

  let matchCount = 0;
  for (const qWord of queryWords) {
    if (qWord.length < 3) {
      if (textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
        matchCount++;
      }
      continue;
    }

    let bestDist = 999;
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        bestDist = 0;
        break;
      }
      const dist = getLevenshteinDistance(qWord, tWord);
      if (dist < bestDist) {
        bestDist = dist;
      }
    }

    const limit = qWord.length <= 5 ? 1 : 2;
    if (bestDist <= limit) {
      matchCount++;
    }
  }

  return matchCount >= queryWords.length / 2;
};

export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');

  useEffect(() => {
    if (!user._id) {
      window.location.href = '/login';
    } else if (user.role === 'worker') {
      window.location.href = '/worker-dashboard';
    } else if (user.role === 'admin') {
      window.location.href = '/admin-dashboard';
    }
  }, [user]);

  // Prevent flash of content for unauthenticated or unauthorized users
  if (!user._id || user.role !== 'client') {
    return null;
  }

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'browse');

  // Sync tab with search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Lokhandwala, Andheri West');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({ lat: 19.1308, lon: 72.8292 });
  const [userLocationName, setUserLocationName] = useState<string>('Lokhandwala, Andheri West');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [workerCoordsCache, setWorkerCoordsCache] = useState<{ [key: string]: { lat: number; lon: number } }>({});

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const getWorkerDistance = (worker: any): number => {
    if (!worker) return 9.9;
    const addr = worker.serviceArea || '';
    const wCoords = workerCoordsCache[addr];
    if (wCoords) {
      return calculateDistanceKm(userCoords.lat, userCoords.lon, wCoords.lat, wCoords.lon);
    }
    // Fallback: search in local map
    const cleanLower = addr.trim().toLowerCase();
    for (const [key, value] of Object.entries(LOCAL_COORDINATES_MAP)) {
      if (cleanLower.includes(key)) {
        return calculateDistanceKm(userCoords.lat, userCoords.lon, value.lat, value.lon);
      }
    }
    return 9.9; // Default placeholder distance if completely unresolved
  };

  const getWorkerPriority = (distance: number): number => {
    if (distance <= 5) return 1;
    if (distance <= 10) return 2;
    return 3;
  };

  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileServiceArea, setProfileServiceArea] = useState(user.serviceArea || '');
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Messages State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Mobile sub-views state variables
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<any>(null);
  const [mobileBookingStep, setMobileBookingStep] = useState(0); // 0 = inactive, 1 = Address, 2 = Date & Time, 3 = Price & Details, 4 = Confirm
  const [bookingDetails, setBookingDetails] = useState<any>({
    workerId: '',
    name: '',
    skill: '',
    price: 0,
    availability: null,
    address: 'Lokhandwala, Andheri West, Mumbai - 400053',
    date: '',
    time: '',
  });
  const [bookingFilter, setBookingFilter] = useState('Upcoming');
  const [showMobileProfileEdit, setShowMobileProfileEdit] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setIsUploadingPhoto(true);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfilePhoto(data.imageUrl);
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user._id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          serviceArea: profileServiceArea,
          profilePhoto: profilePhoto
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('serviq_user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Enforce profile completion for clients (e.g., Google Sign-Up users)
  useEffect(() => {
    if (user._id && user.role === 'client' && (!user.phone || !user.serviceArea)) {
      setActiveTab('settings');
      setShowMobileProfileEdit(true);
    }
  }, [user]);

  const fetchBookings = () => {
    if (user._id) {
      fetch(`${API_URL}/api/bookings/client/${user._id}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBookings(data);
        })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    // Fetch workers for browse
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWorkers(data);
      })
      .catch(err => console.error(err));

    fetchBookings();
    const intervalId = setInterval(fetchBookings, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Geocode all workers once fetched
  useEffect(() => {
    if (workers.length === 0) return;
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    if (!token) return;

    const geocodeAll = async () => {
      let updatedCache = { ...workerCoordsCache };
      let neededGeocoding = false;

      for (const worker of workers) {
        const addr = worker.serviceArea || '';
        if (addr && !updatedCache[addr]) {
          neededGeocoding = true;
          const coords = await getCoordinatesForAddress(addr, token);
          updatedCache[addr] = coords;
        }
      }

      if (neededGeocoding) {
        setWorkerCoordsCache(updatedCache);
      }
    };

    geocodeAll();
  }, [workers]);

  // Request user's GPS coordinates on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserCoords({ lat, lon });
        
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
        if (token) {
          try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&limit=1`);
            const data = await res.json();
            if (data && data.features && data.features.length > 0) {
              const placeName = data.features[0].place_name;
              setUserLocationName(placeName);
              setLocationQuery(placeName);
            } else {
              setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
              setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            }
          } catch (err) {
            console.error('Error reverse geocoding:', err);
            setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        } else {
          setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
        setIsGpsLoading(false);
      },
      (err) => {
        console.error("GPS access denied or error:", err);
        setIsGpsLoading(false);
        // Default to Lokhandwala/Mumbai coordinates
        setUserCoords({ lat: 19.1308, lon: 72.8292 });
        setUserLocationName("Lokhandwala, Andheri West");
        setLocationQuery("Lokhandwala, Andheri West");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Debounced geocoding of manual search input
  useEffect(() => {
    if (!locationQuery || locationQuery === userLocationName) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    if (!token) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const clean = locationQuery.trim();
        let resolved = false;
        const cleanLower = clean.toLowerCase();
        
        for (const [key, value] of Object.entries(LOCAL_COORDINATES_MAP)) {
          if (cleanLower.includes(key)) {
            setUserCoords(value);
            setUserLocationName(clean);
            resolved = true;
            break;
          }
        }

        if (!resolved) {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(clean)}.json?access_token=${token}&country=IN&limit=1`);
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates;
            setUserCoords({ lat: coords[1], lon: coords[0] });
            setUserLocationName(data.features[0].place_name);
          }
        }
      } catch (err) {
        console.error('Error geocoding location query:', err);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [locationQuery]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations/${user._id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${bookingId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingId: selectedChat.bookingId,
          sender: user._id,
          receiver: selectedChat.otherUser._id,
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedChat.bookingId);
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.bookingId);
      const interval = setInterval(() => fetchMessages(selectedChat.bookingId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBookingPayment = async (booking: any) => {
    try {
      const rawPrice = booking.totalPrice ? booking.totalPrice.replace(/[^0-9.]/g, '') : '0';
      const amount = parseFloat(rawPrice);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Invalid amount. Please contact support.');
        return;
      }

      // 1. Create Razorpay Order
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.message || 'Order creation failed');

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SERVIQ Marketplace",
        description: `Payment for ${booking.serviceName}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment and Generate Code
            const verifyRes = await fetch(`${API_URL}/api/payment/verify-booking-payment`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id
              })
            });

            if (verifyRes.ok) {
              alert('Payment successful! Your verification code has been generated.');
              fetchBookings(); // Refresh the list
            } else {
              const err = await verifyRes.json();
              throw new Error(err.message || 'Payment verification failed');
            }
          } catch (err: any) {
            alert('Verification Error: ' + err.message);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: { color: "#3B82F6" }
      };

      const isMockKey = import.meta.env.VITE_RAZORPAY_KEY_ID === 'rzp_test_mock' || !import.meta.env.VITE_RAZORPAY_KEY_ID;
      const rzp = (window as any).Razorpay && !isMockKey ? new (window as any).Razorpay(options) : null;

      if (rzp) {
        rzp.open();
      } else {
        // Fallback for mock environment
        console.log('Using Mock/Bypass Payment Flow...');
        if (confirm(`Payment of ₹${amount} required. (TEST MODE: Click OK to simulate successful payment)`)) {
          const mockVerifyRes = await fetch(`${API_URL}/api/payment/verify-booking-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: `mock_signature`,
              bookingId: booking._id
            })
          });
          if (mockVerifyRes.ok) {
            alert('Payment Successful (Simulated)! Your code has been generated.');
            fetchBookings();
          } else {
            alert('Mock verification failed at server.');
          }
        }
      }
    } catch (err: any) {
      alert('Payment Error: ' + err.message);
    }
  };

  const filteredBookings = bookings.filter((b: any) => {
    if (bookingFilter === 'Upcoming') {
      return ['Accepted', 'On The Way', 'Working', 'Waiting For Code', 'Pending', 'Waiting For Payment'].includes(b.status);
    } else if (bookingFilter === 'Completed') {
      return b.status === 'Completed';
    } else if (bookingFilter === 'Cancelled') {
      return b.status === 'Cancelled' || b.status === 'Declined';
    }
    return true;
  });

  const handleConfirmMobileBooking = async () => {
    try {
      const bookingData = {
        client: user._id,
        worker: bookingDetails.workerId,
        serviceName: bookingDetails.skill,
        date: bookingDetails.date || new Date().toISOString().split('T')[0],
        time: bookingDetails.time || '12:00 PM',
        location: bookingDetails.address,
        basePrice: `₹${bookingDetails.price}`,
        totalPrice: `₹${(bookingDetails.price + 2.50).toFixed(2)}`,
        distance: 0,
        travelFee: 0
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

      alert('Booking Request Sent Successfully!');
      setMobileBookingStep(0);
      setSelectedWorkerForProfile(null);
      fetchBookings();
      setActiveTab('bookings');
    } catch (err: any) {
      alert('Booking Error: ' + err.message);
    }
  };

  const sortedWorkers = [...workers]
    .filter(w => !w.isBlocked && (w.honourScore === undefined || w.honourScore > 70))
    .filter(w => {
      const matchQ = !searchQuery || 
        isFuzzyMatch(w.name, searchQuery) || 
        isFuzzyMatch(w.skill || '', searchQuery) ||
        (w.catalog || []).some((s: any) => isFuzzyMatch(s.title, searchQuery));
      return matchQ;
    })
    .map(w => {
      const dist = getWorkerDistance(w);
      return { ...w, computedDistance: dist };
    })
    .sort((a, b) => {
      const pA = getWorkerPriority(a.computedDistance);
      const pB = getWorkerPriority(b.computedDistance);
      if (pA !== pB) {
        return pA - pB;
      }
      return a.computedDistance - b.computedDistance;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030712] pt-0 md:pt-8 px-0 md:px-6 pb-24 md:pb-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 space-y-2 shrink-0">
            <div className="glass-card p-6 mb-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-3xl text-brand-electricBlue font-bold border-4 border-white dark:border-[#0f172a] shadow-sm overflow-hidden mb-3">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name ? user.name.charAt(0) : 'C'
                )}
              </div>
              <h3 className="font-bold text-lg text-brand-black dark:text-white mb-1">{user.name || 'Client'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center">
                <MapPin size={14} /> {userLocationName || user.serviceArea || 'Local Area'}
              </p>
            </div>

            <nav className="glass-card overflow-hidden">
              {[
                { id: 'browse', label: 'Browse Services', icon: Search },
                { id: 'bookings', label: 'My Bookings', icon: ClipboardList },
                { id: 'favorites', label: 'Saved Workers', icon: Heart },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if ((!user.phone || !user.serviceArea) && item.id !== 'settings') {
                      alert('Please complete your profile details (Phone Number and Service Area) first!');
                      return;
                    }
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                    activeTab === item.id 
                      ? 'bg-brand-electricBlue/10 text-brand-electricBlue border-r-4 border-brand-electricBlue' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  localStorage.removeItem('serviq_user');
                  localStorage.removeItem('serviq_token');
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-100 dark:border-gray-800"
              >
                <LogOut size={20} />
                <span className="font-medium">Log Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-4 md:space-y-8">
            {/* Responsive Header */}
            <header className="bg-white dark:bg-[#030712] md:dark:bg-[#0f172a] p-4 md:p-6 rounded-none md:rounded-3xl border-0 md:border border-gray-100 dark:border-white/5 md:dark:border-gray-800 shadow-none md:shadow-sm">
              {/* Mobile Header */}
              <div className="md:hidden flex justify-between items-center w-full">
                {activeTab === 'browse' ? (
                  searchQuery !== '' ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-extrabold text-white tracking-wide">{searchQuery}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.15)] flex-shrink-0">
                        <span className="text-[10px] font-extrabold text-blue-600 tracking-tighter uppercase">SQ</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-white flex items-center gap-0.5">Serviq</span>
                        <button 
                          onClick={() => setSearchFocused(true)}
                          className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 hover:text-white"
                        >
                          <MapPin size={10} className="text-blue-500 fill-blue-500/20" />
                          <span>{userLocationName}</span>
                          <ChevronRight size={10} className="rotate-90 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('browse')} className="p-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10">
                      <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-base font-bold text-white tracking-wide">
                      {activeTab === 'bookings' && 'My Bookings'}
                      {activeTab === 'favorites' && 'Saved Workers'}
                      {activeTab === 'messages' && 'Messages'}
                      {activeTab === 'settings' && 'Profile / Menu'}
                    </h1>
                  </div>
                )}
                
                {activeTab === 'browse' && searchQuery !== '' ? (
                  <button className="p-1 text-gray-400 hover:text-white bg-transparent">
                    <Filter size={16} />
                  </button>
                ) : (
                  <button className="p-2 relative text-gray-400 hover:text-white transition-colors bg-transparent">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                  </button>
                )}
              </div>

              {/* Desktop Header Content (hidden on mobile) */}
              <div className="hidden md:flex justify-between items-center w-full">
                <h1 className="text-2xl font-bold text-brand-black dark:text-white">
                  {activeTab === 'browse' && 'Explore Services'}
                  {activeTab === 'bookings' && 'My Bookings'}
                  {activeTab === 'favorites' && 'Saved Workers'}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'settings' && 'Account Settings'}
                </h1>
                <button className="p-2 relative text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue transition-colors">
                  <Bell size={24} />
                </button>
              </div>
            </header>

            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 px-4"
              >
                {/* Bookings Status Tabs */}
                <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
                  {['Upcoming', 'Completed', 'Cancelled'].map((statusTab) => {
                    const isSelected = bookingFilter === statusTab;
                    return (
                      <button
                        key={statusTab}
                        onClick={() => setBookingFilter(statusTab)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-blue-650 text-white shadow-md' 
                            : 'bg-[#0b0f19] border border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {statusTab}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {filteredBookings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No {bookingFilter.toLowerCase()} bookings found.</p>
                  )}
                  {filteredBookings.map((booking) => (
                    <div key={booking._id} className="bg-[#0b0f19] border border-white/5 rounded-3xl p-4 flex justify-between items-start shadow-md gap-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-base flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                          {booking.worker?.name ? booking.worker.name.charAt(0) : 'W'}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">{booking.serviceName || 'Service'}</h4>
                          <p className="text-[11px] text-gray-400">with {booking.worker?.name || 'Professional'}</p>
                          <p className="text-[10px] text-gray-500 font-medium">📅 {new Date(booking.date).toLocaleDateString()} • {booking.time || '12:00 PM'}</p>
                          
                          {/* Status Badge Row */}
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            <span className="text-[8px] font-extrabold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{booking.status}</span>
                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${booking.paymentStatus === 'Held in Trust' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>{booking.paymentStatus || 'Unpaid'}</span>
                          </div>

                          {booking.status === 'Waiting For Payment' && (
                            <button 
                              onClick={() => handleBookingPayment(booking)}
                              className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center gap-1.5"
                            >
                              <CreditCard size={12} /> Pay Now
                            </button>
                          )}
                          {['Accepted', 'On The Way', 'Working', 'Waiting For Code'].includes(booking.status) && booking.completionCode && (
                            <div className="mt-2 bg-[#030712] border border-white/5 p-2 rounded-xl">
                              <span className="text-[9px] text-gray-500 block mb-1">Give this code to worker to release payment:</span>
                              <span className="text-xs font-extrabold text-blue-400 tracking-widest">{booking.completionCode}</span>
                            </div>
                          )}
                          {booking.status === 'Completed' && !booking.isReviewed && (
                            <button 
                              onClick={() => setSelectedBookingForReview(booking)}
                              className="mt-2 text-[9px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-500/20"
                            >
                              <Star size={10} className="fill-amber-500" /> Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between h-20 flex-shrink-0">
                        <span className="text-sm font-extrabold text-green-400">{booking.totalPrice || '₹0'}</span>
                        <button className="text-[9px] font-bold text-blue-400 hover:text-white px-2.5 py-1 rounded-lg border border-blue-500/20 bg-blue-500/5">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'browse' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Mobile Welcome Banner (hidden on desktop) */}
                {!searchQuery && (
                  <>
                    <div className="md:hidden px-4 py-4 space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-white leading-tight">
                          Trusted Home <br />
                          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Services</span> at Your <br />
                          <span className="border-b-2 border-blue-500 pb-0.5">Doorstep</span>
                        </h2>
                        <p className="text-xs text-gray-400">Book verified professionals for all your home service needs.</p>
                      </div>

                      {/* Search Container */}
                      <div className="bg-[#0b0f19] border border-white/5 p-4 rounded-2xl space-y-3 shadow-lg">
                        <div className="relative font-sans">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                            type="text" 
                            readOnly
                            onClick={() => setSearchFocused(true)}
                            placeholder="What service do you need?" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030712] border border-white/5 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-white placeholder-gray-500 cursor-pointer"
                          />
                        </div>
                        <button 
                          onClick={() => setSearchFocused(true)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Mobile Popular Services Grid (hidden on desktop) */}
                    <div className="md:hidden px-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Popular Services</h3>
                        <button onClick={() => setShowAllCategories(true)} className="text-[10px] font-bold text-blue-400">View all</button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Electrician', icon: '⚡' },
                          { label: 'Plumber', icon: '💧' },
                          { label: 'AC Repair', icon: '❄️' },
                          { label: 'More', icon: '⚙️' },
                        ].map((item, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              if (item.label === 'More') {
                                setShowAllCategories(true);
                              } else {
                                setSearchQuery(item.label);
                              }
                            }}
                            className="bg-[#0b0f19] border border-white/5 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 h-20"
                          >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[9px] font-bold text-white truncate max-w-full">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Why Choose Serviq (hidden on desktop) */}
                    <div className="md:hidden px-4 space-y-3 pb-8">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Why Choose Serviq?</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { title: 'Verified Professionals', desc: '100% background checked', icon: '🛡️' },
                          { title: 'Fast Booking', desc: 'Book in under 2 minutes', icon: '⚡' },
                          { title: 'Safe & Reliable', desc: 'Insurance covered services', icon: '🔒' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-[#0b0f19] border border-white/5 p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 shadow-sm h-28 justify-center">
                            <span className="text-lg">{item.icon}</span>
                            <h4 className="text-[9px] font-extrabold text-white leading-tight">{item.title}</h4>
                            <p className="text-[7px] text-gray-500 font-medium leading-normal">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Desktop Search Bar (hidden on mobile) */}
                <div className="hidden md:flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-[2]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="What needs repair? (e.g. Electrician)" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white shadow-sm"
                    />
                  </div>
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Location" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Workers List container */}
                <div className="px-4 md:px-0 space-y-3">
                  {searchQuery && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {sortedWorkers.length} Professionals found
                      </span>
                      <button onClick={() => setSearchQuery('')} className="text-[10px] font-bold text-red-400">Clear Search</button>
                    </div>
                  )}

                  {sortedWorkers.map((worker) => (
                    worker.catalog && worker.catalog.length > 0 && worker.catalog.map((item: any, idx: number) => (
                      <div key={`${worker._id}-${idx}`} className="group relative overflow-hidden bg-[#0b0f19] border border-white/5 rounded-3xl p-4 transition-all hover:border-blue-500/20 shadow-md mb-3">
                        {/* Mobile view layout */}
                        <div className="md:hidden flex gap-4">
                          {/* Left Avatar */}
                          <div className="relative flex-shrink-0">
                            {worker.profilePhoto ? (
                              <img src={worker.profilePhoto} alt={worker.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-400">
                                {worker.name ? worker.name.charAt(0) : 'W'}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b0f19]"></span>
                          </div>

                          {/* Center info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5 flex-wrap">
                              {worker.name}
                              <BadgeCheck size={14} className="text-blue-400 fill-blue-400/10" />
                              {worker.computedDistance <= 5 && (
                                <span className="text-[8px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Near You
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={11} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px] font-extrabold text-white">5.0</span>
                              <span className="text-[9px] text-gray-500 font-bold">(120 Reviews)</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-semibold mt-1">
                              {worker.computedDistance} km away • {worker.serviceArea || 'Local Area'}
                            </p>
                            <p className="text-[10px] text-blue-400 font-extrabold mt-1.5 uppercase tracking-wide">
                              {item.title}
                            </p>
                          </div>

                          {/* Right pricing & actions */}
                          <div className="flex flex-col justify-between items-end flex-shrink-0">
                            <span className="text-xs text-gray-400 line-through">₹{Math.round(item.price * 1.2)}</span>
                            <span className="text-sm font-extrabold text-green-400">₹{item.price}</span>
                            <button 
                              onClick={() => setSelectedBooking({ 
                                workerId: worker._id, 
                                name: worker.name, 
                                skill: item.title, 
                                price: `₹${item.price}`,
                                availability: worker.availability
                              })}
                              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 shadow-sm"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>

                        {/* Desktop View Layout */}
                        <div className="hidden md:flex gap-6">
                          <div className="md:w-1/4 flex flex-col items-center text-center border-r border-gray-100 dark:border-gray-800 pr-0 md:pr-6">
                            {worker.profilePhoto ? (
                              <img src={worker.profilePhoto} alt={worker.name} className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/30 mb-3 object-cover" />
                            ) : (
                              <div className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/30 mb-3 bg-brand-electricBlue/10 flex items-center justify-center text-2xl font-bold text-brand-electricBlue">
                                {worker.name ? worker.name.charAt(0) : 'W'}
                              </div>
                            )}
                            <h3 className="font-bold text-brand-black dark:text-white flex items-center justify-center gap-1 flex-wrap">
                              {worker.name} <BadgeCheck size={16} className="text-brand-electricBlue" />
                              {worker.computedDistance <= 5 && (
                                <span className="text-[9px] font-extrabold text-brand-electricBlue bg-brand-electricBlue/10 border border-brand-electricBlue/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Near You
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{worker.skill || 'Professional'}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 justify-center mb-2">
                              <Star size={14} className="text-yellow-450 fill-yellow-450 text-yellow-400" />
                              <span className="text-sm font-extrabold text-brand-black dark:text-white">5.0</span>
                              <span className="text-xs text-gray-500 font-medium">(120 Reviews)</span>
                            </div>

                            {/* Distance and Location */}
                            <p className="text-sm text-brand-electricBlue font-bold mb-1">{worker.computedDistance} km away</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center">
                              <MapPin size={12} /> {worker.serviceArea || 'Local Area'}
                            </p>
                          </div>
                          
                          <div className="md:w-3/4 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Tag size={18} className="text-brand-electricBlue" />
                                  <h2 className="text-xl font-bold text-brand-black dark:text-white">{item.title}</h2>
                                </div>
                                <p className="text-brand-electricBlue font-bold text-lg mb-3">₹{item.price}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedBooking({ 
                                  workerId: worker._id, 
                                  name: worker.name, 
                                  skill: item.title, 
                                  price: `₹${item.price}`,
                                  availability: worker.availability
                                })}
                                className="px-6 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl hover:bg-brand-gold dark:hover:bg-brand-gold transition-colors shadow-lg"
                              >
                                Book Now
                              </button>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {item.description || 'Quality professional Service guaranteed.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ))}
                  
                  {sortedWorkers.length === 0 && (
                    <p className="text-center text-gray-500 py-12">No professional Services available right now.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="glass-card p-12 text-center text-gray-500 dark:text-gray-400">
                  <Heart size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-medium">No saved workers yet.</p>
                  <p className="text-sm mt-2">Tap the heart icon on a pro's profile to save them here for later.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-220px)] md:h-[700px] flex gap-0 md:gap-6 relative">
                
                {/* Inbox List */}
                <div className={`w-full md:w-1/3 glass-card flex flex-col overflow-hidden ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 font-bold text-xl text-brand-black dark:text-white">Inbox</div>
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No messages yet.</div>
                    ) : (
                      conversations.map((chat) => (
                        <div 
                          key={chat.bookingId} 
                          onClick={() => setSelectedChat(chat)}
                          className={`p-5 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedChat?.bookingId === chat.bookingId ? 'bg-brand-electricBlue/5 border-l-4 border-l-brand-electricBlue' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-brand-black dark:text-white">{chat.otherUser.name}</span>
                            <span className="text-[10px] text-gray-400">{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-brand-electricBlue font-semibold mb-1">{chat.serviceName}</p>
                          <p className="text-xs text-gray-500 truncate italic">"{chat.lastMessage}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Chat Window */}
                <div className={`w-full md:w-2/3 glass-card flex flex-col overflow-hidden absolute md:relative inset-0 md:inset-auto z-10 bg-white dark:bg-transparent ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                  {selectedChat ? (
                    <>
                      <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-brand-electricBlue">
                            <ArrowLeft size={20} />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue font-bold shrink-0">
                            {selectedChat.otherUser.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-brand-black dark:text-white">{selectedChat.otherUser.name}</h3>
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Professional</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${selectedChat.otherUser.phone}`} className="p-2 text-gray-400 hover:text-brand-electricBlue transition-colors"><Phone size={18} /></a>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-black/10">
                        {messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                              msg.sender._id === user._id 
                                ? 'bg-brand-electricBlue text-white rounded-tr-none' 
                                : 'bg-white dark:bg-[#1e293b] text-brand-black dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <span className={`text-[9px] mt-2 block ${msg.sender._id === user._id ? 'text-blue-100' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messageEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a]">
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-5 py-3 rounded-xl bg-gray-50 dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white"
                          />
                          <button 
                            type="submit" 
                            disabled={isSendingMessage || !newMessage.trim()}
                            className="p-3 bg-brand-electricBlue text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <MessageSquare size={20} />
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                      <div className="w-20 h-20 bg-brand-electricBlue/5 rounded-full flex items-center justify-center text-brand-electricBlue mb-4">
                        <MessageSquare size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-brand-black dark:text-white">Message Professionals</h3>
                      <p className="text-gray-500 max-w-xs">Select a conversation to discuss your job details with the worker.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 px-4"
              >
                {/* Mobile Profile Card */}
                <div className="md:hidden bg-[#0b0f19] border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-md">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg overflow-hidden border border-white/10 flex-shrink-0">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profileName ? profileName.charAt(0).toUpperCase() : 'C'
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">{profileName || 'Mannat'}</h3>
                    <button onClick={() => setShowMobileProfileEdit(true)} className="text-[10px] font-bold text-blue-500 mt-0.5">View Profile</button>
                  </div>
                </div>

                {/* Mobile Menu List */}
                <div className="md:hidden bg-[#0b0f19] border border-white/5 rounded-3xl overflow-hidden shadow-md divide-y divide-white/5">
                  {[
                    { label: 'My Bookings', onClick: () => {
                      if (!user.phone || !user.serviceArea) {
                        alert('Please complete your profile details (Phone Number and Service Area) first!');
                        return;
                      }
                      setActiveTab('bookings');
                    }},
                    { label: 'Saved Providers', onClick: () => {
                      if (!user.phone || !user.serviceArea) {
                        alert('Please complete your profile details (Phone Number and Service Area) first!');
                        return;
                      }
                      setActiveTab('favorites');
                    }},
                    { label: 'My Addresses', onClick: () => { alert('Addresses feature coming soon!'); } },
                    { label: 'Payment Methods', onClick: () => { alert('Payment methods managed through Checkout.'); } },
                    { label: 'Notifications', onClick: () => { alert('No new notifications.'); } },
                    { label: 'Help & Support', onClick: () => { alert('Support email: support@serviq.com'); } },
                    { label: 'Terms & Conditions', onClick: () => { window.location.href = '/terms'; } },
                    { label: 'Privacy Policy', onClick: () => { window.location.href = '/privacy'; } },
                    { label: 'Settings', onClick: () => setShowMobileProfileEdit(true) }
                  ].map((menuItem, idx) => (
                    <button
                      key={idx}
                      onClick={menuItem.onClick}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-gray-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                    >
                      <span>{menuItem.label}</span>
                      <ChevronRight size={14} className="text-gray-500" />
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="md:hidden pt-2 pb-12">
                  <button
                    onClick={() => {
                      localStorage.removeItem('serviq_user');
                      localStorage.removeItem('serviq_token');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-center py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/15 rounded-3xl transition-all text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.05)] active:scale-95"
                  >
                    Logout
                  </button>
                </div>

                {/* Desktop Account Settings Form (hidden on mobile) */}
                <div className="hidden md:block glass-card p-8">
                  <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">Account Settings</h2>
                  {(!user.phone || !user.serviceArea) && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl font-bold text-sm">
                      ⚠️ Please complete your profile details (Phone Number and Service Area) to access other tabs.
                    </div>
                  )}
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Area (Address / City)</label>
                      <input type="text" value={profileServiceArea} onChange={e => setProfileServiceArea(e.target.value)} placeholder="e.g. 123 Main St, San Francisco, CA" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo (Optional)</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-brand-electricBlue/10 flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#0f172a] shadow-sm">
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-brand-electricBlue">{profileName ? profileName.charAt(0) : 'C'}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="px-4 py-2 bg-brand-electricBlue/10 hover:bg-brand-electricBlue hover:text-white text-brand-electricBlue text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Upload size={16} /> {isUploadingPhoto ? 'Uploading...' : 'Replace'}
                          </button>
                          {profilePhoto && (
                            <button 
                              type="button" 
                              onClick={() => setProfilePhoto('')}
                              className="px-4 py-2 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-500/10 dark:text-red-500 text-red-500 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Trash size={16} /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isSavingProfile} className="px-6 py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex gap-6 text-sm font-semibold">
                    <a href="/terms" className="text-gray-500 hover:text-brand-electricBlue transition-colors">Terms & Conditions</a>
                    <a href="/privacy" className="text-gray-500 hover:text-brand-electricBlue transition-colors">Privacy Policy</a>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {selectedBooking && (
        <BookingModal 
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          workerId={selectedBooking.workerId}
          workerName={selectedBooking.name}
          serviceName={selectedBooking.skill}
          basePrice={selectedBooking.price}
          availability={selectedBooking.availability}
        />
      )}

      {selectedBookingForReview && (
        <ReviewModal 
          isOpen={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          bookingId={selectedBookingForReview._id}
          workerId={selectedBookingForReview.worker._id}
          workerName={selectedBookingForReview.worker.name}
          onSuccess={fetchBookings}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0f19] border-t border-white/5 flex justify-around items-center py-2 px-4 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.4)] pb-safe">
        {[
          { id: 'browse', label: 'Explore', icon: Home },
          { id: 'bookings', label: 'Bookings', icon: ClipboardList },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'settings', label: 'Profile', icon: User },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if ((!user.phone || !user.serviceArea) && item.id !== 'settings') {
                alert('Please complete your profile details (Phone Number and Service Area) first!');
                return;
              }
              setActiveTab(item.id);
              // Reset all mobile view subflows
              setSearchQuery('');
              setSearchFocused(false);
              setShowAllCategories(false);
              setSelectedWorkerForProfile(null);
              setMobileBookingStep(0);
              setSelectedChat(null);
              setShowMobileProfileEdit(false);
            }}
            className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${
              activeTab === item.id 
                ? 'text-blue-400' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'text-gray-500'} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* MOBILE STATE OVERLAYS */}
      {mobileBookingStep > 0 && (
        <div className="fixed inset-0 z-50 bg-[#030712] text-white flex flex-col font-sans">
          <header className="flex justify-between items-center p-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (mobileBookingStep === 1) {
                    setMobileBookingStep(0);
                  } else {
                    setMobileBookingStep(mobileBookingStep - 1);
                  }
                }} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-extrabold tracking-wide">Book Service</span>
            </div>
            <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Step {mobileBookingStep} of 4</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            {mobileBookingStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Address</h4>
                <div className="bg-[#0b0f19] border border-white/5 p-4 rounded-3xl space-y-3 shadow-lg">
                  <label className="text-[10px] text-gray-400 font-bold block">Enter your complete address</label>
                  <textarea 
                    value={bookingDetails.address}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, address: e.target.value })}
                    placeholder="E.g. Lokhandwala, Andheri West, Mumbai - 400053"
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-[#030712] border border-white/5 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-white placeholder-gray-500 leading-relaxed font-semibold resize-none"
                  />
                  <button 
                    onClick={async () => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
                        let addr = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                        if (token) {
                          try {
                            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&limit=1`);
                            const data = await res.json();
                            if (data && data.features && data.features.length > 0) {
                              addr = data.features[0].place_name;
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        setBookingDetails({ ...bookingDetails, address: addr });
                      });
                    }}
                    className="flex items-center gap-1 text-[10px] text-blue-400 font-bold py-1 hover:text-blue-300"
                  >
                    <Navigation size={12} className="fill-blue-500/10" />
                    <span>Use Current Location</span>
                  </button>
                </div>
              </div>
            )}

            {mobileBookingStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Select Date & Time</h4>
                <div className="space-y-4 bg-[#0b0f19] border border-white/5 p-4 rounded-3xl shadow-lg">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-2">Select Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5">
                      {[
                        { day: 'Mon', date: '22 May' },
                        { day: 'Tue', date: '23 May' },
                        { day: 'Wed', date: '24 May' },
                        { day: 'Thu', date: '25 May' },
                      ].map((d, idx) => {
                        const isSelected = bookingDetails.date === `${d.day} ${d.date}`;
                        return (
                          <button 
                            key={idx}
                            type="button"
                            onClick={() => setBookingDetails({ ...bookingDetails, date: `${d.day} ${d.date}` })}
                            className={`flex-shrink-0 w-16 py-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-0.5 ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : 'bg-[#030712] border-white/5 text-gray-300'
                            }`}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider">{d.day}</span>
                            <span className="text-xs font-extrabold">{d.date.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-2">Select Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((t, idx) => {
                        const isSelected = bookingDetails.time === t;
                        return (
                          <button 
                            key={idx}
                            type="button"
                            onClick={() => setBookingDetails({ ...bookingDetails, time: t })}
                            className={`py-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : 'bg-[#030712] border-white/5 text-gray-300'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mobileBookingStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Details</h4>
                <div className="bg-[#0b0f19] border border-white/5 p-5 rounded-3xl space-y-4 shadow-lg">
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Service Price</span>
                      <span className="text-white font-extrabold">₹{bookingDetails.price}.00</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Travel Fee</span>
                      <span className="text-white font-extrabold">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Distance Charge (0.0 km)</span>
                      <span className="text-white font-extrabold">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Platform Fee</span>
                      <span className="text-white font-extrabold">₹2.50</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold pt-3 border-t border-white/5 text-white">
                      <span>Total Estimate</span>
                      <span className="text-blue-400 text-base">₹{(bookingDetails.price + 2.50).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex items-start gap-2.5">
                    <Lock size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] text-blue-300 font-semibold leading-normal">
                      You won't be charged now. Payment is due only after service completion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mobileBookingStep === 4 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm Your Booking</h4>
                <div className="bg-[#0b0f19] border border-white/5 p-5 rounded-3xl space-y-4 shadow-lg divide-y divide-white/5">
                  <div className="pb-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Service</span>
                    <span className="text-xs font-extrabold text-white">{bookingDetails.skill}</span>
                  </div>
                  <div className="py-3 flex justify-between items-start gap-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex-shrink-0">Address</span>
                    <span className="text-xs font-extrabold text-white text-right leading-relaxed">{bookingDetails.address}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date & Time</span>
                    <span className="text-xs font-extrabold text-white">{bookingDetails.date || '20 May'}, {bookingDetails.time || '12:00 PM'}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Provider</span>
                    <span className="text-xs font-extrabold text-white">{bookingDetails.name}</span>
                  </div>
                  <div className="pt-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Amount</span>
                    <span className="text-sm font-extrabold text-green-400">₹{(bookingDetails.price + 2.50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0b0f19] pb-safe z-40">
            <button 
              onClick={async () => {
                if (mobileBookingStep < 4) {
                  if (mobileBookingStep === 2 && (!bookingDetails.date || !bookingDetails.time)) {
                    alert('Please select date and time.');
                    return;
                  }
                  setMobileBookingStep(mobileBookingStep + 1);
                } else {
                  await handleConfirmMobileBooking();
                }
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-extrabold text-xs shadow-md uppercase tracking-wider transition-all"
            >
              {mobileBookingStep === 4 ? 'Confirm Booking' : 'Continue'}
            </button>
            {mobileBookingStep === 4 && (
              <p className="text-[8px] text-center text-gray-500 mt-2 font-bold">
                You can track your booking in 'My Bookings'
              </p>
            )}
          </div>
        </div>
      )}

      {selectedWorkerForProfile !== null && mobileBookingStep === 0 && (
        <div className="fixed inset-0 z-50 bg-[#030712] text-white flex flex-col font-sans">
          <header className="flex justify-between items-center p-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedWorkerForProfile(null)} className="p-1 text-gray-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-extrabold tracking-wide">Provider Profile</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white">
              <Share2 size={18} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-5 flex flex-col items-center text-center shadow-lg relative">
              <span className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-md mb-3 flex-shrink-0">
                {selectedWorkerForProfile.profilePhoto ? (
                  <img src={selectedWorkerForProfile.profilePhoto} alt={selectedWorkerForProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-400">
                    {selectedWorkerForProfile.name ? selectedWorkerForProfile.name.charAt(0) : 'W'}
                  </div>
                )}
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-1">
                {selectedWorkerForProfile.name}
                <BadgeCheck size={16} className="text-blue-400 fill-blue-400/10" />
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-extrabold text-white">5.0</span>
                <span className="text-[10px] text-gray-500 font-bold">(120 Reviews)</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-widest">{selectedWorkerForProfile.skill || 'Electrician'}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { val: '320+', label: 'Jobs Done' },
                { val: '98%', label: 'Success Rate' },
                { val: `${getWorkerDistance(selectedWorkerForProfile)} km`, label: 'Away' }
              ].map((s, idx) => (
                <div key={idx} className="bg-[#0b0f19] border border-white/5 rounded-2xl p-3 text-center shadow-md">
                  <p className="text-sm font-extrabold text-white">{s.val}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</h4>
              <p className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed font-semibold">
                I am a certified {selectedWorkerForProfile.skill?.toLowerCase() || 'electrician'} with 10+ years of experience in residential and commercial electrical work. Fast, reliable, and verified.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Services</h4>
              <div className="space-y-2.5">
                {(selectedWorkerForProfile.catalog || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 flex justify-between items-center shadow-md">
                    <div>
                      <h5 className="font-extrabold text-white text-xs">{item.title}</h5>
                      <p className="text-[10px] text-gray-550 mt-1 leading-normal font-semibold max-w-[200px] line-clamp-2">{item.description || 'Quality professional service guaranteed.'}</p>
                      <span className="text-[11px] font-extrabold text-green-400 mt-2 block">₹{item.price}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setBookingDetails({
                          workerId: selectedWorkerForProfile._id,
                          name: selectedWorkerForProfile.name,
                          skill: item.title,
                          price: item.price,
                          availability: selectedWorkerForProfile.availability,
                          address: 'Lokhandwala, Andheri West, Mumbai - 400053',
                          date: '',
                          time: '',
                        });
                        setMobileBookingStep(1);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 shadow-sm uppercase tracking-wider"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0b0f19] flex gap-3 pb-safe z-40">
            <button 
              onClick={() => {
                setSelectedWorkerForProfile(null);
                setActiveTab('messages');
              }}
              className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white font-bold text-xs shadow-sm uppercase tracking-wider"
            >
              Chat
            </button>
            <button 
              onClick={() => {
                const item = (selectedWorkerForProfile.catalog || [])[0] || { title: selectedWorkerForProfile.skill || 'Service', price: 2400 };
                setBookingDetails({
                  workerId: selectedWorkerForProfile._id,
                  name: selectedWorkerForProfile.name,
                  skill: item.title,
                  price: item.price,
                  availability: selectedWorkerForProfile.availability,
                  address: 'Lokhandwala, Andheri West, Mumbai - 400053',
                  date: '',
                  time: '',
                });
                setMobileBookingStep(1);
              }}
              className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-bold text-xs shadow-md uppercase tracking-wider"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {showAllCategories && mobileBookingStep === 0 && selectedWorkerForProfile === null && (
        <div className="fixed inset-0 z-50 bg-[#030712] text-white flex flex-col font-sans">
          <header className="flex justify-between items-center p-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAllCategories(false)} className="p-1 text-gray-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-extrabold tracking-wide">Categories</span>
            </div>
            <button onClick={() => { setShowAllCategories(false); setSearchFocused(true); }} className="p-2 text-gray-400 hover:text-white">
              <Search size={18} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Electrician', icon: '⚡', color: 'text-amber-500' },
                { label: 'Plumber', icon: '💧', color: 'text-blue-400' },
                { label: 'AC Repair', icon: '❄️', color: 'text-cyan-400' },
                { label: 'Washing Machine', icon: '🧺', color: 'text-indigo-400' },
                { label: 'RO Repair', icon: '🧪', color: 'text-green-400' },
                { label: 'TV Repair', icon: '📺', color: 'text-rose-400' },
                { label: 'Refrigerator Repair', icon: '❄️', color: 'text-blue-500' },
                { label: 'Mobile Repair', icon: '📱', color: 'text-yellow-400' },
                { label: 'Carpenter', icon: '🪚', color: 'text-purple-400' },
                { label: 'Painter', icon: '🎨', color: 'text-pink-400' },
                { label: 'Home Cleaning', icon: '🧹', color: 'text-emerald-400' },
                { label: 'More Services', icon: '⚙️', color: 'text-slate-400' },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.label === 'More Services' ? '' : item.label);
                    setShowAllCategories(false);
                  }}
                  className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-md hover:border-blue-500/20 active:scale-95 transition-all h-28 text-center"
                >
                  <span className={`text-2xl ${item.color}`}>{item.icon}</span>
                  <span className="text-[10px] font-bold text-gray-200 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchFocused && mobileBookingStep === 0 && selectedWorkerForProfile === null && !showAllCategories && (
        <div className="fixed inset-0 z-50 bg-[#030712] text-white flex flex-col font-sans">
          <header className="flex justify-between items-center p-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchFocused(false)} className="p-1 text-gray-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-extrabold tracking-wide">Find Service</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-[#0b0f19] border border-white/5 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need?" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030712] border border-white/5 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-white placeholder-gray-500"
                  autoFocus
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Lokhandwala, Andheri West" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030712] border border-white/5 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-white placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => {
                  setIsGpsLoading(true);
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const lat = position.coords.latitude;
                      const lon = position.coords.longitude;
                      setUserCoords({ lat, lon });
                      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
                      if (token) {
                        try {
                          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&limit=1`);
                          const data = await res.json();
                          if (data && data.features && data.features.length > 0) {
                            const placeName = data.features[0].place_name;
                            setUserLocationName(placeName);
                            setLocationQuery(placeName);
                          } else {
                            setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                            setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                          }
                        } catch (err) {
                          setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                          setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                        }
                      } else {
                        setUserLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                        setLocationQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                      }
                      setIsGpsLoading(false);
                    },
                    (err) => {
                      console.error(err);
                      setIsGpsLoading(false);
                      alert("Unable to retrieve GPS location. Please enter manually.");
                    }
                  );
                }}
                className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold py-1 hover:text-blue-300 transition-colors"
              >
                <Navigation size={12} className="fill-blue-500/10 text-blue-400" />
                <span>{isGpsLoading ? 'Detecting...' : 'Use Live GPS Location'}</span>
              </button>
              <button 
                onClick={() => setSearchFocused(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Search
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-semibold">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Electrician', 'Plumber', 'AC Repair', 'RO Repair', 'Washing Machine', 'Painter'].map((tag, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSearchQuery(tag);
                      setSearchFocused(false);
                    }}
                    className="px-3.5 py-2 bg-[#0b0f19] border border-white/5 text-gray-300 rounded-full text-xs font-semibold hover:border-blue-500/20 active:scale-95 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-semibold">Recent Searches</h3>
              <div className="space-y-2">
                {[
                  { query: 'Electrician', loc: 'Lokhandwala, Andheri West' },
                  { query: 'Plumber', loc: 'Lokhandwala, Andheri West' },
                  { query: 'AC Repair', loc: 'Lokhandwala, Andheri West' },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setSearchFocused(false);
                    }}
                    className="w-full bg-[#0b0f19] border border-white/5 p-3 rounded-xl flex items-center justify-between text-left active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs font-bold text-white">{item.query}</p>
                        <p className="text-[9px] text-gray-500">{item.loc}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobileProfileEdit && (
        <div className="fixed inset-0 z-50 bg-[#030712] text-white flex flex-col font-sans">
          <header className="flex justify-between items-center p-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (!user.phone || !user.serviceArea) {
                    alert('Please complete your profile details (Phone Number and Service Area) first!');
                    return;
                  }
                  setShowMobileProfileEdit(false);
                }} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-extrabold tracking-wide">Edit Profile</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            {(!user.phone || !user.serviceArea) && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl font-bold text-xs">
                ⚠️ Please complete your profile details (Phone Number and Service Area) to access other tabs.
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f19] border border-white/5 outline-none focus:ring-1 focus:ring-blue-500 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profilePhone} 
                    onChange={e => setProfilePhone(e.target.value)} 
                    placeholder="+91 XXXXX XXXXX" 
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f19] border border-white/5 outline-none focus:ring-1 focus:ring-blue-500 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Service Area (Address)</label>
                  <input 
                    type="text" 
                    value={profileServiceArea} 
                    onChange={e => setProfileServiceArea(e.target.value)} 
                    placeholder="e.g. Lokhandwala, Andheri West, Mumbai" 
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f19] border border-white/5 outline-none focus:ring-1 focus:ring-blue-500 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-semibold">Profile Photo</label>
                  <div className="flex items-center gap-4 bg-[#0b0f19] border border-white/5 p-4 rounded-2xl shadow-sm">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center bg-blue-500/10">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-blue-400">{profileName ? profileName.charAt(0) : 'C'}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg transition-all"
                      >
                        {isUploadingPhoto ? 'Uploading...' : 'Replace'}
                      </button>
                      {profilePhoto && (
                        <button 
                          type="button" 
                          onClick={() => setProfilePhoto('')}
                          className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSavingProfile} 
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md uppercase tracking-wider transition-all"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

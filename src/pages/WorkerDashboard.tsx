import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, IndianRupee, Star, Calendar,
  MessageSquare, Bell, CheckCircle, XCircle,
  Plus, Tag, Trash2, User, MapPin, Clock, Edit3, LogOut, Phone, Upload, Trash, AlertTriangle, ShieldOff, Info, ArrowLeft, ChevronRight, Menu, ChevronDown,
  Home, Compass, LayoutDashboard, Settings, Sun, Moon,
  Wallet, Shield, FileText, X, Bot
} from 'lucide-react';



import CompletionModal from '../components/modals/CompletionModal';
import CancellationModal from '../components/modals/CancellationModal';
import IncomingBookingModal from '../components/modals/IncomingBookingModal';
import HonorScoreMeter from '../components/HonorScoreMeter';
import { API_URL, getAuthHeaders } from '../config';
import { useSocket } from '../context/SocketContext';

export default function WorkerDashboard() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('serviq_user') || '{}'));
  const user = currentUser; // Alias for compatibility with existing code

  useEffect(() => {
    if (!currentUser._id) {
      window.location.href = '/login';
    } else if (currentUser.role === 'client') {
      window.location.href = '/client-dashboard';
    } else if (currentUser.role === 'admin') {
      window.location.href = '/admin-dashboard';
    }
  }, [currentUser]);

  const [workerLocation, setWorkerLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWorkerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting worker location:", error)
      );
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const getEarningsStats = () => {
    const completedBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released');
    const total = completedBookings.reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let thisMonthEarnings = 0;
    let lastMonthEarnings = 0;
    
    completedBookings.forEach(b => {
      const bDate = new Date(b.date);
      if (bDate.getFullYear() === currentYear) {
        if (bDate.getMonth() === currentMonth) {
          thisMonthEarnings += (b.workerEarnings || 0);
        } else if (bDate.getMonth() === currentMonth - 1) {
          lastMonthEarnings += (b.workerEarnings || 0);
        }
      } else if (currentMonth === 0 && bDate.getFullYear() === currentYear - 1 && bDate.getMonth() === 11) {
        lastMonthEarnings += (b.workerEarnings || 0);
      }
    });

    return {
      total: total > 0 ? total : 27757.82,
      thisMonth: thisMonthEarnings > 0 ? thisMonthEarnings : 18450.00,
      lastMonth: lastMonthEarnings > 0 ? lastMonthEarnings : 15320.00
    };
  };
  const refreshUserData = async () => {
    if (!currentUser._id) return;
    try {
      const res = await fetch(`${API_URL}/api/services/${currentUser._id}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        localStorage.setItem('serviq_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  // Prevent flash of content for unauthenticated or unauthorized users
  if (!currentUser._id || currentUser.role !== 'worker') {
    return null;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  // Map 'bookings' from nav to 'overview' tab for workers
  const getInitialTab = () => {
    const tab = searchParams.get('tab');
    if (tab === 'bookings') return 'overview';
    if (tab === 'messages') return 'messages';
    if (tab === 'settings') return 'profile';
    return tab || 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  const changeTab = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Sync tab with search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      if (tab === 'bookings') setActiveTab('overview');
      else if (tab === 'messages') setActiveTab('messages');
      else if (tab === 'settings') setActiveTab('profile');
      else setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [, setRerenderTrigger] = useState(0);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      setIsDarkMode(true);
    }
    setRerenderTrigger(prev => prev + 1);
  };

  const triggerAIChat = () => {
    window.dispatchEvent(new Event('open-ai-chat'));
  };

  const [selectedMapJob, setSelectedMapJob] = useState<any | null>(null);
  const [selectedBookingForCompletion, setSelectedBookingForCompletion] = useState<string | null>(null);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<string | null>(null);
  const [incomingBooking, setIncomingBooking] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  // Custom Services State
  const [Services, setServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');

  // Schedule State
  const [availabilityDays, setAvailabilityDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [availabilityStartTime, setAvailabilityStartTime] = useState('09:00');
  const [availabilityEndTime, setAvailabilityEndTime] = useState('17:00');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileServiceArea, setProfileServiceArea] = useState(user.serviceArea || '');
  const [profileBio, setProfileBio] = useState(user.bio || '');
  const [profileExperience, setProfileExperience] = useState(user.experience || '');
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pricing State
  const [baseCharge, setBaseCharge] = useState(user.baseCharge || 0);
  const [distanceRate, setDistanceRate] = useState(user.distanceRate || 0);

  const [showHonorInfo, setShowHonorInfo] = useState(false);
  const [travelFee, setTravelFee] = useState(user.travelFee || 0);
  const [freeDistanceLimit, setFreeDistanceLimit] = useState(user.freeDistanceLimit || 0);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState('');
  const [previewDistance, setPreviewDistance] = useState(10);

  // Messages State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { socket } = useSocket();

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

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user._id}`);
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_booking', (data: any) => {
        console.log('REAL-TIME BOOKING RECEIVED:', data);
        // Add to bookings list
        setBookings(prev => [data.booking, ...prev]);
        // Add to notifications
        setNotifications(prev => [data.notification, ...prev]);
        
        // Show incoming booking modal (which also plays the sound)
        setIncomingBooking(data.booking);
      });

      return () => {
        socket.off('new_booking');
      };
    }
  }, [socket]);

  useEffect(() => {
    fetchNotifications();
  }, []);

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
          bio: profileBio,
          experience: profileExperience,
          profilePhoto: profilePhoto
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('serviq_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsEditingProfile(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchBookings = () => {
    if (currentUser._id) {
      fetch(`${API_URL}/api/bookings/worker/${currentUser._id}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBookings(data);
          }
        })
        .catch(err => console.error(err));

      // Refresh user score and other metrics too
      refreshUserData();
    }
  };

  // Fetch worker's actual catalog, bookings, and profile on load
  useEffect(() => {
    if (currentUser._id) {
      // Fetch Catalog
      fetch(`${API_URL}/api/services/${currentUser._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.catalog) setServices(data.catalog);
          if (data.availability) {
            setAvailabilityDays(data.availability.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
            setAvailabilityStartTime(data.availability.startTime || '09:00');
            setAvailabilityEndTime(data.availability.endTime || '17:00');
          }
          // Set pricing from fetched data
          setBaseCharge(data.baseCharge || 0);
          setDistanceRate(data.distanceRate || 0);
          setTravelFee(data.travelFee || 0);
          setFreeDistanceLimit(data.freeDistanceLimit || 0);
        })
        .catch(err => console.error(err));

      fetchBookings();
      const intervalId = setInterval(fetchBookings, 3000);
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    setScheduleMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/availability/${user._id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ days: availabilityDays, startTime: availabilityStartTime, endTime: availabilityEndTime })
      });
      if (res.ok) {
        setScheduleMessage('Schedule saved successfully!');
        const updatedUser = { ...currentUser, availability: { days: availabilityDays, startTime: availabilityStartTime, endTime: availabilityEndTime } };
        setCurrentUser(updatedUser);
        localStorage.setItem('serviq_user', JSON.stringify(updatedUser));
        setTimeout(() => setScheduleMessage(''), 3000);
      }
    } catch (err) {
      setScheduleMessage('Failed to save schedule.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailabilityDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    setPricingMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/pricing/${user._id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          baseCharge: baseCharge || 0,
          distanceRate: distanceRate || 0,
          travelFee: travelFee || 0,
          freeDistanceLimit: freeDistanceLimit || 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPricingMessage('Pricing updated successfully!');
        setCurrentUser(data.user);
        localStorage.setItem('serviq_user', JSON.stringify(data.user));
        setTimeout(() => setPricingMessage(''), 3000);
      }
    } catch (err) {
      setPricingMessage('Failed to update pricing.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to decline this booking? Repeated cancellations may lead to account suspension.')) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'Declined', cancelledBy: 'worker' })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error declining booking', err);
    }
  };

  // const handleUpdateStatus = async (bookingId: string, status: string) => {
  //   try {
  //     const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
  //       method: 'PATCH',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify({ status })
  //     });
  //     if (res.ok) fetchBookings();
  //   } catch (err) {
  //     console.error('Error updating status', err);
  //   }
  // };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'Accepted' })
      });
      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert('Accept failed: ' + (data.message || 'Server error'));
      }
    } catch (err: any) {
      console.error('Error accepting booking', err);
      alert('Network Error: ' + err.message);
    }
  };


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

  // Removed direct handleCompleteBooking since we now use CompletionModal

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceName && newServicePrice && user._id) {
      try {
        const response = await fetch(`${API_URL}/api/auth/catalog/${user._id}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: newServiceName,
            price: parseFloat(newServicePrice.replace(/[^0-9.-]+/g, "")) || 0, // Simplified price for backend
            description: newServiceDescription
          })
        });

        const data = await response.json();
        if (response.ok) {
          setServices(data.catalog);
          setNewServiceName('');
          setNewServicePrice('');
          setNewServiceDescription('');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeService = async (id: string) => {
    if (user._id) {
      try {
        const response = await fetch(`${API_URL}/api/auth/catalog/${user._id}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (response.ok) {
          setServices(data.catalog);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (user.isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-lg w-full p-12 text-center"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShieldOff size={48} />
          </div>
          <h1 className="text-3xl font-bold text-brand-black dark:text-white mb-4">Account Blocked</h1>
          <p className="text-red-600 font-bold mb-4">
            लगातार बुकिंग कैंसिल करने और Honour Score कम होने के कारण आपकी ID ब्लॉक कर दी गई hai.
          </p>
          <p className="text-gray-500 mb-8">
            Your account has been blocked due to repeated booking cancellations and low Honour Score.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('serviq_user');
              localStorage.removeItem('serviq_token');
              window.location.href = '/';
            }}
            className="w-full py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] pt-8 px-4 md:px-6 pb-24 md:pb-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 space-y-2 shrink-0">
            <div className="glass-card p-6 mb-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/50 object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/50 bg-brand-electricBlue/10 flex items-center justify-center text-3xl font-bold text-brand-electricBlue">
                    {user.name ? user.name.charAt(0) : 'P'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#0f172a]"></div>
              </div>
              <h3 className="font-bold text-lg text-brand-black dark:text-white">{user.name || 'Pro'}</h3>
              <p className="text-sm text-brand-electricBlue font-medium">{user.skill || 'Professional'}</p>
            </div>

            <nav className="glass-card overflow-hidden">
              {[
                { id: 'overview', label: 'Overview', icon: Briefcase },
                { id: 'wallet', label: 'Wallet & Earnings', icon: IndianRupee },
                { id: 'Services', label: 'My Services', icon: Tag },
                { id: 'calendar', label: 'Schedule', icon: Calendar },
                { id: 'pricing', label: 'Charges & Profit', icon: IndianRupee },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'profile', label: 'Settings', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === item.id
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
          <main className="flex-1 space-y-6 md:space-y-8">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-transparent md:bg-white md:dark:bg-[#0f172a] p-0 md:p-6 rounded-none md:rounded-3xl border-0 md:border md:border-gray-100 md:dark:border-gray-800 shadow-none md:shadow-sm gap-4">
              {/* Mobile Header Bar */}
              <div className="md:hidden flex items-center justify-between w-full px-2 py-4 border-b border-white/5 bg-[#0a0a0a]">
                {/* Mobile Left Section: Hamburger Menu, Logo, Location */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-gray-600 dark:text-gray-300 p-1.5 hover:bg-white/5 rounded-full"
                  >
                    <Menu size={22} />
                  </button>
                  <Link to="/" className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden shrink-0">
                      <img src="/logo.jpg" alt="Serviq Logo" className="w-[85%] h-[85%] object-contain" />
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 border border-white/5 px-2 py-1 rounded-full">
                    <MapPin size={10} className="text-blue-500" />
                    <span className="font-semibold text-gray-300 truncate max-w-[80px]">{user?.serviceArea?.split(',')[0] || 'Ludhiana'}</span>
                    <ChevronDown size={10} className="text-gray-500" />
                  </div>
                </div>

                {/* Mobile Actions (Right Section) */}
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 relative"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#0a0a0a] rounded-full"></span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button 
                    onClick={() => changeTab('profile')}
                    className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 overflow-hidden shrink-0 ml-1"
                  >
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xs uppercase">{user.name?.charAt(0) || 'P'}</span>
                    )}
                  </button>

                  {showNotificationPanel && (
                    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-brand-black dark:text-white">Notifications</h3>
                        <button
                          onClick={async () => {
                            await fetch(`${API_URL}/api/notifications/read-all/${user._id}`, { method: 'PATCH' });
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                          }}
                          className="text-xs text-brand-electricBlue font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm italic">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markNotificationRead(n._id);
                                if (n.type === 'service_request') {
                                  changeTab('Services');
                                  setNewServiceName(n.relatedId);
                                }
                                setShowNotificationPanel(false);
                              }}
                              className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-brand-electricBlue/5' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-brand-black dark:text-white mb-1">{n.messageEn}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{n.messageHi}</p>
                                </div>
                                {n.type === 'service_request' && (
                                  <button className="shrink-0 p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all">
                                    <Plus size={14} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Header Content (hidden on mobile) */}
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-brand-black dark:text-white">Welcome back, {user.name?.split(' ')[0] || 'Pro'}!</h1>
                <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your business today.</p>

                {user.honourScore <= 75 && !user.isBlocked && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-pulse">
                    <AlertTriangle className="text-red-500 shrink-0" size={24} />
                    <div>
                      <p className="text-red-600 font-bold text-sm">चेतावनी: आपका Honour Score 75 तक पहुँच गया है। लगातार बुकिंग कैंसिल करने से आपकी ID ब्लॉक हो सकती है। कृपया आगे कैंसिलेशन कम करें।</p>
                      <p className="text-red-500 text-xs font-medium mt-1">Warning: Your Honour Score has reached 75. Repeated booking cancellations may lead to account blocking. Please avoid further cancellations.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:flex items-center gap-4 relative">
                <button onClick={toggleDarkMode} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue transition-all">
                  {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
                </button>
                
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 relative text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue transition-all"
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
                  )}
                </button>

                {showNotificationPanel && (
                  <div className="absolute right-0 mt-12 w-80 bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-bold text-brand-black dark:text-white">Notifications</h3>
                      <button
                        onClick={async () => {
                          await fetch(`${API_URL}/api/notifications/read-all/${user._id}`, { method: 'PATCH' });
                          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        }}
                        className="text-xs text-brand-electricBlue font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm italic">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markNotificationRead(n._id);
                              if (n.type === 'service_request') {
                                changeTab('Services');
                                setNewServiceName(n.relatedId);
                              }
                              setShowNotificationPanel(false);
                            }}
                            className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-brand-electricBlue/5' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-brand-black dark:text-white mb-1">{n.messageEn}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{n.messageHi}</p>
                              </div>
                              {n.type === 'service_request' && (
                                <button className="shrink-0 p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all">
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                {/* Mobile Greeting Card */}
                <div className="md:hidden bg-gradient-to-r from-[#0d1627] to-[#050811] border border-blue-500/15 p-5 rounded-3xl flex justify-between items-center shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">Welcome back, {user.name?.split(' ')[0] || 'tushar'}! 👋</h2>
                    <p className="text-xs text-gray-400 mt-1">Here's what's happening with your business today.</p>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <svg className="w-16 h-16 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Shield in background */}
                      <path d="M70 40 L70 55 C70 70, 50 85, 50 85 C50 85, 30 70, 30 55 L30 40 L50 30 Z" fill="#1E40AF" stroke="#3B82F6" strokeWidth="2" />
                      <path d="M43 55 L48 60 L57 48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Head */}
                      <circle cx="50" cy="30" r="16" fill="#FDBA74" />
                      {/* Cap */}
                      <path d="M34 26 C34 16, 66 16, 66 26 Z" fill="#2563EB" />
                      <path d="M45 16 L72 20" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                      {/* Body */}
                      <path d="M30 65 C30 50, 70 50, 70 65 L70 85 L30 85 Z" fill="#1D4ED8" />
                      {/* Collar */}
                      <path d="M42 50 L50 60 L58 50" fill="#FDBA74" />
                    </svg>
                  </div>
                </div>

                {/* Reputation & Trust Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                    <div className="flex-shrink-0">
                      <HonorScoreMeter score={user.honourScore || 90} size={150} strokeWidth={11} hideLevel={true} />
                    </div>
                    <div className="flex-grow space-y-3 text-center md:text-left w-full">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                          Reputation & Trust
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase font-bold tracking-wider">AI Protected</span>
                          <button 
                            onClick={() => setShowHonorInfo(!showHonorInfo)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-blue-400"
                          >
                            <Info size={16} />
                          </button>
                        </h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-1.5 leading-relaxed">Your Honor Score is monitored by our AI system to ensure quality.</p>
                      </div>

                      <div className="flex justify-center md:justify-start">
                        <div className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/25 text-green-400 text-xs px-3.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          <span>Trusted Worker</span>
                          <span className="text-[10px]">✓</span>
                        </div>
                      </div>
                      
                      {showHonorInfo && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[11px] space-y-2 text-left"
                        >
                          <div>
                            <p className="font-bold text-blue-400 mb-1">How it works (English):</p>
                            <p className="text-gray-400 leading-relaxed">
                              Your Honor Score (0-100) reflects your professionalism. 
                              <span className="font-bold"> +1 point</span> for 5-star ratings and completing job streaks. 
                              <span className="font-bold text-red-500"> -10 points</span> for 1-star ratings or unexcused cancellations. 
                              If your score falls below <span className="font-bold text-red-500">70</span>, your account will be suspended.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-blue-500/10">
                            <p className="font-bold text-blue-400 mb-1">यह कैसे काम करता है (Hindi):</p>
                            <p className="text-gray-400 leading-relaxed">
                              का हॉनर स्कोर (0-100) आपकी व्यावसायिकता को दर्शाता है। 
                              <span className="font-bold"> +1 अंक</span> 5-स्टार रेटिंग और जॉब स्ट्रीक पूरा करने के लिए। 
                              <span className="font-bold text-red-500"> -10 अंक</span> 1-स्टार रेटिंग या बिना कारण रद्दीकरण के लिए। 
                              यदि आपका स्कोर <span className="font-bold text-red-500">70</span> से नीचे गिरता है, तो खाता सस्पेंड हो जाएगा।
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Trust Badge Card */}
                  <div className="glass-card p-6 flex items-center justify-between gap-4 bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <h3 className="font-bold text-white text-base">Trust Badge</h3>
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-[#0A0F1D]" />
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          You are currently a Trusted Worker. Maintain a score above 90 for extra visibility.
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 relative w-12 h-12 flex items-center justify-center bg-blue-500/15 rounded-full border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {/* Stat Card 1: Total Earnings */}
                  <div className="glass-card p-4 flex flex-col justify-between bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <IndianRupee size={15} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">Total Earnings</div>
                      <div className="text-sm md:text-2xl font-extrabold text-white">
                        ₹{bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released').reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '27,757.82'}
                      </div>
                      <div className="text-[9px] text-green-500 font-bold mt-1.5 flex items-center gap-1">
                        <span>▲</span> 23.5% vs last month
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 2: Pending Requests */}
                  <div className="glass-card p-4 flex flex-col justify-between bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Clock size={15} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">Pending Requests</div>
                      <div className="text-sm md:text-2xl font-extrabold text-white">
                        {bookings.filter(b => b.status === 'Pending').length.toString()}
                      </div>
                      <div className="text-[9px] text-gray-600 font-bold mt-1.5 flex items-center gap-1">
                        Active requests
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 3: Trust Level */}
                  <div className="glass-card p-4 flex flex-col justify-between bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <Star size={15} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">Trust Level</div>
                      <div className="text-sm md:text-2xl font-extrabold text-yellow-500">
                        {user.honourScore >= 90 ? 'Master' : user.honourScore >= 80 ? 'Expert' : 'Worker'}
                      </div>
                      <div className="text-[9px] text-yellow-500/70 font-bold mt-1.5">
                        Top 10%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="glass-card p-5 md:p-6 bg-[#0a0f1d]/60 backdrop-blur-md border border-blue-500/15">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-white">Upcoming Jobs</h2>
                      <p className="text-[11px] text-blue-400 font-semibold italic mt-1">
                        <span className="font-extrabold uppercase">Rule:</span> कैलेंडर पैनल केवल बुकिंग स्वीकार करने के बाद लागू होगी।
                      </p>
                    </div>
                    <button className="text-blue-400 hover:text-yellow-500 font-bold text-xs md:text-sm transition-colors whitespace-nowrap text-left flex items-center gap-0.5">
                      <span>View Calendar</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#030712]/40 hover:bg-white/5 transition-all gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 font-extrabold text-base">
                            T
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">Tushar Bhatt</h4>
                              <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold uppercase tracking-wider">New</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">Electrician • 01/06/2026 • 09:00 AM</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                            Payment Released
                          </span>
                          <span className="text-sm font-bold text-green-400">₹1,250</span>
                        </div>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#030712]/40 hover:bg-white/5 transition-all gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 font-extrabold text-base">
                              {booking.client?.name ? booking.client.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{booking.client?.name || 'Tushar Bhatt'}</h4>
                                {booking.status === 'Pending' && (
                                  <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold uppercase tracking-wider">New</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1">{booking.serviceName || 'Electrician'} • {new Date(booking.date).toLocaleDateString()} • {booking.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            {booking.status === 'Pending' ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleAcceptBooking(booking._id)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all">
                                  Accept
                                </button>
                                <button onClick={() => handleDeclineBooking(booking._id)} className="px-2 py-1 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 rounded-lg text-[10px] font-bold transition-all">
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                                {booking.status === 'Payment Released' ? 'Payment Released' : booking.status}
                              </span>
                            )}
                            <span className="text-sm font-bold text-green-400">₹{booking.price || '1,250'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Fixed Bottom-Right Floating AI Agent Button */}
            <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col items-center">
              <button
                onClick={triggerAIChat}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-[#1E293B] to-[#0A0F1D] border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-95 transition-all duration-300"
              >
                <Bot className="w-7 h-7 text-blue-400 animate-pulse" />
              </button>
              <span className="text-[9px] font-bold text-blue-400/80 mt-1 tracking-widest uppercase">AI Agent</span>
            </div>

            {activeTab === 'Services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Service Requests from Clients */}
                {notifications.filter(n => n.type === 'service_request' && !n.isRead).length > 0 && (
                  <div className="p-6 bg-brand-gold/10 border border-brand-gold/30 rounded-3xl">
                    <h2 className="text-xl font-bold text-brand-black dark:text-white mb-4 flex items-center gap-2">
                      <Bell size={20} className="text-brand-gold" />
                      New Service Requests
                    </h2>
                    <div className="space-y-3">
                      {notifications.filter(n => n.type === 'service_request' && !n.isRead).map(req => (
                        <div key={req._id} className="flex justify-between items-center p-4 bg-white dark:bg-black/20 rounded-2xl border border-brand-gold/10">
                          <div>
                            <p className="font-bold text-brand-black dark:text-white">{req.relatedId}</p>
                            <p className="text-xs text-gray-500">Requested by client</p>
                          </div>
                          <button 
                            onClick={() => {
                              setNewServiceName(req.relatedId);
                              markNotificationRead(req._id);
                            }}
                            className="px-4 py-2 bg-brand-gold text-brand-black font-bold rounded-lg text-xs hover:scale-105 transition-all"
                          >
                            Add This Service
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Add New Service Form */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">Add Custom Service</h2>
                  <form onSubmit={handleAddService} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="e.g. AC Gas Refill"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price</label>
                        <input
                          type="text"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          placeholder="e.g. ₹450/hr or ₹1500 fixed"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Description</label>
                        <textarea
                          value={newServiceDescription}
                          onChange={(e) => setNewServiceDescription(e.target.value)}
                          placeholder="Describe what is included in this Service..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white resize-none"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="submit" className="w-full md:w-auto px-8 py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Plus size={20} /> Add Service to Catalog
                      </button>
                    </div>
                  </form>
                </div>

                {/* Active Services List */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">Your Active Services</h2>
                  <div className="space-y-4">
                    {Services.length === 0 && (
                      <p className="text-gray-500">No Services added yet.</p>
                    )}
                    {Services.map((Service) => (
                      <div key={Service._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue flex-shrink-0 mt-1">
                            <Tag size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-lg text-brand-black dark:text-white">{Service.title}</h4>
                              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-bold rounded-lg border border-green-500/20">${Service.price}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 max-w-xl">{Service.description}</p>
                          </div>
                        </div>
                        <button onClick={() => removeService(Service._id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors md:ml-auto">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => changeTab('menu')}
                  className="md:hidden flex items-center gap-2 text-brand-electricBlue font-bold text-sm mb-4"
                >
                  <ArrowLeft size={16} /> Back to Menu
                </button>
                <div className="glass-card p-8">
                  <div className="flex justify-between items-start mb-8">
                    <h2 className="text-2xl font-bold text-brand-black dark:text-white">Profile Details</h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-brand-electricBlue hover:text-white transition-colors font-medium"
                      >
                        <Edit3 size={18} /> Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                          <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Area</label>
                          <input type="text" value={profileServiceArea} onChange={e => setProfileServiceArea(e.target.value)} placeholder="e.g. San Francisco, CA" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (Years)</label>
                          <input type="number" value={profileExperience} onChange={e => setProfileExperience(e.target.value)} placeholder="8" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo (Optional)</label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-brand-electricBlue/10 flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#0f172a] shadow-sm">
                            {profilePhoto ? (
                              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-brand-electricBlue">{profileName ? profileName.charAt(0) : 'W'}</span>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me / Bio</label>
                        <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="Tell clients about your expertise..." rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-brand-electricBlue text-brand-black dark:text-white resize-none"></textarea>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={isSavingProfile} className="px-6 py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                          {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-4xl text-brand-electricBlue font-bold border-4 border-white dark:border-[#0f172a] shadow-md overflow-hidden shrink-0">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user.name ? user.name.charAt(0) : 'W'
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-brand-black dark:text-white">{user.name || 'Not provided'}</h3>
                          <p className="text-brand-electricBlue font-medium">{user.skill || 'Professional'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h4>
                            <p className="text-lg font-semibold text-brand-black dark:text-white">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                              <MapPin size={16} /> Service Area
                            </h4>
                            <p className="text-lg font-semibold text-brand-black dark:text-white">{user.serviceArea || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                              <Clock size={16} /> Working Hours
                            </h4>
                            <p className="text-lg font-semibold text-brand-black dark:text-white">See Schedule Tab</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                              <Star size={16} /> Experience
                            </h4>
                            <p className="text-lg font-semibold text-brand-black dark:text-white">{user.experience ? `${user.experience} Years` : 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">About Me / Bio</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {user.bio || 'No bio provided yet. Edit your profile to add one!'}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Documents & Certifications</h4>
                    <div className="flex gap-4">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-sm font-medium text-brand-black dark:text-white">State Electrician License.pdf</span>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-sm font-medium text-brand-black dark:text-white">Background_Check_Clear.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {activeTab === 'wallet' && (() => {
              const stats = getEarningsStats();
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <button
                    type="button"
                    onClick={() => changeTab('menu')}
                    className="md:hidden flex items-center gap-2 text-brand-electricBlue font-bold text-sm mb-4"
                  >
                    <ArrowLeft size={16} /> Back to Menu
                  </button>

                  {/* Total Earnings Card */}
                  <div className="glass-card p-6 bg-gradient-to-br from-brand-electricBlue/10 to-transparent border-brand-electricBlue/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Total Earnings</h3>
                        <p className="text-4xl font-extrabold text-brand-black dark:text-white">₹{stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-brand-electricBlue/20 text-brand-electricBlue rounded-2xl flex items-center justify-center">
                        <Briefcase size={24} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">This Month</div>
                  </div>

                  {/* This Month / Last Month Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-5 bg-white dark:bg-[#0f172a]">
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase mb-1">This Month</h4>
                      <p className="text-xl font-extrabold text-brand-black dark:text-white">₹{stats.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="glass-card p-5 bg-white dark:bg-[#0f172a]">
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase mb-1">Last Month</h4>
                      <p className="text-xl font-extrabold text-brand-black dark:text-white">₹{stats.lastMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* List Options */}
                  <div className="glass-card overflow-hidden divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#0f172a]">
                    {[
                      { label: 'Payout History', icon: Calendar },
                      { label: 'Transaction History', icon: Clock },
                      { label: 'Payout Settings', icon: Settings }
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <opt.icon size={18} className="text-gray-400 dark:text-gray-500" />
                          <span className="font-semibold text-sm">{opt.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    ))}
                  </div>

                  {/* Standard Balance withdraw block */}
                  <div className="glass-card p-6 bg-white dark:bg-[#0f172a]">
                    <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Available Balance</h3>
                    <p className="text-3xl font-extrabold text-brand-black dark:text-white">₹{user.walletBalance?.toFixed(2) || '0.00'}</p>
                    <button className="mt-4 w-full py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg">
                      Withdraw Funds
                    </button>
                  </div>
                </motion.div>
              );
            })()}

            {activeTab === 'calendar' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <button
                  type="button"
                  onClick={() => changeTab('menu')}
                  className="md:hidden flex items-center gap-2 text-brand-electricBlue font-bold text-sm mb-4"
                >
                  <ArrowLeft size={16} /> Back to Menu
                </button>
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">My Schedule</h2>
                  <p className="text-gray-500 mb-8">Set your available days and working hours. Clients can only book you during these slots.</p>

                  {scheduleMessage && (
                    <div className={`p-4 mb-6 rounded-xl font-medium ${scheduleMessage.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {scheduleMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveSchedule} className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Available Days</label>
                      <div className="flex flex-wrap gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${availabilityDays.includes(day)
                              ? 'bg-brand-electricBlue text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={availabilityStartTime}
                          onChange={(e) => setAvailabilityStartTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                        <input
                          type="time"
                          value={availabilityEndTime}
                          onChange={(e) => setAvailabilityEndTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSavingSchedule || availabilityDays.length === 0}
                        className="px-8 py-3 bg-brand-gold text-brand-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50"
                      >
                        {isSavingSchedule ? 'Saving...' : 'Save Schedule'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <button
                  type="button"
                  onClick={() => changeTab('menu')}
                  className="md:hidden flex items-center gap-2 text-brand-electricBlue font-bold text-sm mb-4"
                >
                  <ArrowLeft size={16} /> Back to Menu
                </button>
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Service Charges & Pricing</h2>
                  <p className="text-gray-500 mb-8">Control your earnings by setting your own base charges and travel fees. These will be automatically added to the total booking cost.</p>

                  {pricingMessage && (
                    <div className={`p-4 mb-6 rounded-xl font-medium ${pricingMessage.includes('successfully') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {pricingMessage}
                    </div>
                  )}

                  <form onSubmit={handleSavePricing} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Service Charge (₹)</label>
                        <input
                          type="number"
                          value={Number.isNaN(baseCharge) ? '' : baseCharge}
                          onChange={(e) => setBaseCharge(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 50"
                        />
                        <p className="text-xs text-gray-400 mt-2">Minimum charge for any booking.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Travel Fee (₹)</label>
                        <input
                          type="number"
                          value={Number.isNaN(travelFee) ? '' : travelFee}
                          onChange={(e) => setTravelFee(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 10"
                        />
                        <p className="text-xs text-gray-400 mt-2">Fixed fee to cover basic travel costs.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free Distance Limit (km)</label>
                        <input
                          type="number"
                          value={Number.isNaN(freeDistanceLimit) ? '' : freeDistanceLimit}
                          onChange={(e) => setFreeDistanceLimit(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 5"
                        />
                        <p className="text-xs text-gray-400 mt-2">Extra charge only applies after this distance.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance Charge (₹ per km)</label>
                        <input
                          type="number"
                          value={Number.isNaN(distanceRate) ? '' : distanceRate}
                          onChange={(e) => setDistanceRate(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 2"
                        />
                        <p className="text-xs text-gray-400 mt-2">Charged only for extra distance.</p>
                      </div>
                    </div>

                    <div className="bg-brand-electricBlue/5 p-6 rounded-2xl border border-brand-electricBlue/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="font-bold text-brand-black dark:text-white flex items-center gap-2">
                          <IndianRupee size={18} className="text-brand-electricBlue" /> Pricing Preview
                        </h4>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Test Distance (km):</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={previewDistance}
                            onChange={(e) => setPreviewDistance(parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-850 text-brand-black dark:text-white outline-none focus:ring-1 focus:ring-brand-electricBlue font-bold"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        If a client books you from <span className="font-extrabold text-brand-electricBlue">{previewDistance} km</span> away: <br />
                        <span className="font-bold text-brand-black dark:text-white mt-1 block">
                          ₹{baseCharge || 0} (Base) + ₹{travelFee || 0} (Travel) + ₹{Math.max(0, previewDistance - (freeDistanceLimit || 0)) * (distanceRate || 0)} (Extra Distance: {Math.max(0, previewDistance - (freeDistanceLimit || 0)).toFixed(1)}km) = ₹{((baseCharge || 0) + (travelFee || 0) + (Math.max(0, previewDistance - (freeDistanceLimit || 0)) * (distanceRate || 0))).toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSavingPricing}
                        className="px-8 py-3 bg-brand-electricBlue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
                      >
                        {isSavingPricing ? 'Saving...' : 'Save Pricing Controls'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-220px)] md:h-[700px] flex gap-0 md:gap-6 relative">
                
                {/* Inbox List */}
                <div className={`w-full md:w-1/3 glass-card flex flex-col overflow-hidden ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 font-bold text-xl text-brand-black dark:text-white">Conversations</div>
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
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${selectedChat.otherUser.phone}`} className="p-2 text-gray-400 hover:text-brand-electricBlue transition-colors"><Phone size={18} /></a>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-black/10">
                        {messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender._id === user._id
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
                      <h3 className="text-xl font-bold text-brand-black dark:text-white">Your Workspace Chat</h3>
                      <p className="text-gray-500 max-w-xs">Select a conversation from the left to start chatting with your clients.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'menu' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:hidden"
              >
                {/* Profile Card */}
                <div className="glass-card p-6 flex items-center gap-4 bg-gradient-to-br from-white to-gray-50 dark:from-[#0f172a] dark:to-[#060a14]">
                  <div className="w-16 h-16 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-2xl text-brand-electricBlue font-bold overflow-hidden border-2 border-white dark:border-[#0f172a] shadow-sm shrink-0">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0) : 'W'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-black dark:text-white">{user.name || 'Pro Partner'}</h3>
                    <p className="text-sm text-brand-electricBlue font-medium">{user.skill || 'Professional'}</p>
                  </div>
                </div>

                {/* Menu Options List */}
                <div className="glass-card overflow-hidden divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#0f172a]">
                  {[
                    { id: 'overview', label: 'Overview', icon: Briefcase },
                    { id: 'wallet', label: 'Wallet & Earnings', icon: IndianRupee },
                    { id: 'Services', label: 'My Services', icon: Tag },
                    { id: 'calendar', label: 'Schedule', icon: Calendar },
                    { id: 'pricing', label: 'Charges & Profit', icon: IndianRupee },
                    { id: 'messages', label: 'Messages', icon: MessageSquare },
                    { id: 'profile', label: 'Profile Details', icon: User },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => changeTab(item.id)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <item.icon size={20} className="text-gray-400 dark:text-gray-500" />
                        <span className="font-semibold text-base">{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      localStorage.removeItem('serviq_user');
                      localStorage.removeItem('serviq_token');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={20} />
                    <span className="font-bold text-base">Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Map Modal */}
      {selectedMapJob && (
        <div className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a]">
              <div>
                <h2 className="text-xl font-bold text-brand-black dark:text-white">Location: {selectedMapJob.client?.name || 'Client'}</h2>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={14} className="text-red-500" /> Client: {selectedMapJob.location}</p>
                  {workerLocation && selectedMapJob.lat && selectedMapJob.lng && (
                    <p className="text-xs text-brand-electricBlue font-bold flex items-center gap-1">
                      <MapPin size={14} /> You are {calculateDistance(workerLocation.lat, workerLocation.lng, selectedMapJob.lat, selectedMapJob.lng)}km away
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedMapJob(null)} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
                <XCircle size={28} />
              </button>
            </div>
            <div className="h-[450px] w-full bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center p-6 text-center">
              <div>
                <MapPin size={48} className="text-brand-electricBlue mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2">Location Details</h3>
                <p className="text-gray-500 mb-4">{selectedMapJob.location}</p>
                {workerLocation && selectedMapJob.lat && selectedMapJob.lng && (
                  <div className="p-4 bg-brand-electricBlue/10 rounded-2xl">
                    <p className="text-brand-electricBlue font-bold text-lg">
                      Distance: {calculateDistance(workerLocation.lat, workerLocation.lng, selectedMapJob.lat, selectedMapJob.lng)} km
                    </p>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&origin=${workerLocation.lat},${workerLocation.lng}&destination=${selectedMapJob.lat},${selectedMapJob.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-6 py-2 bg-brand-electricBlue hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
                    >
                      Open in Maps App
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedBookingForCompletion && (
        <CompletionModal
          isOpen={!!selectedBookingForCompletion}
          onClose={() => setSelectedBookingForCompletion(null)}
          bookingId={selectedBookingForCompletion}
          onSuccess={fetchBookings}
        />
      )}

      {selectedBookingForCancellation && (
        <CancellationModal
          isOpen={!!selectedBookingForCancellation}
          onClose={() => setSelectedBookingForCancellation(null)}
          bookingId={selectedBookingForCancellation}
          onSuccess={fetchBookings}
        />
      )}

      {incomingBooking && (
        <IncomingBookingModal
          booking={incomingBooking}
          onClose={() => setIncomingBooking(null)}
          onSuccess={fetchBookings}
        />
      )}

      {/* Mobile Drawer (Sidebar) Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-50"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#070b13]/90 backdrop-blur-xl text-white z-[60] flex flex-col p-6 border-r border-blue-500/10 shadow-[5px_0_25px_rgba(0,0,0,0.5)] overflow-y-auto"
            >
              {/* Glowing decorative gradient blur */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl pointer-events-none z-0" />
              {/* Glowing Wave graphic */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500">
                  <path d="M0 0 C 30 20, 40 40, 100 20 L 100 0 Z" fill="currentColor" />
                  <path d="M0 0 C 50 30, 20 70, 100 80 L 100 0 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
              </div>

              {/* Drawer Header */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#0A0F1D] flex items-center justify-center font-bold text-xl text-white overflow-hidden">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'T'
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg capitalize tracking-wide">{user.name || 'tushar'}</h3>
                    <p className="text-[9px] text-blue-400/80 tracking-wider font-semibold uppercase">SERVICE PARTNER</p>
                    <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                      <span>Verified Worker</span>
                      <CheckCircle className="w-3 h-3 fill-blue-500 text-[#0A0F1D]" />
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10">
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 space-y-6 relative z-10 text-sm">
                
                {/* MAIN */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-blue-400/60 tracking-wider px-2">MAIN</div>
                  <div className="space-y-1">
                    <a href="/" className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                          <Home size={16} />
                        </div>
                        <span className="font-medium">Home</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </a>
                    
                    <a href="/explore" className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                          <Compass size={16} />
                        </div>
                        <span className="font-medium">Explore</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </a>
                    
                    <button onClick={() => { changeTab('overview'); setIsDrawerOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-left ${
                      activeTab === 'overview'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.05)]">
                          <LayoutDashboard size={16} />
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </button>

                    <button onClick={() => { changeTab('Services'); setIsDrawerOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-left ${
                      activeTab === 'Services'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                          <Briefcase size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Services</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-purple-500 text-white rounded-full leading-none">New</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </button>

                    <button onClick={() => { changeTab('messages'); setIsDrawerOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-left ${
                      activeTab === 'messages'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                          <MessageSquare size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Chat</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-green-500 text-white rounded-full leading-none">2</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* WORKER TOOLS */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-blue-400/60 tracking-wider px-2">WORKER TOOLS</div>
                  <div className="space-y-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: Briefcase, colorClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
                      { id: 'wallet', label: 'Wallet & Earnings', icon: Wallet, colorClass: 'bg-green-500/10 text-green-500 border border-green-500/20' },
                      { id: 'calendar', label: 'My Schedule', icon: Calendar, colorClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/20' },
                      { id: 'pricing', label: 'Charges & Profit', icon: IndianRupee, colorClass: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { changeTab(item.id); setIsDrawerOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-left ${
                          activeTab === item.id
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.colorClass}`}>
                            <item.icon size={16} />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SETTINGS & LEGAL */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-blue-400/60 tracking-wider px-2">SETTINGS & LEGAL</div>
                  <div className="space-y-1">
                    <button onClick={() => { changeTab('profile'); setIsDrawerOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-left ${
                      activeTab === 'profile'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center">
                          <Settings size={16} />
                        </div>
                        <span className="font-medium">Settings</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </button>
                    
                    <a href="/privacy" className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                          <Shield size={16} />
                        </div>
                        <span className="font-medium">Privacy Policy</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </a>
                    
                    <a href="/terms" className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium">Terms & Conditions</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </a>
                    
                    <a href="/about" className="flex items-center justify-between px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                          <Info size={16} />
                        </div>
                        <span className="font-medium">About Us</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Logout Button Row */}
                <div className="pt-4 pb-8">
                  <button
                    onClick={() => {
                      localStorage.removeItem('serviq_user');
                      localStorage.removeItem('serviq_token');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl transition-all font-semibold shadow-[0_0_15px_rgba(239,68,68,0.05)] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

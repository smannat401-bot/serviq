import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, Marker } from '@react-google-maps/api';
import {
  Briefcase, DollarSign, Star, Calendar,
  MessageSquare, Bell, CheckCircle, XCircle,
  Plus, Tag, Trash2, User, MapPin, Clock, Edit3, LogOut, Phone, Upload, Trash, AlertTriangle, ShieldOff
} from 'lucide-react';



import CompletionModal from '../components/modals/CompletionModal';
import CancellationModal from '../components/modals/CancellationModal';
import { API_URL } from '../config';

export default function WorkerDashboard() {
  const user = JSON.parse(localStorage.getItem('servic_user') || '{}');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMapJob, setSelectedMapJob] = useState<{ client: string, location: string, lat: number, lng: number } | null>(null);
  const [selectedBookingForCompletion, setSelectedBookingForCompletion] = useState<string | null>(null);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  // Custom Services State
  const [services, setServices] = useState<any[]>([]);
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
  const [travelFee, setTravelFee] = useState(user.travelFee || 0);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState('');

  // Messages State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

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
        headers: { 'Content-Type': 'application/json' },
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
        localStorage.setItem('servic_user', JSON.stringify(data.user));
        // Force reload to update user context everywhere
        window.location.reload();
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
    if (user._id) {
      fetch(`${API_URL}/api/bookings/worker/${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBookings(data);
          }
        })
        .catch(err => console.error(err));
    }
  };

  // Fetch worker's actual catalog, bookings, and profile on load
  useEffect(() => {
    if (user._id) {
      // Fetch Catalog
      fetch(`${API_URL}/api/services/${user._id}`)
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
        })
        .catch(err => console.error(err));

      fetchBookings();
    }
  }, []);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    setScheduleMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/availability/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: availabilityDays, startTime: availabilityStartTime, endTime: availabilityEndTime })
      });
      if (res.ok) {
        setScheduleMessage('Schedule saved successfully!');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCharge, distanceRate, travelFee })
      });
      const data = await res.json();
      if (res.ok) {
        setPricingMessage('Pricing updated successfully!');
        localStorage.setItem('servic_user', JSON.stringify(data.user));
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Declined', cancelledBy: 'worker' })
      });
      if (res.ok) {
        fetchBookings();
        // Update local user state for cancellation count
        const updatedUserRes = await fetch(`${API_URL}/api/services/${user._id}`);
        const updatedUserData = await updatedUserRes.json();
        localStorage.setItem('servic_user', JSON.stringify(updatedUserData));
        window.location.reload();
      }
    } catch (err) {
      console.error('Error declining booking', err);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchBookings();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Accepted' })
      });
      if (res.ok) fetchBookings();
    } catch (err) {
      console.error('Error accepting booking', err);
    }
  };
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations/${user._id}`);
      const data = await res.json();
      if (res.ok) setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${bookingId}`);
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
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          method: 'DELETE'
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
              localStorage.removeItem('servic_user');
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
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
                { id: 'wallet', label: 'Wallet & Earnings', icon: DollarSign },
                { id: 'services', label: 'My Services', icon: Tag },
                { id: 'calendar', label: 'Schedule', icon: Calendar },
                { id: 'pricing', label: 'Charges & Profit', icon: DollarSign },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'profile', label: 'Profile Details', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
                  localStorage.removeItem('servic_user');
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
          <main className="flex-1 space-y-8">
            <header className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div>
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
              <button className="p-2 relative text-gray-600 dark:text-gray-400 hover:text-brand-electricBlue transition-colors">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </button>
            </header>

            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Earnings', value: `$${bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released').reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0).toFixed(2)}`, icon: DollarSign, color: 'text-brand-electricBlue' },
                    { label: 'Honour Score', value: (user.honourScore || 100).toString(), icon: Star, color: user.honourScore <= 75 ? 'text-red-500' : 'text-green-500' },
                    { label: 'Cancellations', value: (user.cancellationCount || 0).toString(), icon: XCircle, color: user.cancellationCount >= 5 ? 'text-red-500' : 'text-gray-400' },
                    { label: 'Jobs Done', value: bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released').length.toString(), icon: Briefcase, color: 'text-brand-gold' },
                  ].map((stat, i) => (
                    <div key={i} className={`glass-card p-6 flex flex-col hover:border-brand-electricBlue/30 transition-colors ${stat.label === 'Honour Score' && user.honourScore <= 75 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                          <stat.icon size={24} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-brand-black dark:text-white mb-1">{stat.value}</div>
                      <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming Bookings */}
                <div className="glass-card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-brand-black dark:text-white">Upcoming Jobs</h2>
                      <p className="text-xs text-gray-500 italic mt-1">
                        <span className="text-brand-electricBlue font-bold">Rule:</span> कैंसिलेशन पेनल्टी केवल बुकिंग स्वीकार करने के बाद लागू होगी।
                      </p>
                    </div>
                    <button className="text-brand-electricBlue hover:text-brand-gold font-medium text-sm transition-colors whitespace-nowrap">View Calendar</button>
                  </div>
                  <div className="space-y-4">
                    {bookings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No upcoming jobs at the moment.</p>
                    )}
                    {bookings.map((booking) => (
                      <div key={booking._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-electricBlue/20 flex items-center justify-center text-brand-electricBlue font-bold text-lg">
                            {booking.client?.name ? booking.client.name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-brand-black dark:text-white">{booking.client?.name || 'Unknown Client'}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{booking.serviceDetails?.title || 'Service'} • {new Date(booking.date).toLocaleDateString()} {booking.timeSlot}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <button
                            onClick={() => setSelectedMapJob(booking)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-brand-black dark:text-white rounded-xl text-sm font-semibold transition-colors"
                          >
                            <MapPin size={16} className="text-brand-electricBlue" /> Map
                          </button>
                          {booking.status === 'Pending' ? (
                            <>
                              <button onClick={() => handleAcceptBooking(booking._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">
                                <CheckCircle size={16} /> Accept
                              </button>
                              <button onClick={() => handleDeclineBooking(booking._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-sm font-semibold transition-colors">
                                <XCircle size={16} /> Decline
                              </button>
                            </>
                          ) : booking.status === 'Accepted' ? (
                            <>
                            <button onClick={() => handleUpdateStatus(booking._id, 'On The Way')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-blue-500/20">
                              <CheckCircle size={16} /> On My Way
                            </button>
                              <a href={`tel:${booking.client?.phone || '0000000000'}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-xl text-sm font-bold shadow-lg transition-colors">
                                <Phone size={16} className="text-brand-gold" /> Call Client
                              </a>
                              <button onClick={() => setSelectedBookingForCancellation(booking._id)} className="flex-1 md:flex-none p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Cancel Job">
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : booking.status === 'On The Way' ? (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <button onClick={() => handleUpdateStatus(booking._id, 'Working')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white text-yellow-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-yellow-500/20">
                                <Briefcase size={16} /> Start Working
                              </button>
                              <button onClick={() => setSelectedBookingForCancellation(booking._id)} className="flex-1 md:flex-none p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Cancel Job">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ) : booking.status === 'Working' ? (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <button onClick={() => handleUpdateStatus(booking._id, 'Waiting For Code')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-purple-500/20">
                                <CheckCircle size={16} /> Finish Job
                              </button>
                              <button onClick={() => setSelectedBookingForCancellation(booking._id)} className="flex-1 md:flex-none p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Cancel Job">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ) : booking.status === 'Waiting For Code' ? (
                            <button onClick={() => setSelectedBookingForCompletion(booking._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 rounded-xl text-sm font-bold shadow-sm transition-colors border border-green-500/20">
                              <CheckCircle size={16} /> Enter Code
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-brand-electricBlue/10 text-brand-electricBlue rounded-xl text-sm font-semibold border border-brand-electricBlue/20">
                              {booking.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
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
                          placeholder="e.g. $45/hr or $150 fixed"
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
                          placeholder="Describe what is included in this service..."
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
                    {services.length === 0 && (
                      <p className="text-gray-500">No services added yet.</p>
                    )}
                    {services.map((service) => (
                      <div key={service._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue flex-shrink-0 mt-1">
                            <Tag size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-lg text-brand-black dark:text-white">{service.title}</h4>
                              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-bold rounded-lg border border-green-500/20">${service.price}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 max-w-xl">{service.description}</p>
                          </div>
                        </div>
                        <button onClick={() => removeService(service._id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors md:ml-auto">
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

            
            {activeTab === 'wallet' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Available Balance</h3>
                    <p className="text-4xl font-bold text-brand-black dark:text-white">${user.walletBalance?.toFixed(2) || '0.00'}</p>
                    <button className="mt-4 w-full py-3 bg-brand-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
                      Withdraw Funds
                    </button>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Total Earnings (All Time)</h3>
                    <p className="text-4xl font-bold text-brand-black dark:text-white">${bookings.filter(b => b.status === 'Completed' || b.status === 'Payment Released').reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">75% of total job cost</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'calendar' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                              availabilityDays.includes(day) 
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
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-6">Service Charges & Pricing</h2>
                  <p className="text-gray-500 mb-8">Control your earnings by setting your own base charges and travel fees. These will be automatically added to the total booking cost.</p>
                  
                  {pricingMessage && (
                    <div className={`p-4 mb-6 rounded-xl font-medium ${pricingMessage.includes('successfully') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {pricingMessage}
                    </div>
                  )}

                  <form onSubmit={handleSavePricing} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Service Charge ($)</label>
                        <input 
                          type="number" 
                          value={baseCharge}
                          onChange={(e) => setBaseCharge(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 50"
                        />
                        <p className="text-xs text-gray-400 mt-2">Minimum charge for any booking.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Travel Fee ($)</label>
                        <input 
                          type="number" 
                          value={travelFee}
                          onChange={(e) => setTravelFee(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 10"
                        />
                        <p className="text-xs text-gray-400 mt-2">Fixed fee to cover basic travel costs.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance Charge ($ per km)</label>
                        <input 
                          type="number" 
                          value={distanceRate}
                          onChange={(e) => setDistanceRate(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                          placeholder="e.g. 2"
                        />
                        <p className="text-xs text-gray-400 mt-2">Extra charge for long distance travel.</p>
                      </div>
                    </div>

                    <div className="bg-brand-electricBlue/5 p-6 rounded-2xl border border-brand-electricBlue/10">
                      <h4 className="font-bold text-brand-black dark:text-white mb-2 flex items-center gap-2">
                        <DollarSign size={18} className="text-brand-electricBlue" /> Pricing Preview
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        If a client books you from 10km away: <br/>
                        <span className="font-bold text-brand-black dark:text-white">
                          ${baseCharge} (Base) + ${travelFee} (Travel) + ${distanceRate * 10} (Distance) = ${(baseCharge || 0) + (travelFee || 0) + (distanceRate * 10 || 0)}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[700px] flex gap-6">
                <div className="w-1/3 glass-card flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 font-bold text-xl text-brand-black dark:text-white">Conversations</div>
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
                
                <div className="w-2/3 glass-card flex flex-col overflow-hidden relative">
                  {selectedChat ? (
                    <>
                      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue font-bold">
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
                      <h3 className="text-xl font-bold text-brand-black dark:text-white">Your Workspace Chat</h3>
                      <p className="text-gray-500 max-w-xs">Select a conversation from the left to start chatting with your clients.</p>
                    </div>
                  )}
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
                <h2 className="text-xl font-bold text-brand-black dark:text-white">Location: {selectedMapJob.client}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {selectedMapJob.location}</p>
              </div>
              <button onClick={() => setSelectedMapJob(null)} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
                <XCircle size={28} />
              </button>
            </div>
            <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 relative">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: selectedMapJob.lat, lng: selectedMapJob.lng }}
                zoom={14}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [
                    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
                  ]
                }}
              >
                <Marker position={{ lat: selectedMapJob.lat, lng: selectedMapJob.lng }} />
              </GoogleMap>
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
    </div>
  );
}

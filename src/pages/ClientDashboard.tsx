import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, Heart, MessageSquare, Settings, Bell, MapPin, Search, BadgeCheck, Tag, LogOut, Star, Upload, Trash, Phone, RefreshCw, CreditCard, ArrowLeft
} from 'lucide-react';
import BookingModal from '../components/modals/BookingModal';
import ReviewModal from '../components/modals/ReviewModal';
import { API_URL, getAuthHeaders } from '../config';

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

  const [activeTab, setActiveTab] = useState('browse');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060a14] pt-8 px-4 md:px-6 pb-24 md:pb-8">
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
                <MapPin size={14} /> {user.serviceArea || 'Local Area'}
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
                  onClick={() => setActiveTab(item.id)}
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
          <main className="flex-1 space-y-8">
            <header className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
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
            </header>

            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-brand-black dark:text-white">Past Repairs</h2>
                  <button 
                    onClick={fetchBookings}
                    className="flex items-center gap-2 text-sm text-brand-electricBlue hover:text-brand-gold transition-colors font-semibold"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">You haven't made any bookings yet.</p>
                  )}
                  {bookings.map((booking) => (
                    <div key={booking._id} className="flex justify-between items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] hover:shadow-sm transition-all group">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full bg-brand-electricBlue/10 flex items-center justify-center text-brand-electricBlue font-bold text-lg">
                          {booking.worker?.name ? booking.worker.name.charAt(0) : 'W'}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-black dark:text-white">{booking.serviceName || 'Service'}</h4>
                          <p className="text-sm text-gray-500">with {booking.worker?.name || 'Professional'} • {new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-brand-black dark:text-white mb-1">{booking.totalPrice || '₹0'}</p>
                        <div className="flex gap-2">
                          <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">{booking.status}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${booking.paymentStatus === 'Held in Trust' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>{booking.paymentStatus || 'Unpaid'}</span>
                        </div>
                        {booking.status === 'Waiting For Payment' && (
                          <button 
                            onClick={() => handleBookingPayment(booking)}
                            className="mt-2 w-full py-2 bg-brand-electricBlue text-white text-xs font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CreditCard size={14} /> Pay Now
                          </button>
                        )}
                        {['Accepted', 'On The Way', 'Working', 'Waiting For Code'].includes(booking.status) && booking.completionCode && (
                          <div className="mt-2 text-right">
                            <span className="text-xs text-gray-500 block mb-1">Give this 4-digit code to worker to release payment:</span>
                            <span className="text-sm font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-lg border border-brand-gold/20 tracking-widest">{booking.completionCode}</span>
                          </div>
                        )}
                        {booking.status === 'Completed' && !booking.isReviewed && (
                          <button 
                            onClick={() => setSelectedBookingForReview(booking)}
                            className="mt-2 text-xs font-bold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Star size={12} className="fill-brand-gold" /> Leave Review
                          </button>
                        )}
                        {booking.isReviewed && (
                          <span className="mt-2 text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Star size={12} className="text-gray-400 fill-gray-400" /> Reviewed
                          </span>
                        )}
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
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
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

                {/* Real Workers List */}
                {workers
                  .filter(w => !w.isBlocked && (w.honourScore === undefined || w.honourScore > 70))
                  .filter(w => {
                    const matchQ = !searchQuery || 
                      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      w.skill?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (w.catalog || []).some((s: any) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
                    const matchL = !locationQuery || 
                      w.serviceArea?.toLowerCase().includes(locationQuery.toLowerCase());
                    return matchQ && matchL;
                  })
                  .map((worker) => (
                  worker.catalog && worker.catalog.length > 0 && worker.catalog.map((item: any, idx: number) => (
                    <div key={`${worker._id}-${idx}`} className="glass-card p-6 border-l-4 border-l-brand-electricBlue mb-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Worker Info */}
                        <div className="md:w-1/4 flex flex-col items-center text-center border-r border-gray-100 dark:border-gray-800 pr-0 md:pr-6">
                          {worker.profilePhoto ? (
                            <img src={worker.profilePhoto} alt={worker.name} className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/30 mb-3 object-cover" />
                          ) : (
                            <div className="w-20 h-20 rounded-full border-2 border-brand-electricBlue/30 mb-3 bg-brand-electricBlue/10 flex items-center justify-center text-2xl font-bold text-brand-electricBlue">
                              {worker.name ? worker.name.charAt(0) : 'W'}
                            </div>
                          )}
                          <h3 className="font-bold text-brand-black dark:text-white flex items-center justify-center gap-1">
                            {worker.name} <BadgeCheck size={16} className="text-brand-electricBlue" />
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{worker.skill || 'Professional'}</p>
                        </div>
                        
                        {/* Service Details */}
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
                
                {workers.length === 0 && (
                  <p className="text-center text-gray-500 py-12">No professional Services available right now.</p>
                )}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="glass-card p-8">
                  <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">Account Settings</h2>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex justify-around items-center p-3 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
        {[
          { id: 'browse', label: 'Explore', icon: Search },
          { id: 'bookings', label: 'Bookings', icon: ClipboardList },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'settings', label: 'Profile', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === item.id 
                ? 'text-brand-electricBlue' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'fill-brand-electricBlue/20' : ''} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

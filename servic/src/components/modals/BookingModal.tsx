import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import { API_URL } from '../../config';

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

export default function BookingModal({ isOpen, onClose, workerId, workerName, serviceName, basePrice, availability }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completionCode, setCompletionCode] = useState('');

  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [workerBookings, setWorkerBookings] = useState<any[]>([]);
  const [workerPricing, setWorkerPricing] = useState({ baseCharge: 0, distanceRate: 0, travelFee: 0 });
  const [mockDistance] = useState(4.2); // Mock distance for now

  const user = JSON.parse(localStorage.getItem('servic_user') || '{}');

  // Fetch worker bookings to disable booked slots
  useEffect(() => {
    if (isOpen && workerId) {
      fetch(`${API_URL}/api/bookings/worker/${workerId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWorkerBookings(data);
          }
        })
        .catch(err => console.error(err));
      
      // Fetch worker pricing
      fetch(`${API_URL}/api/services/${workerId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setWorkerPricing({
              baseCharge: data.baseCharge || 0,
              distanceRate: data.distanceRate || 0,
              travelFee: data.travelFee || 0
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, workerId]);

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

  const handleContinue = () => {
    if (!date || !time || !location) {
      setError('Please fill in all fields (date, time, and location).');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePayment = async () => {
    if (!date || !time || !location) {
      setError('Please fill in all fields (date, time, and location).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create Razorpay Order on Backend
      const servicePrice = parseInt(basePrice.replace(/\D/g, '')) || 0;
      const platformFee = 2.50;
      const distanceCharge = mockDistance * workerPricing.distanceRate;
      const amount = servicePrice + workerPricing.baseCharge + workerPricing.travelFee + distanceCharge + platformFee;
      
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order');

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'test_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SERVIQ Marketplace",
        description: `Booking ${serviceName} with ${workerName}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          // 3. Verify Payment on Backend
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  client: user._id,
                  worker: workerId,
                  serviceName,
                  date,
                  time,
                  location,
                  basePrice,
                  totalPrice: `$${(amount || 0).toFixed(2)}`,
                  distance: mockDistance,
                  travelFee: (workerPricing.travelFee || 0) + (mockDistance * (workerPricing.distanceRate || 0))
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setCompletionCode(verifyData.booking.completionCode);
              setStep(3); // Success
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err: any) {
            setError(err.message);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#3B82F6"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

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
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-brand-black dark:text-white">
            {step === 1 ? 'Schedule Service' : step === 2 ? 'Secure Payment' : 'Booking Confirmed!'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-brand-black dark:text-white mb-1">{serviceName}</h3>
                <p className="text-sm text-gray-500">with {workerName}</p>
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
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-electricBlue z-10" size={18} />
                  <Autocomplete>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white text-sm"
                      placeholder="Start typing your full address..."
                    />
                  </Autocomplete>
                </div>
              </div>

              {/* Map UI & Distance */}
              {location && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-122.50293731689455%2C37.69752497672154%2C-122.35324859619142%2C37.8105741648003&amp;layer=mapnik"
                    className="absolute inset-0 opacity-60 dark:opacity-40 grayscale"
                  ></iframe>
                  <div className="relative z-10 bg-white dark:bg-[#0f172a] px-5 py-3 rounded-full shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-brand-electricBlue/20 flex items-center justify-center text-brand-electricBlue">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Distance</p>
                      <p className="text-sm font-bold text-brand-black dark:text-white">{mockDistance} km (approx. 12 mins)</p>
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
                    <span>${(workerPricing.baseCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Travel Fee</span>
                    <span>${(workerPricing.travelFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Distance Charge ({mockDistance} km)</span>
                    <span>${(mockDistance * (workerPricing.distanceRate || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform Fee</span>
                    <span>$2.50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-brand-black dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Total Estimate</span>
                    <span>${(parseInt(basePrice.replace(/\D/g, '')) + (workerPricing.baseCharge || 0) + (workerPricing.travelFee || 0) + (mockDistance * (workerPricing.distanceRate || 0)) + 2.50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-brand-electricBlue/10 border border-brand-electricBlue/30 p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-brand-electricBlue rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2">Trust Wallet Protection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your payment of <span className="font-bold text-brand-black dark:text-white">${(parseInt(basePrice.replace(/\D/g, '')) + (workerPricing.baseCharge || 0) + (workerPricing.travelFee || 0) + (mockDistance * (workerPricing.distanceRate || 0)) + 2.50).toFixed(2)}</span> will be held securely in the SERVIQ Trust Wallet.
                </p>
                <div className="mt-4 bg-white dark:bg-brand-black p-4 rounded-xl text-left shadow-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-brand-black dark:text-white mb-2">How it works:</p>
                  <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
                    <li>You pay now, money is held by platform.</li>
                    <li>Worker completes the job.</li>
                    <li>You provide the 4-digit code to release payment.</li>
                  </ol>
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
              <h3 className="text-2xl font-bold text-brand-black dark:text-white">Booking Confirmed!</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your professional has been notified. You can track this booking in your dashboard.
              </p>
              <div className="mt-6 p-6 bg-brand-electricBlue/10 border border-brand-electricBlue/20 rounded-2xl w-full">
                <p className="text-xs font-bold text-brand-electricBlue uppercase tracking-widest mb-2">Your Verification Code</p>
                <p className="text-4xl font-black text-brand-black dark:text-white tracking-[0.5em] ml-[0.25em]">
                  {completionCode}
                </p>
                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                  IMPORTANT: Share this code with the worker ONLY AFTER the job is completed to your satisfaction.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f172a]/50">
          {step === 1 ? (
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-brand-black dark:bg-white text-brand-gold dark:text-brand-black font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
            >
              Continue to Payment
            </button>
          ) : step === 2 ? (
            <button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-electricBlue text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Pay Securely'
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

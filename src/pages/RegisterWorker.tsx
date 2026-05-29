import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle } from 'lucide-react';
import { API_URL, saveToken } from '../config';
import PasswordInput from '../components/ui/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterWorker() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone: '', skill: 'Electrician', experience: '', serviceArea: '', bio: '', profilePhoto: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password Validation Rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be 8-20 characters and include uppercase, lowercase, number, and special character. / पासवर्ड में uppercase, lowercase, number और special character hona jaruri hai.');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match. / पासवर्ड मेल नहीं खा रहा है।');
      return;
    }

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP. / कृपया सही 4-digit OTP डालें।');
      return;
    }

    setLoading(true);

    try {
      let uploadedPhotoUrl = '';

      // Upload photo first if selected
      if (photoFile) {
        const uploadData = new FormData();
        uploadData.append('profilePhoto', photoFile);

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: uploadData
        });
        
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          uploadedPhotoUrl = uploadResult.imageUrl;
        }
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'worker', experience: Number(formData.experience), profilePhoto: uploadedPhotoUrl, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user and token to login automatically
      if (data.token) saveToken(data.token);
      localStorage.setItem('serviq_user', JSON.stringify(data.user));

      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = '/worker-dashboard';
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setSendingOtp(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/send-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setOtpSent(true);
      alert('OTP sent to your email! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          role: 'worker'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google application failed');
      }

      if (data.token) saveToken(data.token);
      localStorage.setItem('serviq_user', JSON.stringify(data.user));
      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = '/worker-dashboard';
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full glass-card p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand-black dark:text-white mb-2">Apply as a Pro</h2>
          <p className="text-gray-500 dark:text-gray-400">Join our network of verified professionals and grow your business.</p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2 mx-auto">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-3xl font-bold text-brand-black dark:text-white">Welcome to SERVIQ!</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
              Your account is now active. Redirecting you to your dashboard to explore...
            </p>
            <div className="w-12 h-12 border-4 border-brand-electricBlue border-t-transparent rounded-full animate-spin mt-8 mx-auto"></div>
          </motion.div>
        ) : (
          <>
            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold">{error}</div>}
            
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-6">
            <label htmlFor="photo-upload" className="relative cursor-pointer group">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-brand-electricBlue shadow-md" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-brand-electricBlue transition-colors">
                  <Upload size={32} />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Upload</span>
              </div>
            </label>
            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            <p className="text-sm text-gray-500 mt-2">Profile Photo (Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white" placeholder="Michael Chen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white" placeholder="michael@example.com" />
            </div>
            <PasswordInput 
              value={formData.password}
              onChange={(val) => setFormData({...formData, password: val})}
              label="Create Password"
            />
            <PasswordInput 
              value={confirmPassword}
              onChange={(val) => setConfirmPassword(val)}
              label="Confirm Password"
              placeholder="Confirm your password"
              showValidation={false}
              id="confirm-password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Skill / Category</label>
              <select value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white">
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="AC Repair">AC Repair</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
              <input type="number" min="0" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white" placeholder="e.g. 5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service City / Area</label>
              <input
                type="text"
                required
                value={formData.serviceArea}
                onChange={e => setFormData({...formData, serviceArea: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white"
                placeholder="e.g. Ludhiana, Punjab"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me / Bio</label>
            <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white resize-none" placeholder="Tell users about your expertise, reliability, and what makes your Service great..."></textarea>
          </div>

          <label htmlFor="aadhar-upload" className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-brand-gold transition-colors cursor-pointer">
            <input type="file" id="aadhar-upload" className="hidden" accept=".pdf,.jpg,.png,.jpeg" />
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-brand-black dark:text-white font-medium">Upload Aadhar Card <span className="text-red-500">*</span></p>
            <p className="text-sm text-gray-500 mt-1">PDF, JPG or PNG up to 10MB (Mandatory)</p>
          </label>

          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter OTP</label>
              <input
                type="text"
                maxLength={4}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white"
                placeholder="4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || sendingOtp}
            className="w-full py-4 rounded-xl bg-brand-black text-brand-gold dark:bg-brand-white dark:text-brand-black font-bold text-lg hover:shadow-lg transition-all mt-4 flex justify-center items-center"
          >
            {loading || sendingOtp ? <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : otpSent ? 'Verify & Sign Up' : 'Send OTP & Apply'}
          </button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white dark:bg-[#060a14] text-gray-500 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Join Failed. Please try again.');
              }}
              theme="filled_black"
              shape="pill"
              width="100%"
            />
          </div>
          </>
        )}

        {!isSubmitted && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Already a partner? <Link to="/login" className="text-brand-gold font-semibold">Log in to Dashboard</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}

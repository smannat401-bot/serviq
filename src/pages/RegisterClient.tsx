import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Upload } from 'lucide-react';
import { API_URL, saveToken } from '../config';
import PasswordInput from '../components/ui/PasswordInput';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterClient() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
        body: JSON.stringify({ ...formData, role: 'client', profilePhoto: uploadedPhotoUrl, otp })
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
        window.location.href = '/client-dashboard';
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
          role: 'client'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google Sign up failed');
      }

      if (data.token) saveToken(data.token);
      localStorage.setItem('serviq_user', JSON.stringify(data.user));
      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = '/client-dashboard';
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
        className="max-w-md w-full glass-card p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand-black dark:text-white mb-2">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400">Join as a client to find trusted pros.</p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2 mx-auto">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-brand-black dark:text-white">Account Created!</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Setting up your personalized experience...
            </p>
            <div className="w-10 h-10 border-4 border-brand-electricBlue border-t-transparent rounded-full animate-spin mt-4 mx-auto"></div>
          </motion.div>
        ) : (
          <>
            <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold">{error}</div>}
            
            {/* Profile Photo */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative mb-2">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-brand-electricBlue/20" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-700">
                    <Upload className="text-gray-400" size={24} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500">Upload Profile Photo (Optional)</p>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none transition-all text-brand-black dark:text-white" placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none transition-all text-brand-black dark:text-white" placeholder="john@example.com" 
            />
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

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none text-brand-black dark:text-white"
                  placeholder="4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || sendingOtp}
              className="w-full bg-brand-electricBlue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading || sendingOtp ? 'Processing...' : otpSent ? 'Verify & Sign Up' : 'Send OTP & Sign Up'}
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
                setError('Google Sign up Failed. Please try again.');
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
            Already have an account? <Link to="/login" className="text-brand-electricBlue font-semibold">Log in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}

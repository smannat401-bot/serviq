import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, User, Briefcase, Shield, Lock as LockIcon } from 'lucide-react';
import { API_URL, saveToken } from '../config';
import PasswordInput from '../components/ui/PasswordInput';
import Logo from '../components/ui/Logo';
import { GoogleLogin } from '@react-oauth/google';
import SEO from '../components/seo/SEO';


export default function Login() {
  const [role, setRole] = useState<'client' | 'worker' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(0); // 0=login, 1=email, 2=otp, 3=new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
      setForgotStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('OTP Verified. Please enter new password.');
      setForgotStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Password reset successfully. You can now log in.');
      setTimeout(() => {
        setForgotStep(0);
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        // Show brute force specific message
        if (response.status === 429) {
          throw new Error(data.message);
        }
        // Show remaining attempts if available
        if (data.attemptsRemaining !== undefined) {
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Login failed');
      }

      // ✅ Save JWT token + user data
      if (data.token) saveToken(data.token);
      localStorage.setItem('serviq_user', JSON.stringify(data.user));

      if (data.user.role === 'worker') {
        window.location.href = '/worker-dashboard';
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/client-dashboard';
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          role: role 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google Login failed');
      }

      // ✅ Save JWT token + user data
      if (data.token) saveToken(data.token);
      localStorage.setItem('serviq_user', JSON.stringify(data.user));

      if (data.user.role === 'worker') {
        window.location.href = '/worker-dashboard';
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/client-dashboard';
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <SEO title="Login" description="Log in to your SERVIQ account to manage bookings and profile." url="https://serviq.com/login" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 relative overflow-hidden"
      >
        {forgotStep === 0 ? (
          <>
            <div className="text-center mb-8">
              <Logo size="md" className="mb-6" />
              <h2 className="text-3xl font-bold text-brand-black dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400">Log in to your account to continue.</p>
            </div>

            {/* Role Toggle */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#0f172a] rounded-xl mb-8">
          <button
            onClick={() => setRole('client')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              role === 'client'
                ? 'bg-white dark:bg-[#1e293b] text-brand-electricBlue shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User size={18} /> User
          </button>
          <button
            onClick={() => setRole('worker')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              role === 'worker'
                ? 'bg-white dark:bg-[#1e293b] text-brand-gold shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Briefcase size={18} /> Partner
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              role === 'admin'
                ? 'bg-white dark:bg-[#1e293b] text-brand-electricBlue shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-electricBlue outline-none transition-all text-brand-black dark:text-white" 
                placeholder="you@example.com" 
              />
            </div>
          </div>
          <PasswordInput 
            value={password}
            onChange={(val) => setPassword(val)}
            label="Password"
            placeholder="••••••••"
            showValidation={false}
            id="login-password"
            rightLabel={
              <button 
                type="button" 
                onClick={() => setForgotStep(1)} 
                className={`text-sm font-semibold hover:underline ${role === 'worker' ? 'text-brand-gold' : 'text-brand-electricBlue'}`}
              >
                Forgot?
              </button>
            }
          />
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-4 flex items-center justify-center gap-2 ${
              role === 'worker' 
                ? 'bg-brand-black text-brand-gold dark:bg-brand-white dark:text-brand-black hover:shadow-lg' 
                : 'bg-brand-electricBlue hover:bg-blue-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
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
              setError('Google Login Failed. Please try again.');
            }}
            useOneTap
            theme="filled_black"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className={`font-semibold hover:underline ${role === 'worker' ? 'text-brand-gold' : 'text-brand-electricBlue'}`}>Sign up</Link>
        </p>
        </>
        ) : (
          // Forgot Password Flow
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-black dark:text-white mb-2">Reset Password</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {forgotStep === 1 && "Enter your email to receive an OTP."}
                {forgotStep === 2 && "Enter the OTP sent to your email."}
                {forgotStep === 3 && "Create a new password."}
              </p>
            </div>
            
            {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold text-center">{error}</div>}
            {message && <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-semibold text-center">{message}</div>}

            {forgotStep === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-brand-black text-white font-bold transition-all">
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter 4-Digit OTP</label>
                  <input 
                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={4}
                    className="w-full px-4 py-3 rounded-xl text-center tracking-widest text-2xl font-bold bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none" 
                    placeholder="0000" 
                  />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-brand-black text-white font-bold transition-all">
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 outline-none" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-brand-black text-white font-bold transition-all">
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Remember your password? <button onClick={() => setForgotStep(0)} className="font-semibold text-brand-electricBlue hover:underline">Log in here</button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

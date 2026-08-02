import React, { useState } from 'react';
import { safeFetchJson } from '../utils/api';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';
import {
  X,
  Phone,
  Mail,
  Lock,
  User,
  Gift,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [step, setStep] = useState<'credentials' | 'otp' | 'reset'>('credentials');

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Mobile or Email
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await safeFetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, identifier, password, referralCode })
      });

      if (!res.ok) throw new Error(res.error || 'Registration failed');

      setOtpDebugCode(res.data?.otpDebug || '1234');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await safeFetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, name, password, referralCode })
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'OTP verification failed');

      onLoginSuccess(res.data.user, res.data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Login failed');

      onLoginSuccess(res.data.user, res.data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await safeFetchJson('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Password reset request failed');

      setOtpDebugCode(res.data.otpDebug || '1234');
      setSuccessMsg(res.data.message);
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await safeFetchJson('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, newPassword })
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Password reset failed');

      setSuccessMsg(res.data.message);
      setMode('login');
      setStep('credentials');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <AppLogo size="lg" className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login'
              ? 'Welcome Back'
              : mode === 'forgot'
              ? 'Reset Password'
              : step === 'otp'
              ? 'Verify Mobile / Email'
              : 'Create Earner Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your account'
              : mode === 'forgot'
              ? 'Enter your mobile number or Gmail to reset password'
              : step === 'otp'
              ? `Enter the 4-digit code sent to ${identifier}`
              : 'Join Bangladesh’s trusted sponsor-based earning platform'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* Mode Toggles */}
        {step === 'credentials' && mode !== 'forgot' && (
          <div className="flex bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/80">
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Forms */}
        {mode === 'register' ? (
          step === 'credentials' ? (
            <form onSubmit={handleRegisterSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahat Chowdhury"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="+8801700000000 or name@email.com"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sponsor / Referral Code (Optional)
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    placeholder="e.g. RAHAT88"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? 'Sending Verification Code...' : 'Send OTP Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {otpDebugCode && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300">
                  <span>Verification OTP Code: </span>
                  <strong className="text-white text-sm font-mono tracking-widest">{otpDebugCode}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Enter 4-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Create Account'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to edit credentials
              </button>
            </form>
          )
        ) : mode === 'forgot' ? (
          step === 'credentials' ? (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Number or Gmail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="+8801700000000 or user@gmail.com"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer mt-2"
              >
                {loading ? 'Sending OTP...' : 'Send Reset Code (OTP)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center block pt-2"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordReset} className="space-y-4">
              {otpDebugCode && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300">
                  <span>Reset OTP Code: </span>
                  <strong className="text-white text-sm font-mono tracking-widest">{otpDebugCode}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Enter 4-Digit Reset OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Resetting Password...' : 'Verify OTP & Set New Password'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to edit credentials
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="+8801811111111 or user@earningplatform.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-amber-500" />
                <span>Remember Account</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setStep('credentials');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

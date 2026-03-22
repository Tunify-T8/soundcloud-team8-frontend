// ============================================================
// RESET PASSWORD PAGE — Tunify
// Location: src/features/auth/pages/ResetPasswordPage.tsx
// Reached via navigate('/reset-password', { state: { email } })
// after ForgotPasswordPage success screen
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { resetPassword, resendVerification } from '../services/index';
const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-6 w-auto sm:h-7" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase">SoundCloud</span>
  </Link>
);

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(emailFromState);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isPasswordReady =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  const isReady =
    isValidEmail(email) &&
    token.trim().length === 6 &&
    isPasswordReady &&
    confirmPassword === newPassword;

  const handleSave = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (token.trim().length !== 6) {
      setError('Please enter the 6-character code from your email.');
      return;
    }
    if (!isPasswordReady) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim(), token.trim().toUpperCase(), newPassword, confirmPassword, true);
      try {
        await resendVerification(email.trim());
      } catch {
        // verification email failed silently — still proceed
      }
      navigate('/verify-email', {
        state: {
          email: email.trim(),
          message: 'Password reset successfully. Please verify your email to continue.',
        },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
          setError('The reset code is incorrect or has expired. Please request a new one.');
        } else if (msg.toLowerCase().includes('email')) {
          setError('No account found with that email address.');
        } else {
          setError(msg);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">

      <AuthNavbar />

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">
          <div className="border border-[#3a3a3a] rounded-sm p-[3px] bg-[#111]">
            <div className="border border-[#555] rounded-sm bg-[#181818] min-h-[520px] p-8">

              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Reset your password</h1>
                  </div>

                  {/* Error */}
                  {error && (
                    <div role="alert" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div className="mb-4">
                    <div className="bg-[#2a2a2a] border border-[#555] rounded-sm px-4 pt-2 pb-2 focus-within:border-[#888] transition-colors">
                      <label className="block text-[#aaa] text-xs mb-0.5">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        placeholder="your@email.com"
                        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#666]"
                        autoComplete="email"
                      />
                    </div>
                    <p className="text-[#777] text-xs mt-1">Enter the email address associated with your account.</p>
                  </div>

                  {/* Reset code */}
                  <div className="mb-4">
                    <div className="bg-[#2a2a2a] border border-[#555] rounded-sm px-4 pt-2 pb-2 focus-within:border-[#888] transition-colors">
                      <label className="block text-[#aaa] text-xs mb-0.5">Reset code</label>
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => { setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setError(null); }}
                        placeholder="e.g. 21D9E4"
                        maxLength={6}
                        className="w-full bg-transparent text-white text-sm font-mono tracking-widest focus:outline-none placeholder-[#666] uppercase"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-[#777] text-xs mt-1">Enter the 6-character code we sent to your email inbox.</p>
                  </div>

                  {/* New password */}
                  <div className="mb-4">
                    <div className="relative bg-[#2a2a2a] border border-[#555] rounded-sm px-4 pt-2 pb-2 focus-within:border-[#888] transition-colors">
                      <label className="block text-[#aaa] text-xs mb-0.5">New password</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                        placeholder="Choose a password (min. 8 characters)"
                        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#666] pr-8"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <div className="mt-2 bg-[#1a1a1a] border border-[#333] rounded-sm px-4 py-3 flex flex-col gap-1.5">
                        {[
                          { label: 'At least 8 characters', met: newPassword.length >= 8 },
                          { label: 'At least one uppercase letter', met: /[A-Z]/.test(newPassword) },
                          { label: 'At least one lowercase letter', met: /[a-z]/.test(newPassword) },
                          { label: 'At least one number', met: /[0-9]/.test(newPassword) },
                          { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(newPassword) },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${rule.met ? 'bg-green-500' : 'bg-[#444]'}`}>
                              {rule.met && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs ${rule.met ? 'text-green-400' : 'text-[#888]'}`}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="mb-6">
                    <div className="relative bg-[#2a2a2a] border border-[#555] rounded-sm px-4 pt-2 pb-2 focus-within:border-[#888] transition-colors">
                      <label className="block text-[#aaa] text-xs mb-0.5">Confirm new password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                        placeholder="Re-enter your new password"
                        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#666] pr-8"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  {/* Save button */}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isReady || isSubmitting}
                    className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isReady && !isSubmitting
                        ? 'bg-white hover:bg-gray-100 text-black cursor-pointer'
                        : 'bg-[#333] text-[#888] cursor-not-allowed border border-[#444]'
                    }`}
                  >
                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save new password'}
                  </button>
                </>
              ) : (
                /* ── Success ── */
                <>
                  <h2 className="text-white text-lg font-bold mb-3">Password changed</h2>
                  <p className="text-[#ccc] text-sm leading-relaxed mb-6">
                    Your password has been updated successfully. You have been signed out of all other devices.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/signin')}
                    className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-sm text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
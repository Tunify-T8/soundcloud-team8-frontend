// ============================================================
// RESET PASSWORD PAGE — Tunify
// URL: /reset-password?token=<6char>
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/index';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isReady = newPassword.length >= 8 && confirmPassword.length >= 8 && email.trim().length > 0;

  const handleSave = async () => {
    setError(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetToken) {
      setError('This reset link is invalid or has expired.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email, resetToken, newPassword, confirmPassword, true);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else {
        setError(msg ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-black px-6 py-3 flex items-center">
        <svg viewBox="0 0 33 15" className="h-5 w-auto" fill="white" aria-hidden="true">
          <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
        </svg>
        <span className="text-white font-bold text-sm tracking-widest uppercase ml-2">SoundCloud</span>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-start justify-center px-4 pt-16 pb-10">
        <div className="w-full max-w-[540px]">

          {!submitted ? (
            <>
              <h1 className="text-[#333] text-3xl font-normal text-center mb-3">Change your password</h1>

              <p className="text-[#999] text-sm text-center leading-relaxed mb-8">
                {"Choose a strong, unique password. For tips on choosing a secure password, "}
                <a href="https://help.soundcloud.com/hc/en-us/articles/115003450547-How-to-Secure-Your-SoundCloud-Account" target="_blank" rel="noreferrer" className="text-[#999] hover:underline">visit our Help Center.</a>
              </p>

              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="block text-[#333] text-sm mb-2">Your email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="your@email.com"
                  className="w-full bg-[#f2f2f2] border-0 rounded px-4 py-3 text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#f50] transition-all"
                  autoComplete="email"
                />
              </div>

              {/* New password */}
              <div className="mb-4">
                <label className="block text-[#333] text-sm mb-2">Type your new password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  className="w-full bg-[#f2f2f2] border-0 rounded px-4 py-3 text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#f50] transition-all"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm password */}
              <div className="mb-6">
                <label className="block text-[#333] text-sm mb-2">Type your new password again, to confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  className="w-full bg-[#f2f2f2] border-0 rounded px-4 py-3 text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#f50] transition-all"
                  autoComplete="new-password"
                />
              </div>

              {/* Sign out everywhere — static for now */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 rounded bg-[#f50] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#333] text-sm">Also sign me out everywhere</span>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!isReady || isSubmitting}
                className={`w-full py-3 rounded text-sm font-medium transition-all ${
                  isReady && !isSubmitting
                    ? 'bg-[#f2f2f2] hover:bg-[#e6e6e6] text-[#333] cursor-pointer'
                    : 'bg-[#f2f2f2] text-[#999] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-[#333] text-3xl font-normal text-center mb-3">Password changed</h1>
              <p className="text-[#999] text-sm text-center leading-relaxed mb-8">
                Your password has been updated successfully. You have been signed out of all other devices.
              </p>
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="w-full bg-[#f2f2f2] hover:bg-[#e6e6e6] text-[#333] py-3 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 px-6 flex items-center gap-6">
        <a href="https://soundcloud.com/terms-of-use" target="_blank" rel="noreferrer" className="text-[#999] text-xs hover:underline">Legal</a>
        <a href="https://soundcloud.com/pages/privacy" target="_blank" rel="noreferrer" className="text-[#999] text-xs hover:underline">Privacy</a>
        <a href="https://soundcloud.com/pages/cookies" target="_blank" rel="noreferrer" className="text-[#999] text-xs hover:underline">Cookies</a>
        <a href="https://soundcloud.com/imprint" target="_blank" rel="noreferrer" className="text-[#999] text-xs hover:underline">Imprint</a>
      </footer>

    </div>
  );
};

export default ResetPasswordPage;
// ============================================================
// RESET PASSWORD PAGE — Tunify
// User lands here from the email reset link
// URL: /reset-password?token=<jwt_token>
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-6 w-auto sm:h-7" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase">SoundCloud</span>
  </Link>
);

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The token comes from the URL: /reset-password?token=abc123
  const resetToken = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signOutEverywhere, setSignOutEverywhere] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Button is only active when both fields have 8+ chars
  const isReady =
    newPassword.length >= 8 &&
    confirmPassword.length >= 8;

  const handleSave = async () => {
    setError(null);

    // Validation 1: minimum length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Validation 2: passwords must match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validation 3: no token in URL (invalid/expired link)
    if (!resetToken) {
      setError('This reset link is invalid or has expired.');
      return;
    }

    setIsSubmitting(true);

    // Mock: simulate API call
    await new Promise((r) => setTimeout(r, 800));

    // Mock success
    setSubmitted(true);
    setIsSubmitting(false);

    // Real implementation when backend is ready:
    // const res = await axiosInstance.post('/auth/reset-password', {
    //   token: resetToken,
    //   newPassword,
    //   signOutEverywhere,
    // });
    // if (res.data.requireReLogin) {
    //   clearTokens();
    //   navigate('/signin');
    // }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0d0d0d] border-b border-[#222]">
        <TunifyLogo />
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white text-sm font-medium hover:text-white/80">Home</Link>
          <Link to="/stream" className="text-white/60 text-sm hover:text-white">Feed</Link>
          <Link to="/discover" className="text-white/60 text-sm hover:text-white">Library</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/signin" className="text-white text-sm font-medium hover:text-white/80">Sign in</Link>
          <Link to="/create-account" className="hidden sm:inline-flex border border-white text-white text-sm font-medium px-5 py-1.5 rounded-full hover:bg-white hover:text-black transition-all">
            Create account
          </Link>
          <button className="text-white/60 text-lg hover:text-white hidden sm:block">···</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">
          <div className="border border-[#3a3a3a] rounded-sm p-[3px] bg-[#111]">
            <div className="border border-[#555] rounded-sm bg-[#181818] min-h-[520px] p-8">

              {!submitted ? (
                <>
                  {/* Title */}
                  <h1 className="text-white text-xl font-bold text-center mb-2">
                    Change your password
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[#999] text-sm text-center leading-relaxed mb-8">
                    Choose a strong, unique password.{' '}
                    For tips on choosing a secure password,{' '}
                    <a href="#" className="text-[#0066cc] hover:underline">visit our Help Center</a>.
                  </p>

                  {/* Error */}
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}

                  {/* New password */}
                  <div className="mb-5">
                    <label className="block text-white text-sm mb-2">
                      Type your new password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                        className="w-full bg-[#2a2a2a] border border-[#555] rounded-sm px-4 py-3 pr-10 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#888] transition-colors"
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
                  </div>

                  {/* Confirm password */}
                  <div className="mb-6">
                    <label className="block text-white text-sm mb-2">
                      Type your new password again, to confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                        className="w-full bg-[#2a2a2a] border border-[#555] rounded-sm px-4 py-3 pr-10 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#888] transition-colors"
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
                  </div>

                  {/* Sign out everywhere checkbox */}
                  <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => setSignOutEverywhere((v) => !v)}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${signOutEverywhere ? 'bg-[#f50]' : 'bg-[#2a2a2a] border border-[#555]'}`}>
                      {signOutEverywhere && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white text-sm">Also sign me out everywhere</span>
                  </div>

                  {/* Save button — disabled until both fields 8+ chars */}
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
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                      : 'Save'
                    }
                  </button>
                </>
              ) : (
                /* ── Success state ── */
                <>
                  <h1 className="text-white text-xl font-bold text-center mb-4">
                    Password changed
                  </h1>
                  <p className="text-[#ccc] text-sm text-center leading-relaxed mb-6">
                    Your password has been updated successfully.
                    {signOutEverywhere && ' You have been signed out of all other devices.'}
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

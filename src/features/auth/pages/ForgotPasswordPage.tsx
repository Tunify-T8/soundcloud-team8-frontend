// ============================================================
// FORGOT PASSWORD PAGE — Tunify
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { forgotPassword } from '../services/index';
// import { extractErrorMessage } from '../hooks/useAuth';

const HELP_URL = 'https://help.soundcloud.com/hc/en-us/sections/46266771825691';

const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-6 w-auto sm:h-7" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase">SoundCloud</span>
  </Link>
);

const isValidEmailFormat = (val: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(prefillEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setError('The request is not valid.');
      return;
    }
    if (!isValidEmailFormat(email)) {
      setError('The request is not valid.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      // Always show success even if email isn't in DB (security best practice)
      // If you want to show backend errors, replace this with: setError(extractErrorMessage(err));
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError(null);
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

              {/* ══ CARD 1: Enter email ══ */}
              {!submitted && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Go back"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Reset password</h1>
                  </div>

                  <div className={`bg-[#2a2a2a] border rounded-sm px-4 pt-2 pb-3 mb-5 transition-colors ${error ? 'border-red-500' : 'border-[#555]'}`}>
                    <p className="text-[#aaa] text-xs mb-1">Your email address</p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendResetLink(); }}
                      placeholder="your@email.com"
                      className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#666]"
                      autoComplete="email"
                    />
                  </div>

                  <p className="text-[#ccc] text-sm leading-relaxed mb-5">
                    If the email address is in our database, we will send you an email to reset your password.{' '}
                    Need help?{' '}
                    <a href={HELP_URL} target="_blank" rel="noreferrer" className="text-[#0066cc] hover:underline">
                      Visit our Help Center
                    </a>.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-sm text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer mb-3"
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin text-black" />Sending...</>
                      : 'Send reset link'
                    }
                  </button>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                </>
              )}

              {/* ══ CARD 2: Success ══ */}
              {submitted && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setError(null); }}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Go back"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Reset password</h1>
                  </div>

                  <h2 className="text-white text-lg font-bold mb-3">
                    Check your email
                  </h2>

                  <p className="text-[#ccc] text-sm leading-relaxed mb-6">
                    We've sent instructions on how to change your password to your email address.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/signin', { state: { email, prefillStep: 'password' } })}
                    className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-sm text-sm font-semibold transition-colors cursor-pointer mb-5"
                  >
                    Back to login
                  </button>

                  <p className="text-[#ccc] text-sm leading-relaxed">
                    Did not receive the email? Check your spam folder or{' '}
                    <a href={HELP_URL} target="_blank" rel="noreferrer" className="text-[#0066cc] hover:underline">
                      visit our Help Center
                    </a>.
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
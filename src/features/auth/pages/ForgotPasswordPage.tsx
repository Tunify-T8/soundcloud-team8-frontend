// ============================================================
// FORGOT PASSWORD PAGE — Tunify
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { forgotPassword } from '../services/index';
// import { extractErrorMessage } from '../hooks/useAuth';

const HELP_URL = 'https://help.soundcloud.com/hc/en-us/sections/46266771825691';

const KNOWN_PROVIDERS: Record<string, string> = {
  gmail: 'com',
  yahoo: 'com',
  hotmail: 'com',
  outlook: 'com',
  icloud: 'com',
  live: 'com',
};

const isValidEmailFormat = (val: string): boolean => {
  const trimmed = val.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed)) return false;

  const [, domain] = trimmed.split('@');
  const parts = domain.split('.');
  const provider = parts[0];
  const tld = parts[parts.length - 1];
  if (tld.length < 2) return false;
  if (KNOWN_PROVIDERS[provider] && tld !== KNOWN_PROVIDERS[provider]) {
    return false;
  }
  return true;
};
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
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col " data-testid="forgotPasswordPage">

     <AuthNavbar />

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
                      data-testid = "backBtn"
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
                      data-testid = "inputEmail"
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
                    data-testid="sendResetLinkBtn"
                    className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-sm text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer mb-3"
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin text-black" />Sending...</>
                      : 'Send reset link'
                    }
                  </button>

                  {error && (
                    <p className="text-red-500 text-sm" data-testid="errorMsg">{error}</p>
                  )}
                </>
              )}

              {/* Success card*/}
              {submitted && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setError(null); }}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Go back"
                      data-testid = "backToFormBtn"
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
                    onClick={() => navigate('/reset-password', { state: { email } })}
                    data-testid = "resetCodeBtn"
                    className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-sm text-sm font-semibold transition-colors cursor-pointer mb-5"
                  >
                    Enter reset code
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
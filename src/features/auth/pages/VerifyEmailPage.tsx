// ============================================================
// VerifyEmailPage.tsx
// Location: src/features/auth/pages/VerifyEmailPage.tsx
// ============================================================

import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { verifyEmail, resendVerification } from '../services/index';
import { storeTokens } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';

const SoundCloudLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-6 w-auto sm:h-7" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase">SoundCloud</span>
  </Link>
);

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join('');
  const isReady = fullCode.length === 6;

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setApiError(null);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!isReady || isSubmitting) return;
    setApiError(null);
    setIsSubmitting(true);
    try {
      const res = await verifyEmail(email, fullCode);
      storeTokens(res.accessToken, res.refreshToken, 3600);
      navigate('/', { replace: true });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    setApiError(null);
    try {
      await resendVerification(email);
      setResendSuccess(true);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setIsResending(false);
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

              {/* Back button + title */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => navigate('/create-account')}
                  className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <h1 className="text-white text-base font-bold">Verify your email</h1>
              </div>

              {/* Instruction */}
              <p className="text-[#ccc] text-sm leading-relaxed mb-2">
                We sent a 6-character code to
              </p>
              <p className="text-white text-sm font-semibold mb-6 break-all">{email}</p>
              <p className="text-[#aaa] text-xs mb-6 leading-relaxed">
                Enter the code below to verify your account. The code expires after a short time.
              </p>

              {/* Error */}
              {apiError && (
                <div role="alert" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                  {apiError}
                </div>
              )}

              {/* Resend success */}
              {resendSuccess && (
                <div className="mb-4 px-4 py-3 bg-[#1a2a1a] border border-green-500/40 rounded text-green-400 text-sm">
                  A new code has been sent to your inbox.
                </div>
              )}

              {/* ── 6-box code input — fixed size, centered ── */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {code.map((char, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-10 h-10 sm:w-11 sm:h-11 text-center text-white text-base font-bold bg-[#2a2a2a] border rounded-sm focus:outline-none transition-colors uppercase flex-shrink-0 ${
                      char ? 'border-white' : 'border-[#444] focus:border-[#888]'
                    }`}
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={!isReady || isSubmitting}
                className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 mb-5 ${
                  isReady && !isSubmitting
                    ? 'bg-white hover:bg-gray-100 text-black cursor-pointer'
                    : 'bg-[#333] text-[#888] cursor-not-allowed border border-[#444]'
                }`}
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</>
                  : 'Verify email'
                }
              </button>

              {/* Resend */}
              <p className="text-[#aaa] text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-[#0066cc] hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending…' : 'Resend code'}
                </button>
              </p>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
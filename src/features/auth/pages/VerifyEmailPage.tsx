// ============================================================
// VerifyEmailPage.tsx
// ============================================================
//help this is the final version 
import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { verifyEmail, resendVerification } from '../services/index';
import { storeTokens , storeUser } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/userSlice';
import type { AppDispatch } from '../../../app/store';

const VerifyEmailPage: React.FC = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const dispatch = useDispatch<AppDispatch>();
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
      storeTokens(res.accessToken, res.refreshToken, 900);
      if (res.user) {
        const userPayload = {
          id: res.user.id,
          username: res.user.username,
          email: res.user.email,
          role: res.user.role,
          isVerified: res.user.isCertified ?? true,
          avatarUrl: res.user.avatarUrl ?? null,
        };
        storeUser(userPayload);
        dispatch(setUser(userPayload));
      }
      navigate('/', { replace: true });
    } catch (error) {
      try { await resendVerification(email); } catch { /* silent */ }
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setApiError('That code is incorrect or expired. A new code has been sent to your inbox.');
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
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col" data-testid="verify-email-page">
      <AuthNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">

          <div className="border border-[#3a3a3a] rounded-sm p-[3px] bg-[#111]">
            <div className="border border-[#555] rounded-sm bg-[#181818] min-h-[520px] p-8">

              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => navigate('/create-account')}
                  data-testid="back-btn"
                  className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <h1 className="text-white text-base font-bold">Verify your email</h1>
              </div>

              <p className="text-[#ccc] text-sm leading-relaxed mb-2">
                We sent a 6-character code to
              </p>
              <p className="text-white text-sm font-semibold mb-6 break-all">{email}</p>
              <p className="text-[#aaa] text-xs mb-6 leading-relaxed">
                Enter the code below to verify your account. The code expires after a short time.
              </p>

              {apiError && (
                <div role="alert" data-testid="api-error" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                  {apiError}
                </div>
              )}

              {resendSuccess && (
                <div data-testid="resend-success" className="mb-4 px-4 py-3 bg-[#1a2a1a] border border-green-500/40 rounded text-green-400 text-sm">
                  A new code has been sent to your inbox.
                </div>
              )}

              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {code.map((char, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    data-testid={`code-input-${i}`}
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

              <button
                type="button"
                onClick={handleVerify}
                disabled={!isReady || isSubmitting}
                data-testid="verify-btn"
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

              <p className="text-[#aaa] text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  data-testid="resend-btn"
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
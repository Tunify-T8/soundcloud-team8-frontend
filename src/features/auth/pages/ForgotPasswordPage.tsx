import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import CaptchaField from '../components/CaptchaField';
import { useCaptcha } from '../hooks/useCaptcha';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { forgotPassword, checkEmail } from '../services/index';
import { forgotPasswordSchema } from '../schemas/auth.schemas';

const HELP_URL = 'https://help.soundcloud.com/hc/en-us/sections/46266771825691';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';
  const [email, setEmail] = useState(prefillEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { honeypot, setHoneypot, isHuman, reset: resetCaptcha } = useCaptcha();

  const handleSendResetLink = async () => {
    const trimmedEmail = email.trim();

    const parseResult = forgotPasswordSchema.safeParse({ email: trimmedEmail });
    if (!parseResult.success) {
      setError('Email is not valid.');
      return;
    }

    if (!isHuman()) {
      resetCaptcha();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const checkResult = await checkEmail(trimmedEmail);
      if (!checkResult.exists) {
        setError('No account found with this email address.');
        resetCaptcha();
        return;
      }
      await forgotPassword(trimmedEmail);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.');
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError(null);
  };

  return (
    <div className="soundcloud-auth-page min-h-screen flex flex-col" data-testid="forgotPasswordPage">

      <AuthNavbar />

      <main className="flex-1 flex items-start justify-center px-4 py-14" data-testid="forgotPasswordMain">
        <div className="w-full max-w-[562px]">
          <div className="sc-auth-card rounded-sm bg-white" data-testid="forgotPasswordCard">
            <div className="px-7 py-8 sm:p-8">

              {!submitted && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Go back"
                      data-testid="backBtn"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#111]" />
                    </button>
                    <h1 className="text-[#111] text-base font-bold" data-testid="forgotPasswordTitle">Reset password</h1>
                  </div>

                  <div className="relative mb-1">
                    <div className={`bg-[#f2f2f2] border rounded-sm px-4 pt-2 pb-3 transition-colors ${error ? 'border-red-500' : 'border-[#e5e5e5] focus-within:border-[#999]'}`} data-testid="emailFieldWrapper">
                      <p className="text-[#666] text-xs mb-1">Your email address</p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendResetLink(); }}
                        placeholder="your@email.com"
                        className="w-full bg-transparent text-[#111] text-sm focus:outline-none placeholder-[#777] pr-6"
                        autoComplete="email"
                        data-testid="inputEmail"
                      />
                    </div>
                    {error && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="emailErrorIcon">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>

                  {error
                    ? <p className="text-red-500 text-xs mt-1 mb-4" data-testid="errorMsg">{error}</p>
                    : <div className="mb-5" />
                  }

                  <CaptchaField value={honeypot} onChange={setHoneypot} />

                  <p className="text-[#666] text-sm leading-relaxed mb-5" data-testid="forgotPasswordHint">
                    If the email address is in our database, we will send you an email to reset your password.{' '}
                    Need help?{' '}
                    <a href={HELP_URL} target="_blank" rel="noreferrer" className="text-[#0066cc] hover:underline" data-testid="helpCenterLink">
                      Visit our Help Center
                    </a>.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={isSubmitting}
                    data-testid="sendResetLinkBtn"
                    className="sc-auth-primary-action w-full py-3 rounded-sm text-sm font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mb-3"
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin text-white" data-testid="sendingSpinner" />Sending...</>
                      : 'Send reset link'
                    }
                  </button>
                </>
              )}

              {submitted && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label="Go back"
                      data-testid="backToFormBtn"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#111]" />
                    </button>
                    <h1 className="text-[#111] text-base font-bold" data-testid="checkEmailTitle">Reset password</h1>
                  </div>

                  <h2 className="text-[#111] text-lg font-bold mb-3" data-testid="checkEmailHeading">
                    Check your email
                  </h2>

                  <p className="text-[#666] text-sm leading-relaxed mb-6" data-testid="checkEmailInstructions">
                    We've sent instructions on how to change your password to your email address.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/reset-password', { state: { email } })}
                    data-testid="resetCodeBtn"
                    className="sc-auth-primary-action w-full py-3 rounded-sm text-sm font-semibold transition-colors cursor-pointer mb-5"
                  >
                    Enter reset code
                  </button>

                  <p className="text-[#666] text-sm leading-relaxed" data-testid="noEmailHint">
                    Did not receive the email? Check your spam folder or{' '}
                    <a href={HELP_URL} target="_blank" rel="noreferrer" className="text-[#0066cc] hover:underline" data-testid="helpCenterLink2">
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

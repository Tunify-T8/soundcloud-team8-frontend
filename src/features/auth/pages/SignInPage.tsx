// ============================================================
// SIGN IN PAGE — Tunify
// ============================================================

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronLeft, AlertCircle } from 'lucide-react';

import { signInSchema, type SignInFormData } from '../schemas/auth.schemas';
import { login, socialLogin } from '../services/index';
import { storeTokens } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';
import type { SocialProvider } from '../types/auth.types';
import { isKnownEmail } from '../data/mockUsers';

// ── Icons ──────────────────────────────────────────────────────
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface SocialButtonProps {
  provider: SocialProvider;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  hoverColor: string;
  borderColor?: string;
  onClick: (provider: SocialProvider) => void;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider, label, icon, bgColor, hoverColor, borderColor, onClick, disabled,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onClick(provider)}
    className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-sm font-medium text-sm text-white transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${bgColor} ${hoverColor} ${borderColor ? `border ${borderColor}` : ''}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-7 w-auto" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-base tracking-widest uppercase">Tunify</span>
  </Link>
);

type Step = 'social' | 'email' | 'password';

const isValidEmail = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  // ── All state resets when component mounts (i.e. every time you navigate here)
  const [step, setStep] = useState<Step>('social');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Reset everything when navigating away and back
  useEffect(() => {
    return () => {
      setStep('social');
      setEmailInput('');
      setEmailError(null);
      setApiError(null);
      setShowPassword(false);
      reset();
    };
  }, []);

  const handleEmailFocus = () => {
    if (step === 'social') setStep('email');
  };

  const handleBack = () => {
    setApiError(null);
    setEmailError(null);
    if (step === 'email') { setStep('social'); setEmailInput(''); }
    if (step === 'password') { setStep('email'); }
  };

  const handleEmailContinue = async () => {
    const email = emailInput.trim();

    // Validate format first
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address or profile url.');
      return;
    }

    setEmailError(null);
    setIsCheckingEmail(true);
    await new Promise((r) => setTimeout(r, 400));

    if (!isKnownEmail(email)) {
      navigate('/create-account', { state: { email } });
      return;
    }

    setValue('email', email);
    setStep('password');
    setIsCheckingEmail(false);
  };

  const onSubmit = async (data: SignInFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const res = await login(data);
      storeTokens(res.accessToken, res.refreshToken, res.expiresIn);
      navigate(from, { replace: true });
    } catch (error) {
      const msg = extractErrorMessage(error);
      if (msg.includes('No account') || msg.includes('not found')) {
        navigate('/create-account', { state: { email: data.email } });
      } else {
        setApiError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setApiError(null);
    setSocialLoading(provider);
    try {
      const res = await socialLogin({ provider, providerToken: 'mock_oauth_token' });
      storeTokens(res.accessToken, res.refreshToken, res.expiresIn);
      navigate(from, { replace: true });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setSocialLoading(null);
    }
  };

  const isSocialDisabled = socialLoading !== null || isSubmitting || isCheckingEmail;

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 bg-[#0d0d0d] border-b border-[#222]">
        <TunifyLogo />
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white text-sm font-medium hover:text-white/80">Home</Link>
          <Link to="/stream" className="text-white/60 text-sm hover:text-white">Feed</Link>
          <Link to="/discover" className="text-white/60 text-sm hover:text-white">Library</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-white text-sm font-medium hover:text-white/80">Sign in</Link>
          <Link to="/create-account" className="border border-white text-white text-sm font-medium px-5 py-1.5 rounded-full hover:bg-white hover:text-black transition-all">
            Create account
          </Link>
          <button className="text-white/60 text-lg hover:text-white">···</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">
          <div className="border border-[#3a3a3a] rounded-sm p-[3px] bg-[#111]">
            <div className="border border-[#555] rounded-sm bg-[#181818] min-h-[520px]">

              {/* ══ STEP: social ══ */}
              {step === 'social' && (
                <div className="p-8 flex flex-col gap-3">
                  <h1 className="text-white text-xl font-bold mb-1 text-center">Sign in or create an account</h1>
                  <p className="text-[#999] text-xs mb-2 leading-relaxed text-center">
                    By clicking "Continue" you agree to Tunify's{' '}
                    <a href="#" className="text-[#0066cc] hover:underline">Terms of Use</a>{' '}
                    and acknowledge our{' '}
                    <a href="#" className="text-[#0066cc] hover:underline">Privacy Policy</a>.
                  </p>
                  <SocialButton provider="facebook" label="Continue with Facebook" icon={<FacebookIcon />} bgColor="bg-[#1877f2]" hoverColor="hover:bg-[#1565d8]" onClick={handleSocialLogin} disabled={isSocialDisabled} />
                  <SocialButton provider="google" label="Continue with Google" icon={<GoogleIcon />} bgColor="bg-[#3c3c3c]" hoverColor="hover:bg-[#4a4a4a]" onClick={handleSocialLogin} disabled={isSocialDisabled} />
                  <SocialButton provider="apple" label="Continue with Apple" icon={<AppleIcon />} bgColor="bg-black" hoverColor="hover:bg-[#1a1a1a]" borderColor="border-[#555]" onClick={handleSocialLogin} disabled={isSocialDisabled} />
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#444]" />
                    <span className="text-white text-sm font-semibold whitespace-nowrap">Or with email</span>
                    <div className="flex-1 h-px bg-[#444]" />
                  </div>
                  <input
                    ref={emailRef}
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onFocus={handleEmailFocus}
                    placeholder="Your email address or profile URL"
                    className="w-full bg-[#2a2a2a] border border-[#444] rounded-sm px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#888] transition-colors"
                    autoComplete="email"
                  />
                  <button type="button" onClick={handleEmailContinue}
                    disabled={!emailInput.trim() || isSocialDisabled}
                    className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-3 rounded-sm text-sm font-medium border border-[#555] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    Continue
                  </button>
                  <div className="text-center">
                    <Link to="/forgot-password" className="text-[#0066cc] text-sm hover:underline">Need help?</Link>
                  </div>
                </div>
              )}

              {/* ══ STEP: email (focused) ══ */}
              {step === 'email' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button type="button" onClick={handleBack}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Sign in or create an account</h1>
                  </div>

                  {/* Email input with error state */}
                  <div className="relative mb-1">
                    <input
                      autoFocus
                      type="text"
                      value={emailInput}
                      onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEmailContinue(); }}
                      placeholder="Your email address or profile URL"
                      className={`w-full bg-[#2a2a2a] border rounded-sm px-4 py-3 pr-10 text-white text-sm placeholder-[#666] focus:outline-none transition-colors ${emailError ? 'border-red-500 focus:border-red-500' : 'border-[#555] focus:border-[#888]'}`}
                      autoComplete="email"
                    />
                    {emailError && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-xs mb-3 mt-1">{emailError}</p>
                  )}
                  {!emailError && <div className="mb-4" />}

                  <button type="button" onClick={handleEmailContinue}
                    disabled={!emailInput.trim() || isCheckingEmail}
                    className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-3 rounded-sm text-sm font-medium border border-[#555] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mb-4"
                  >
                    {isCheckingEmail ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : 'Continue'}
                  </button>

                  <Link to="/forgot-password" className="text-[#0066cc] text-sm hover:underline">Need help?</Link>
                </div>
              )}

              {/* ══ STEP: password ══ */}
              {step === 'password' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button type="button" onClick={handleBack}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Welcome back!</h1>
                  </div>

                  {apiError && (
                    <div role="alert" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                      {apiError}
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-[#aaa] text-xs mb-1">Your email address or profile URL</p>
                    <p className="text-white text-sm font-medium">{emailInput}</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <input type="hidden" {...register('email')} value={emailInput} />
                    <div className="relative mb-4">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Your password"
                        className={`w-full bg-[#2a2a2a] border rounded-sm px-4 py-3 pr-10 text-white text-sm focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-[#444] focus:border-[#888]'}`}
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs -mt-3 mb-3">{errors.password.message}</p>
                    )}
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-sm text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mb-4"
                    >
                      {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin text-black" />Signing in…</> : 'Continue'}
                    </button>
                    <Link to="/forgot-password" className="text-[#0066cc] text-sm hover:underline">Forgot your password?</Link>
                  </form>
                </div>
              )}

            </div>
          </div>
          <p className="text-center text-[#777] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/create-account" className="text-white hover:underline font-medium">Create one for free</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
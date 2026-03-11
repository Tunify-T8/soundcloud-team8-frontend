// ============================================================
// SIGN IN PAGE — mirrors SoundCloud's /signin exactly
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { signInSchema, type SignInFormData } from '../schemas/auth.schemas';
import { login } from '../services';
import { storeTokens } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';
import type { SocialProvider } from '../types/auth.types';
import { socialLogin } from '../services';

// ── SoundCloud SVG Logo ───────────────────────────────────────

const SoundCloudLogo: React.FC = () => (
  <svg
    viewBox="0 0 120 18"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-auto"
    aria-label="SoundCloud"
  >
    <text
      x="0"
      y="14"
      fontFamily="'Helvetica Neue', Arial, sans-serif"
      fontSize="14"
      fontWeight="bold"
      fill="white"
      letterSpacing="0.5"
    >
      soundcloud
    </text>
  </svg>
);

// ── Social Button component ───────────────────────────────────

interface SocialButtonProps {
  provider: SocialProvider;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  borderColor?: string;
  onClick: (provider: SocialProvider) => void;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  label,
  icon,
  bgColor,
  hoverColor,
  textColor,
  borderColor,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onClick(provider)}
    className={`
      w-full flex items-center justify-center gap-3
      px-4 py-3 rounded-sm font-medium text-sm
      transition-colors duration-150 cursor-pointer
      disabled:opacity-60 disabled:cursor-not-allowed
      ${bgColor} ${hoverColor} ${textColor}
      ${borderColor ? `border ${borderColor}` : ''}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ── Google Icon ───────────────────────────────────────────────

const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ── Apple Icon ────────────────────────────────────────────────

const AppleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

// ── Facebook Icon ─────────────────────────────────────────────

const FacebookIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ── Main SignInPage ───────────────────────────────────────────

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login (saved by ProtectedRoute)
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const [step, setStep] = useState<'social' | 'email'>('social');
  const [emailInput, setEmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  // Focus the email input when switching to password step
  useEffect(() => {
    if (step === 'email') {
      setTimeout(() => emailRef.current?.focus(), 50);
    }
  }, [step]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // ── Handle Continue (email step) ─────────────────────────────

  const handleEmailContinue = () => {
    if (!emailInput.trim()) return;
    setValue('email', emailInput);
    setStep('email');
    setApiError(null);
  };

  // ── Handle form submit ────────────────────────────────────────

  const onSubmit = async (data: SignInFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const res = await login(data);
      storeTokens(res.accessToken, res.refreshToken, res.expiresIn);
      navigate(from, { replace: true });
    } catch (error) {
      const message = extractErrorMessage(error);
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle social login ───────────────────────────────────────

  const handleSocialLogin = async (provider: SocialProvider) => {
    setApiError(null);
    setSocialLoading(provider);
    try {
      // In a real app, this would open a popup/redirect to the OAuth provider.
      // For now, we simulate with a mock provider token.
      const res = await socialLogin({ provider, providerToken: 'mock_oauth_token' });
      storeTokens(res.accessToken, res.refreshToken, res.expiresIn);
      navigate(from, { replace: true });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setSocialLoading(null);
    }
  };

  const isSocialDisabled = socialLoading !== null || isSubmitting;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0d0d0d] border-b border-[#2a2a2a]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white no-underline">
          {/* SoundCloud waveform icon */}
          <svg viewBox="0 0 33 15" className="h-6 w-auto fill-[#f50]" aria-hidden="true">
            <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
          </svg>
          <span className="text-white font-bold text-lg tracking-wide uppercase">
            SoundCloud
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-[#999] hover:text-white text-sm transition-colors">Home</Link>
          <Link to="/stream" className="text-[#999] hover:text-white text-sm transition-colors">Feed</Link>
          <Link to="/discover" className="text-[#999] hover:text-white text-sm transition-colors">Discover</Link>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-white text-sm hover:text-[#f50] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/create-account"
            className="bg-transparent border border-white text-white text-sm px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            Create account
          </Link>
          <button className="text-[#999] text-xl leading-none">···</button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">

          {/* Card */}
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-md p-8">

            <h1 className="text-white text-2xl font-bold mb-3 leading-tight">
              Sign in or create<br />an account
            </h1>

            <p className="text-[#999] text-sm mb-6 leading-relaxed">
              By clicking on any of the "Continue" buttons below, you agree to SoundCloud's{' '}
              <a href="#" className="text-[#0066cc] hover:underline">Terms of Use</a>{' '}
              and acknowledge our{' '}
              <a href="#" className="text-[#0066cc] hover:underline">Privacy Policy</a>.
            </p>

            {/* API error banner */}
            {apiError && (
              <div
                role="alert"
                className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-[#f50]/40 rounded text-[#ff6b35] text-sm"
              >
                {apiError}
              </div>
            )}

            {step === 'social' ? (
              /* ── Step 1: Social login options + email input ── */
              <div className="flex flex-col gap-3">

                {/* Facebook */}
                <SocialButton
                  provider="facebook"
                  label={socialLoading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
                  icon={socialLoading === 'facebook'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FacebookIcon />
                  }
                  bgColor="bg-[#1877f2]"
                  hoverColor="hover:bg-[#1565d8]"
                  textColor="text-white"
                  onClick={handleSocialLogin}
                  disabled={isSocialDisabled}
                />

                {/* Google */}
                <SocialButton
                  provider="google"
                  label={socialLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
                  icon={socialLoading === 'google'
                    ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                    : <GoogleIcon />
                  }
                  bgColor="bg-[#3c3c3c]"
                  hoverColor="hover:bg-[#4a4a4a]"
                  textColor="text-white"
                  onClick={handleSocialLogin}
                  disabled={isSocialDisabled}
                />

                {/* Apple */}
                <SocialButton
                  provider="apple"
                  label={socialLoading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
                  icon={socialLoading === 'apple'
                    ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                    : <AppleIcon />
                  }
                  bgColor="bg-black"
                  hoverColor="hover:bg-[#1a1a1a]"
                  textColor="text-white"
                  borderColor="border-[#555]"
                  onClick={handleSocialLogin}
                  disabled={isSocialDisabled}
                />

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-[#333]" />
                  <span className="text-[#777] text-xs">Or with email</span>
                  <div className="flex-1 h-px bg-[#333]" />
                </div>

                {/* Email input */}
                <div>
                  <input
                    ref={emailRef}
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEmailContinue();
                    }}
                    placeholder="Your email address or profile URL"
                    className="
                      w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-sm
                      px-4 py-3 text-white text-sm placeholder-[#666]
                      focus:outline-none focus:border-[#999] transition-colors
                    "
                    autoComplete="email"
                    aria-label="Email address"
                  />
                </div>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleEmailContinue}
                  disabled={!emailInput.trim() || isSocialDisabled}
                  className="
                    w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white
                    py-3 rounded-sm text-sm font-medium transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                  "
                >
                  Continue
                </button>

                {/* Need help */}
                <div className="text-center mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-[#0066cc] text-sm hover:underline"
                  >
                    Need help?
                  </Link>
                </div>
              </div>
            ) : (
              /* ── Step 2: Email + password form ─────────────── */
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col gap-4">

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[#ccc] text-xs mb-1.5 font-medium"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      defaultValue={emailInput}
                      {...register('email')}
                      className="
                        w-full bg-[#2a2a2a] border rounded-sm
                        px-4 py-3 text-white text-sm placeholder-[#666]
                        focus:outline-none transition-colors
                        ${errors.email
                          ? 'border-red-500 focus:border-red-400'
                          : 'border-[#3a3a3a] focus:border-[#999]'
                        }
                      "
                      autoComplete="email"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" role="alert" className="text-red-400 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="text-[#ccc] text-xs font-medium"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-[#0066cc] text-xs hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className={`
                          w-full bg-[#2a2a2a] border rounded-sm
                          px-4 py-3 pr-10 text-white text-sm placeholder-[#666]
                          focus:outline-none transition-colors
                          ${errors.password
                            ? 'border-red-500 focus:border-red-400'
                            : 'border-[#3a3a3a] focus:border-[#999]'
                          }
                        `}
                        placeholder="Your password"
                        autoComplete="current-password"
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" role="alert" className="text-red-400 text-xs mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      w-full bg-[#f50] hover:bg-[#e04500] text-white
                      py-3 rounded-sm text-sm font-medium transition-colors
                      disabled:opacity-60 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2 cursor-pointer
                    "
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  {/* Back to social options */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('social');
                      setApiError(null);
                    }}
                    className="text-[#777] hover:text-white text-sm text-center transition-colors cursor-pointer"
                  >
                    ← Other sign-in options
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Below card: create account link */}
          <p className="text-center text-[#777] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/create-account" className="text-[#f50] hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;

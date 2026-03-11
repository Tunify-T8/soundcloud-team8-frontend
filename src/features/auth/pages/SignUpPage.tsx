// ============================================================
// SIGN UP PAGE — Tunify
// ============================================================

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';

import { signUpSchema, type SignUpFormData } from '../schemas/auth.schemas';
import { register as registerUser } from '../services';
import { storeTokens } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';

const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-7 w-auto" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-base tracking-widest uppercase">Tunify</span>
  </Link>
);

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: prefillEmail,
      agreeToTerms: false,
    },
  });

  // Watch the password field live to enable/disable the button
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const isPasswordReady = (passwordValue ?? '').length >= 8;

  // Clear everything on unmount (navigating away)
  useEffect(() => {
    return () => { reset(); };
  }, []);

  const onSubmit = async (data: SignUpFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const res = await registerUser({
        username: data.username ?? data.email.split('@')[0],
        email: data.email,
        password: data.password,
      });
      storeTokens(res.accessToken, res.refreshToken, 3600);
      navigate('/confirm-email');
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="border border-[#555] rounded-sm bg-[#181818] min-h-[520px] p-8">

              <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => navigate('/signin')}
                  className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <h1 className="text-white text-base font-bold">Create an account</h1>
              </div>

              {apiError && (
                <div role="alert" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

                {/* Email — read-only text if pre-filled, editable if not */}
                {prefillEmail ? (
                  <div>
                    <p className="text-[#aaa] text-xs mb-1">Your email address</p>
                    <p className="text-white text-sm font-medium">{prefillEmail}</p>
                    <input type="hidden" {...register('email')} value={prefillEmail} />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="email" className="block text-[#aaa] text-xs mb-1.5">Your email address</label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="you@example.com"
                      className={`w-full bg-[#2a2a2a] border rounded-sm px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-[#444] focus:border-[#888]'}`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                )}

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Choose a password (min. 8 characters)"
                    className={`w-full bg-[#2a2a2a] border rounded-sm px-4 py-3 pr-10 text-white text-sm placeholder-[#666] focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-[#444] focus:border-[#888]'}`}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs -mt-3">{errors.password.message}</p>}

                {/* Hidden fields */}
                <input type="hidden" {...register('username')} value={prefillEmail.split('@')[0] || 'user'} />
                <input type="hidden" {...register('confirmPassword')} value={passwordValue ?? ''} />
                <input type="hidden" {...register('agreeToTerms')} value="true" />

                {/* Continue button — disabled + dark until 8 chars, white when ready */}
                <button
                  type="submit"
                  disabled={!isPasswordReady || isSubmitting}
                  className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isPasswordReady
                      ? 'bg-white hover:bg-gray-100 text-black'
                      : 'bg-[#333] text-[#888] cursor-not-allowed border border-[#444]'
                  }`}
                >
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                    : 'Continue'
                  }
                </button>

                <Link to="/forgot-password" className="text-[#0066cc] text-sm hover:underline">Need help?</Link>
              </form>
            </div>
          </div>

          <p className="text-center text-[#777] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-white hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
// ============================================================
// SIGN UP PAGE — Tunify
// Responsive + Tell us more about you step
// ============================================================

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';

import { signUpSchema, type SignUpFormData } from '../schemas/auth.schemas';
import { register as registerUser } from '../services';
import { storeTokens } from '../utils/token.utils';
import { extractErrorMessage } from '../hooks/useAuth';
import { isDisplayNameTaken } from '../data/mockUsers';

const TunifyLogo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <svg viewBox="0 0 33 15" className="h-6 w-auto sm:h-7" fill="white" aria-hidden="true">
      <path d="M0 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5S0 5.2 0 6v5.5zm4.5 1.5c.8 0 1.5-.7 1.5-1.5V3.5C6 2.7 5.3 2 4.5 2S3 2.7 3 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V1.5C10.5.7 9.8 0 9 0S7.5.7 7.5 1.5V11.5C7.5 12.3 8.2 13 9 13zm4.5 0c.8 0 1.5-.7 1.5-1.5V3.5C15 2.7 14.3 2 13.5 2S12 2.7 12 3.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C19.5 1.7 18.8 1 18 1s-1.5.7-1.5 1.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C24 3.7 23.3 3 22.5 3S21 3.7 21 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V4.5C27 3.7 26.3 3 25.5 3S24 3.7 24 4.5V11.5c0 .8.7 1.5 1.5 1.5zm4.5 0c.8 0 1.5-.7 1.5-1.5V2.5C33 1.7 32.3 1 31.5 1S30 1.7 30 2.5V11.5c0 .8.7 1.5 1.5 1.5z" />
    </svg>
    <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase">SoundCloud</span>
  </Link>
);

// ── Date of birth constants ──
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);

type SignUpStep = 'password' | 'profile';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';

  // ── password step state ──
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  // ── profile step state ──
  const defaultDisplayName = prefillEmail.split('@')[0] ?? '';
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState('');

  const isPasswordReady =
  passwordValue.length >= 8 &&
  /[A-Z]/.test(passwordValue) &&
  /[a-z]/.test(passwordValue) &&
  /[0-9]/.test(passwordValue) &&
  /[^A-Za-z0-9]/.test(passwordValue);
  const isProfileReady =
    displayName.trim().length > 0 &&
    !displayNameError &&
    dobMonth !== '' &&
    dobDay !== '' &&
    dobYear !== '' &&
    gender !== '';

  const { register, formState: { errors }, reset } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: prefillEmail, agreeToTerms: false },
  });

  useEffect(() => {
    return () => { reset(); };
  }, []);

  const handleDisplayNameChange = (val: string) => {
    setDisplayName(val);
    if (val.trim().length === 0) {
      setDisplayNameError('Display name is required');
    } else if (isDisplayNameTaken(val.trim()) && val.trim().toLowerCase() !== defaultDisplayName.toLowerCase()) {
      setDisplayNameError('This display name is already taken');
    } else {
      setDisplayNameError(null);
    }
  };

  const handlePasswordContinue = () => {
    if (!isPasswordReady) return;
    setSignUpStep('profile');
  };

const handleProfileContinue = async () => {
  if (!isProfileReady) return;
  setApiError(null);
  setIsSubmitting(true);
  try {
    const month = dobMonth.padStart(2, '0');
    const day = dobDay.padStart(2, '0');
    const isoDate = `${dobYear}-${month}-${day}`;

    await registerUser({
      username: displayName,
      email: prefillEmail,
      password: passwordValue,
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
      date_of_birth: isoDate,
    });

    navigate('/verify-email', { state: { email: prefillEmail } });
  } catch (error) {
    setApiError(extractErrorMessage(error));
  } finally {
    setIsSubmitting(false);
  }
};

  const selectClass = "w-full bg-white text-black text-sm px-3 py-3 rounded-sm border border-[#555] focus:outline-none focus:border-[#888] appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">

      {/* ── Responsive Navbar ── */}
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

      <main className="flex-1 flex items-start sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-10">
        <div className="w-full sm:max-w-[480px]">

          <div className="sm:border sm:border-[#3a3a3a] sm:rounded-sm sm:p-[3px] sm:bg-[#111]">
            <div className="sm:border sm:border-[#555] sm:rounded-sm bg-[#181818] sm:min-h-[520px]">

              {/* ══ PASSWORD STEP ══ */}
              {signUpStep === 'password' && (
                <div className="px-6 py-8 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate('/signin')}
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

                  {prefillEmail ? (
                    <div className="mb-4">
                      <p className="text-[#aaa] text-xs mb-1">Your email address</p>
                      <p className="text-white text-sm font-medium">{prefillEmail}</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-[#aaa] text-xs mb-1.5">Your email address</label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="you@example.com"
                        className={`w-full bg-[#2a2a2a] border rounded-sm px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-[#444] focus:border-[#888]'}`}
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  )}

                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="Choose a password (min. 8 characters)"
                      className="w-full bg-[#2a2a2a] border border-[#444] rounded-sm px-4 py-3 pr-10 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#888] transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password rules checklist — shows when user starts typing */}
                  {passwordValue.length > 0 && (
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-sm px-4 py-3 flex flex-col gap-1.5">
                      {[
                        { label: 'At least 8 characters', met: passwordValue.length >= 8 },
                        { label: 'At least one uppercase letter', met: /[A-Z]/.test(passwordValue) },
                        { label: 'At least one lowercase letter', met: /[a-z]/.test(passwordValue) },
                        { label: 'At least one number', met: /[0-9]/.test(passwordValue) },
                        { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
                      ].map((rule) => (
                        <div key={rule.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${rule.met ? 'bg-green-500' : 'bg-[#444]'}`}>
                            {rule.met && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs ${rule.met ? 'text-green-400' : 'text-[#888]'}`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePasswordContinue}
                    disabled={!isPasswordReady}
                    className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 mb-4 ${
                      isPasswordReady
                        ? 'bg-white hover:bg-gray-100 text-black cursor-pointer'
                        : 'bg-[#333] text-[#888] cursor-not-allowed border border-[#444]'
                    }`}
                  >
                    Continue
                  </button>
                    <a href="https://help.soundcloud.com/hc/en-us/sections/46266771825691" target="_blank" rel="noreferrer" className="text-[#0066cc] text-sm hover:underline">Need help?</a>
                </div>
              )}

              {/* ══ PROFILE STEP — Tell us more about you ══ */}
              {signUpStep === 'profile' && (
                <div className="px-6 py-8 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => { setSignUpStep('password'); setApiError(null); }}
                      className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="text-white text-base font-bold">Tell us more about you</h1>
                  </div>

                  {apiError && (
                    <div role="alert" className="mb-4 px-4 py-3 bg-[#2a1a1a] border border-red-500/40 rounded text-red-400 text-sm">
                      {apiError}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">

                    {/* Display name */}
                    <div>
                      <div className={`bg-[#2a2a2a] border rounded-sm px-4 pt-2 pb-2 ${displayNameError ? 'border-red-500' : 'border-[#555] focus-within:border-[#888]'} transition-colors`}>
                        <label className="block text-[#aaa] text-xs mb-0.5">Display name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => handleDisplayNameChange(e.target.value)}
                          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#666]"
                          placeholder="Your display name"
                        />
                      </div>
                      {displayNameError
                        ? <p className="text-red-400 text-xs mt-1">{displayNameError}</p>
                        : <p className="text-[#777] text-xs mt-1">Your display name can be anything you like. Your name or artist name are good choices.</p>
                      }
                    </div>

                    {/* Date of birth */}
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Date of birth <span className="text-[#aaa] font-normal">(required)</span></p>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Month */}
                        <div className="relative">
                          <select
                            value={dobMonth}
                            onChange={(e) => setDobMonth(e.target.value)}
                            className={selectClass}
                          >
                            <option value="" disabled>Month</option>
                            {MONTHS.map((m, i) => (
                              <option key={m} value={String(i + 1)}>{m}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black text-xs">▼</div>
                        </div>
                        {/* Day */}
                        <div className="relative">
                          <select
                            value={dobDay}
                            onChange={(e) => setDobDay(e.target.value)}
                            className={selectClass}
                          >
                            <option value="" disabled>Day</option>
                            {DAYS.map((d) => (
                              <option key={d} value={String(d)}>{d}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black text-xs">▼</div>
                        </div>
                        {/* Year */}
                        <div className="relative">
                          <select
                            value={dobYear}
                            onChange={(e) => setDobYear(e.target.value)}
                            className={selectClass}
                          >
                            <option value="" disabled>Year</option>
                            {YEARS.map((y) => (
                              <option key={y} value={String(y)}>{y}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black text-xs">▼</div>
                        </div>
                      </div>
                      <p className="text-[#777] text-xs mt-1">Your date of birth is used to verify your age and is not shared publicly.</p>
                    </div>

                    {/* Gender */}
                    <div>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className={`w-full bg-[#2a2a2a] border text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors appearance-none cursor-pointer ${gender === '' ? 'text-[#666] border-[#555]' : 'text-white border-[#555]'} focus:border-[#888]`}
                        >
                          <option value="" disabled>Gender (required)</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777] text-xs">▼</div>
                      </div>
                    </div>

                    {/* Continue button */}
                    <button
                      type="button"
                      onClick={handleProfileContinue}
                      disabled={!isProfileReady || isSubmitting}
                      className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isProfileReady && !isSubmitting
                          ? 'bg-white hover:bg-gray-100 text-black cursor-pointer'
                          : 'bg-[#333] text-[#888] cursor-not-allowed border border-[#444]'
                      }`}
                    >
                      {isSubmitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                        : 'Continue'
                      }
                    </button>
                      <a href="https://help.soundcloud.com/hc/en-us/sections/46266771825691" target="_blank" rel="noreferrer" className="text-[#0066cc] text-sm hover:underline">Need help?</a>
                  </div>
                </div>
              )}

            </div>
          </div>

          <p className="hidden sm:block text-center text-[#777] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-white hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;

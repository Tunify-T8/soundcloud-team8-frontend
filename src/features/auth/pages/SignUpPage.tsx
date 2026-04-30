import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';

import { signUpSchema, type SignUpFormData } from '../schemas/auth.schemas';
import { register as registerUser, checkEmail } from '../services';
import { extractErrorMessage } from '../hooks/useAuth';
import { isDisplayNameTaken } from '../data/mockUsers';


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

  const [signUpStep, setSignUpStep] = useState<SignUpStep>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

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

  const { register, formState: { errors }, reset, getValues } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: prefillEmail, agreeToTerms: false },
  });

  useEffect(() => {
    return () => { reset(); };
  }, []);
  useEffect(() => {
  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) window.location.reload();
  };
  window.addEventListener('pageshow', handlePageShow);
  return () => window.removeEventListener('pageshow', handlePageShow);
}, []);

  const handleDisplayNameChange = (val: string) => {
    setDisplayName(val);
    if (val.trim().length === 0) {
      setDisplayNameError('Display name is required');
    } else if (/[^a-zA-Z0-9_]/.test(val.trim())) {
      setDisplayNameError('Username can only contain letters, numbers, and underscores');
    } else if (isDisplayNameTaken(val.trim()) && val.trim().toLowerCase() !== defaultDisplayName.toLowerCase()) {
      setDisplayNameError('This display name is already taken');
    } else {
      setDisplayNameError(null);
    }
  };

  const handlePasswordContinue = async () => {
    if (!isPasswordReady) return;
    setApiError(null);
    setIsSubmitting(true);
    try {
      const emailToCheck = prefillEmail || getValues('email');
      if (emailToCheck) {
        const result = await checkEmail(emailToCheck.trim());
        if (result.exists) {
          navigate('/signin', { state: { email: emailToCheck.trim(), prefillStep: 'password' } });
          return;
        }
      }
      setSignUpStep('profile');
    } catch {
      setSignUpStep('profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileContinue = async () => {
    if (!isProfileReady) return;
    setApiError(null);
    setIsSubmitting(true);
    try {
      const month = dobMonth.padStart(2, '0');
      const day = dobDay.padStart(2, '0');
      const isoDate = `${dobYear}-${month}-${day}`;

      const emailToUse = prefillEmail || getValues('email');

      await registerUser({
        username: displayName,
        email: emailToUse,
        password: passwordValue,
        gender: gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
        date_of_birth: isoDate,
      });

      navigate('/verify-email', { state: { email: emailToUse } });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = "w-full bg-[#f2f2f2] text-[#111] text-sm px-3 py-3 rounded-sm border border-[#e5e5e5] focus:outline-none focus:border-[#999] appearance-none cursor-pointer";

  return (
    <div className="soundcloud-auth-page min-h-screen flex flex-col" data-testid="signup-page">

      <AuthNavbar />

      <main className="flex-1 flex items-start justify-center px-4 py-14">
        <div className="w-full max-w-[562px]">
          <div className="sc-auth-card rounded-sm bg-white">

              {signUpStep === 'password' && (
                <div className="px-7 py-8 sm:p-8" data-testid="password-step">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate('/signin')}
                      data-testid="back-btn"
                      className="w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#111]" />
                    </button>
                    <h1 className="text-[#111] text-base font-bold">Create an account</h1>
                  </div>

                  {apiError && (
                    <div role="alert" data-testid="api-error" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {apiError}
                    </div>
                  )}

                  {prefillEmail ? (
                    <div className="mb-4">
                      <p className="text-[#666] text-xs mb-1">Your email address</p>
                      <p className="text-[#111] text-sm font-medium" data-testid="email-display">{prefillEmail}</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-[#666] text-xs mb-1.5">Your email address</label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="you@example.com"
                        data-testid="email-input"
                        className={`w-full bg-[#f2f2f2] border rounded-sm px-4 py-3 text-[#111] text-sm placeholder-[#777] focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-[#e5e5e5] focus:border-[#999]'}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1" data-testid="email-error">{errors.email.message}</p>}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="Choose a password (min. 8 characters)"
                      data-testid="password-input"
                      className="w-full bg-[#f2f2f2] border border-[#e5e5e5] rounded-sm px-4 py-3 pr-10 text-[#111] text-sm placeholder-[#777] focus:outline-none focus:border-[#999] transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      data-testid="toggle-password-btn"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#111]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {passwordValue.length > 0 && (
                    <div data-testid="password-rules" className="bg-[#f7f7f7] border border-[#d7d7d7] rounded-sm px-4 py-3 flex flex-col gap-1.5">
                      {[
                        { label: 'At least 8 characters', met: passwordValue.length >= 8 },
                        { label: 'At least one uppercase letter', met: /[A-Z]/.test(passwordValue) },
                        { label: 'At least one lowercase letter', met: /[a-z]/.test(passwordValue) },
                        { label: 'At least one number', met: /[0-9]/.test(passwordValue) },
                        { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
                      ].map((rule) => (
                        <div key={rule.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${rule.met ? 'bg-green-500' : 'bg-[#d7d7d7]'}`}>
                            {rule.met && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs ${rule.met ? 'text-green-600' : 'text-[#777]'}`}>
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
                    data-testid="password-continue-btn"
                    className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 mb-4 ${
                      isPasswordReady
                        ? 'sc-auth-primary-action cursor-pointer'
                        : 'sc-auth-primary-action cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                  <a href="https://help.soundcloud.com/hc/en-us/sections/46266771825691" target="_blank" rel="noreferrer" className="text-[#0066cc] text-sm hover:underline">Need help?</a>
                </div>
              )}

              {signUpStep === 'profile' && (
                <div className="px-7 py-8 sm:p-8" data-testid="profile-step">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => { setSignUpStep('password'); setApiError(null); }}
                      data-testid="profile-back-btn"
                      className="w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#111]" />
                    </button>
                    <h1 className="text-[#111] text-base font-bold">Tell us more about you</h1>
                  </div>

                  {apiError && (
                    <div role="alert" data-testid="api-error" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {apiError}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">

                    <div>
                      <div className={`bg-[#f2f2f2] border rounded-sm px-4 pt-2 pb-2 ${displayNameError ? 'border-red-500' : 'border-[#e5e5e5] focus-within:border-[#999]'} transition-colors`}>
                        <label className="block text-[#666] text-xs mb-0.5">Display name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => handleDisplayNameChange(e.target.value)}
                          data-testid="display-name-input"
                          className="w-full bg-transparent text-[#111] text-sm focus:outline-none placeholder-[#777]"
                          placeholder="Your display name"
                        />
                      </div>
                      {displayNameError
                        ? <p className="text-red-500 text-xs mt-1" data-testid="display-name-error">{displayNameError}</p>
                        : <p className="text-[#777] text-xs mt-1">Letters, numbers, and underscores only.</p>
                      }
                    </div>

                    <div>
                      <p className="text-[#111] text-sm font-medium mb-2">Date of birth <span className="text-[#666] font-normal">(required)</span></p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} data-testid="dob-month-select" className={selectClass}>                            <option value="" disabled>Month</option>
                            {MONTHS.map((m, i) => (
                              <option key={m} value={String(i + 1)}>{m}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black text-xs">▼</div>
                        </div>
                        <div className="relative">
                          <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} data-testid="dob-day-select" className={selectClass}>
                            <option value="" disabled>Day</option>
                            {DAYS.map((d) => (
                              <option key={d} value={String(d)}>{d}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black text-xs">▼</div>
                        </div>
                        <div className="relative">
                          <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} data-testid="dob-year-select" className={selectClass}>
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
                          data-testid="gender-select"
                          className={`w-full bg-[#f2f2f2] border text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors appearance-none cursor-pointer ${gender === '' ? 'text-[#777] border-[#e5e5e5]' : 'text-[#111] border-[#e5e5e5]'} focus:border-[#999]`}
                        >
                          <option value="" disabled>Gender (required)</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777] text-xs">▼</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProfileContinue}
                      disabled={!isProfileReady || isSubmitting}
                      data-testid="profile-continue-btn"
                      className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isProfileReady && !isSubmitting
                          ? 'sc-auth-primary-action cursor-pointer'
                          : 'sc-auth-primary-action cursor-not-allowed'
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

          <p className="hidden sm:block text-center text-[#777] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#111] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;

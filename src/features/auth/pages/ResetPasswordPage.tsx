import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { ChevronLeft, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { resetPassword } from '../services/index';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(emailFromState);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isPasswordReady =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  const hasAllFields =
    email.trim().length > 0 &&
    token.trim().length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;

  const handleSave = async () => {
    setApiError(null);
    setEmailError(null);
    setTokenError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (token.trim().length !== 6) {
      setTokenError('Please enter the 6-character code from your email.');
      return;
    }
    if (!isPasswordReady || newPassword !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim(), token.trim().toUpperCase(), newPassword, confirmPassword, true);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setApiError(msg[0]);
      } else if (typeof msg === 'string') {
        if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
          setApiError('The reset code is incorrect or has expired. Please request a new one.');
        } else if (msg.toLowerCase().includes('email')) {
          setApiError('No account found with that email address.');
        } else {
          setApiError(msg);
        }
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="soundcloud-auth-page min-h-screen flex flex-col" data-testid="resetPasswordPage">

      <AuthNavbar />

      <main className="flex-1 flex items-start justify-center px-4 py-14">
        <div className="w-full max-w-[562px]">
          <div className="sc-auth-card rounded-sm bg-white">
            <div className="px-7 py-8 sm:p-8">

              {!submitted ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      data-testid="backBtn"
                      className="w-9 h-9 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5 text-[#111]" />
                    </button>
                    <h1 className="text-[#111] text-base font-bold">Reset your password</h1>
                  </div>

                  {apiError && (
                    <div role="alert" data-testid="errorAlert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {apiError}
                    </div>
                  )}

                  <div className="mb-1">
                    <div className={`relative bg-[#f2f2f2] border rounded-sm px-4 pt-2 pb-2 focus-within:border-[#999] transition-colors ${emailError ? 'border-red-500' : 'border-[#e5e5e5]'}`}>
                      <label className="block text-[#666] text-xs mb-0.5">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(null); setApiError(null); }}
                        placeholder="your@email.com"
                        className="w-full bg-transparent text-[#111] text-sm focus:outline-none placeholder-[#777] pr-6"
                        autoComplete="email"
                        data-testid="inputEmail"
                      />
                      {emailError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {emailError
                      ? <p className="text-red-500 text-xs mt-1 mb-3" data-testid="emailError">{emailError}</p>
                      : <p className="text-[#777] text-xs mt-1 mb-3">Enter the email address associated with your account.</p>
                    }
                  </div>

                  <div className="mb-1">
                    <div className={`relative bg-[#f2f2f2] border rounded-sm px-4 pt-2 pb-2 focus-within:border-[#999] transition-colors ${tokenError ? 'border-red-500' : 'border-[#e5e5e5]'}`}>
                      <label className="block text-[#666] text-xs mb-0.5">Reset code</label>
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => { setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setTokenError(null); setApiError(null); }}
                        placeholder="e.g. 21D9E4"
                        maxLength={6}
                        data-testid="inputToken"
                        className="w-full bg-transparent text-[#111] text-sm font-mono tracking-widest focus:outline-none placeholder-[#777] uppercase pr-6"
                        autoComplete="off"
                      />
                      {tokenError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {tokenError
                      ? <p className="text-red-500 text-xs mt-1 mb-3" data-testid="tokenError">{tokenError}</p>
                      : <p className="text-[#777] text-xs mt-1 mb-3">Enter the 6-character code we sent to your email inbox.</p>
                    }
                  </div>

                  <div className="mb-4">
                    <div className="relative bg-[#f2f2f2] border border-[#e5e5e5] rounded-sm px-4 pt-2 pb-2 focus-within:border-[#999] transition-colors">
                      <label className="block text-[#666] text-xs mb-0.5">New password</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setApiError(null); }}
                        placeholder="Choose a password (min. 8 characters)"
                        className="w-full bg-transparent text-[#111] text-sm focus:outline-none placeholder-[#777] pr-8"
                        autoComplete="new-password"
                        data-testid="newPasswordInput"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        data-testid="newPasswordBtn"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#111]"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <div data-testid="passwordRules" className="mt-2 bg-[#f7f7f7] border border-[#d7d7d7] rounded-sm px-4 py-3 flex flex-col gap-1.5">
                        {[
                          { label: 'At least 8 characters', met: newPassword.length >= 8 },
                          { label: 'At least one uppercase letter', met: /[A-Z]/.test(newPassword) },
                          { label: 'At least one lowercase letter', met: /[a-z]/.test(newPassword) },
                          { label: 'At least one number', met: /[0-9]/.test(newPassword) },
                          { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(newPassword) },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${rule.met ? 'bg-green-500' : 'bg-[#d7d7d7]'}`}>
                              {rule.met && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs ${rule.met ? 'text-green-600' : 'text-[#777]'}`}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className={`relative bg-[#f2f2f2] border rounded-sm px-4 pt-2 pb-2 focus-within:border-[#999] transition-colors ${confirmPassword.length > 0 && newPassword !== confirmPassword ? 'border-red-500' : 'border-[#e5e5e5]'}`}>
                      <label className="block text-[#666] text-xs mb-0.5">Confirm new password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setApiError(null); }}
                        placeholder="Re-enter your new password"
                        className="w-full bg-transparent text-[#111] text-sm focus:outline-none placeholder-[#777] pr-8"
                        autoComplete="new-password"
                        data-testid="confirmPasswordInput"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        data-testid="confirmPasswordBtn"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#111]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1" data-testid="passMismatchError">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasAllFields || isSubmitting}
                    data-testid="savePasswordBtn"
                    className={`w-full py-3 rounded-sm text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      hasAllFields && !isSubmitting
                        ? 'sc-auth-primary-action cursor-pointer'
                        : 'sc-auth-primary-action cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save new password'}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-[#111] text-lg font-bold mb-3">Password changed</h2>
                  <p className="text-[#666] text-sm leading-relaxed mb-6">
                    Your password has been updated successfully. You have been signed out of all other devices.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/signin')}
                    data-testid="goToSignInBtn"
                    className="sc-auth-primary-action w-full py-3 rounded-sm text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

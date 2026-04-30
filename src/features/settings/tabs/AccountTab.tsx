import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import SettingsSection from "../components/shared/SettingsSection";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../types/settings.types";

const themes: { label: string; value: Theme; testId: string }[] = [
  { label: "Light", value: "light", testId: "theme-radio-light" },
  { label: "Dark", value: "dark", testId: "theme-radio-dark" },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = Array.from(
  { length: new Date().getFullYear() - 1899 },
  (_, index) => String(new Date().getFullYear() - index),
);

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  testId?: string;
}

function SettingsDropdown({
  id,
  value,
  onChange,
  options,
  testId,
  openDropdown,
  setOpenDropdown,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  testId: string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  className?: string;
}) {
  const open = openDropdown === id;
  const selected = options.find((option) => option.value === value);
  const label = selected?.label ?? options[0]?.label ?? "";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpenDropdown(open ? null : id)}
        className={`flex h-12 w-full items-center justify-between rounded-sm border px-5 text-left text-base font-bold transition-colors ${
          open
            ? "border-[#a7a7a7] bg-[var(--sc-surface)] text-[var(--sc-text)]"
            : "border-transparent bg-[var(--sc-surface)] text-[var(--sc-text)] hover:bg-[var(--sc-surface-hover)]"
        }`}
      >
        {label}
        {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {open && (
        <div className="hide-scrollbar absolute left-0 right-0 top-full z-30 mt-0 max-h-[475px] overflow-y-auto rounded-b-sm border border-[var(--sc-border)] bg-[#111] shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                data-testid={option.testId}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpenDropdown(null);
                }}
                className={`block w-full px-4 py-2.5 text-left text-base ${
                  option.disabled
                    ? "cursor-default text-[var(--sc-text-secondary)]"
                    : isSelected
                      ? "font-black text-white"
                      : "font-bold text-[#a7a7a7] hover:bg-[#1b1b1b] hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AccountTab() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isEmailFormOpen, setIsEmailFormOpen } = useSettings();
  const [emailInput, setEmailInput] = useState("");
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [month, setMonth] = useState("June");
  const [day, setDay] = useState("1");
  const [year, setYear] = useState("1999");
  const [gender, setGender] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const submitEmail = () => {
    if (emailInput.trim()) setUnconfirmedEmail(emailInput.trim());
    setEmailInput("");
    setIsEmailFormOpen(false);
  };

  return (
    <div data-testid="settings-account-tab">
      <SettingsSection title="Change theme" data-testid="settings-section-change-theme">
        <div className="space-y-3">
          {themes.map((themeOption) => (
            <label key={themeOption.value} className="flex w-fit cursor-pointer items-center gap-3 font-bold">
              <input
                type="radio"
                name="theme"
                value={themeOption.value}
                checked={theme === themeOption.value}
                onChange={() => setTheme(themeOption.value)}
                data-testid={themeOption.testId}
                className="h-4 w-4 accent-[var(--sc-text)]"
              />
              <span className="text-sm text-white">{themeOption.label}</span>
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Email addresses" data-testid="settings-section-email-addresses">
        <div className="mb-4 space-y-3">
            <p data-testid="email-primary" className="font-semibold text-white">
            asmahanbettar@gmail.com <span className="text-zinc-400">(Primary)</span>
          </p>
          {unconfirmedEmail && (
            <p data-testid="email-unconfirmed" className="font-semibold text-zinc-400">
              {unconfirmedEmail} (Not confirmed -{" "}
              <button type="button" data-testid="email-resend-confirmation" className="font-black text-white">
                Resend confirmation email
              </button>{" "}
              -{" "}
              <button
                type="button"
                data-testid="email-remove-address"
                onClick={() => setUnconfirmedEmail("")}
                className="font-black text-white"
              >
                Remove address
              </button>
              )
            </p>
          )}
        </div>
        {isEmailFormOpen && (
          <div className="mb-4 space-y-4">
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Please enter your email address *"
              data-testid="email-input"
              className="h-11 w-full max-w-[380px] rounded-sm border border-zinc-500 bg-[var(--sc-surface)] px-5 text-sm text-white placeholder:text-zinc-400"
            />
            <div className="flex items-center gap-8">
              <button
                type="button"
                data-testid="email-submit-button"
                onClick={submitEmail}
                className="rounded-md bg-white px-5 py-3 text-sm font-black text-black hover:opacity-90"
              >
                Add
              </button>
              <button
                type="button"
                data-testid="email-cancel-button"
                onClick={() => setIsEmailFormOpen(false)}
                className="text-sm font-black text-white hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          data-testid="email-add-button"
          onClick={() => setIsEmailFormOpen(true)}
          className="rounded-sm bg-[var(--sc-surface)] px-4 py-2 text-sm font-black text-[var(--sc-text)] hover:bg-[var(--sc-surface-hover)]"
        >
          Add an email address
        </button>
      </SettingsSection>

      <SettingsSection title="Sign in with other social networks" infoIcon data-testid="settings-section-social-networks">
        <div className="mb-5 grid max-w-[760px] grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <FcGoogle size={18} aria-hidden="true" />
            <p className="font-semibold">Asmahan Bettar</p>
          </div>
          <button type="button" data-testid="social-disconnect-google" className="w-fit font-semibold text-white hover:underline">
            Disconnect account
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" data-testid="social-add-facebook" className="settings-social-facebook flex items-center gap-3 rounded-sm px-4 py-2 text-sm font-black">
            <FaFacebookF /> Add Facebook account
          </button>
          <button type="button" data-testid="social-add-google" className="settings-social-google flex items-center gap-3 rounded-sm px-4 py-2 text-sm font-black">
            <FcGoogle /> Add Google account
          </button>
          <button type="button" data-testid="social-add-apple" className="settings-social-apple flex items-center gap-3 rounded-sm px-4 py-2 text-sm font-black">
            <FaApple /> Add Apple account
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Password" data-testid="settings-section-password">
        <button type="button" data-testid="password-reset-button" className="rounded-sm bg-[var(--sc-surface)] px-4 py-2 text-sm font-black text-[var(--sc-text)]">
          Send password-reset link
        </button>
      </SettingsSection>

      <SettingsSection title="Verification badge" data-testid="settings-section-verification-badge">
        <div className="-mt-10 mb-5 ml-40">
          <CheckCircle size={16} className="fill-[#5b9cff] text-[#5b9cff]" aria-hidden="true" />
        </div>
        <button
          type="button"
          data-testid="verification-request-button"
          onClick={() => navigate("/settings/verification")}
          className="rounded-sm bg-[var(--sc-surface)] px-4 py-2 text-sm font-black text-[var(--sc-text)]"
        >
          Request verification
        </button>
      </SettingsSection>

      <SettingsSection title="Basic information" data-testid="settings-section-basic-information">
        <div className="grid max-w-[760px] grid-cols-1 gap-8 md:grid-cols-[500px_210px]">
          <div>
            <label className="mb-2 flex items-center gap-2 font-black">
              Birth date <Info size={14} className="text-[var(--sc-text-secondary)]" aria-hidden="true" />
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[176px_176px_124px]">
              <SettingsDropdown
                id="month"
                value={month}
                onChange={setMonth}
                testId="birthdate-month"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                options={[{ label: "Month", value: "", disabled: true }, ...months.map((name) => ({ label: name, value: name }))]}
              />
              <SettingsDropdown
                id="day"
                value={day}
                onChange={setDay}
                testId="birthdate-day"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                options={[{ label: "Day", value: "", disabled: true }, ...Array.from({ length: 30 }, (_, index) => String(index + 1)).map((date) => ({ label: date, value: date }))]}
              />
              <SettingsDropdown
                id="year"
                value={year}
                onChange={setYear}
                testId="birthdate-year"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                options={[{ label: "Year", value: "", disabled: true }, ...years.map((date) => ({ label: date, value: date }))]}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block font-black">
              Gender <span className="text-pink-500">*</span>
            </label>
            <SettingsDropdown
              id="gender"
              value={gender}
              onChange={setGender}
              testId="gender-select"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              options={[
                { label: "Indicate gender", value: "" },
                { label: "Female", value: "female", testId: "gender-option-female" },
                { label: "Male", value: "male", testId: "gender-option-male" },
                { label: "Prefer not to say", value: "prefer-not-to-say", testId: "gender-option-prefer-not-to-say" },
                { label: "Custom", value: "custom", testId: "gender-option-custom" },
              ]}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Connected applications" infoIcon data-testid="settings-section-connected-applications">
        <div className="max-w-[760px] space-y-6">
          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="font-semibold">SoundCloud.com</span>
            <button type="button" data-testid="revoke-soundcloud-web" className="font-black text-[var(--sc-text)]">
              Revoke access
            </button>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="font-semibold">SoundCloud iOS</span>
            <button type="button" data-testid="revoke-soundcloud-ios" className="font-black text-[var(--sc-text)]">
              Revoke access
            </button>
          </div>
          <div className="text-right">
            <button type="button" data-testid="revoke-all" className="font-black text-[var(--sc-text)]">
              Revoke all
            </button>
          </div>
        </div>
      </SettingsSection>

      <button type="button" data-testid="delete-account-button" className="font-black text-pink-600 hover:underline">
        Delete account
      </button>
    </div>
  );
}

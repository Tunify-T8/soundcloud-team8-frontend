import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { X, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteAccount } from "../../auth/services/index";
import { clearUser } from "../../../store/userSlice";
import type { AppDispatch } from "../../../app/store";
import { applyTheme } from "../hooks/useTheme";
import type { Theme } from "../types/settings.types";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReasonId =
  | "another_account"
  | "new_account"
  | "privacy_options"
  | "no_content"
  | "copyright"
  | "no_pro"
  | "switched_service"
  | "hacked"
  | "cant_remove_tracks"
  | "harassment"
  | "spam"
  | "other";

const STREAMING_SERVICES = [
  "Amazon",
  "Bandcamp",
  "iTunes",
  "Spotify",
  "Tidal",
  "YouTube",
  "Other, please specify:",
];

function ReasonCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3"
      data-testid={`reason-label-${id}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        data-testid={`reason-checkbox-${id}`}
      />
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
          checked
            ? "border-[var(--sc-text)] bg-[var(--sc-text)]"
            : "border-[var(--sc-text)] bg-transparent"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <Check size={11} className="text-[var(--sc-bg)]" strokeWidth={3} />
        )}
      </span>
      <span className="text-sm font-bold text-[var(--sc-text)]">{label}</span>
    </label>
  );
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [checkedReasons, setCheckedReasons] = useState<Set<ReasonId>>(
    new Set(),
  );
  const [privacyText, setPrivacyText] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [otherServiceText, setOtherServiceText] = useState("");
  const [otherText, setOtherText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCheckedReasons(new Set());
      setPrivacyText("");
      setSelectedService("");
      setOtherServiceText("");
      setOtherText("");
      setConfirmed(false);
      setPassword("");
      setShowPassword(false);
      setIsDeleting(false);
      setDeleteError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const toggleReason = (id: ReasonId) => {
    setCheckedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    const currentTheme = (localStorage.getItem("sc-theme") ||
      localStorage.getItem("tunify-theme") ||
      document.documentElement.getAttribute("data-theme")) as Theme | null;
    try {
      await deleteAccount(password || undefined);
      if (currentTheme === "light" || currentTheme === "dark") {
        localStorage.setItem("sc-theme", currentTheme);
        applyTheme(currentTheme);
      }
      dispatch(clearUser());
      navigate("/signin");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setDeleteError(
        typeof msg === "string"
          ? msg
          : "Failed to delete account. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60"
      data-testid="delete-account-modal-overlay"
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[60] text-white hover:opacity-70"
        data-testid="delete-account-modal-close"
        aria-label="Close delete account modal"
      >
        <X size={28} />
      </button>

      <div
        className="flex min-h-full items-start justify-center p-8"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[680px] bg-[var(--sc-bg)] px-8 py-8"
          data-testid="delete-account-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            className="mb-6 text-2xl font-bold text-[var(--sc-text)]"
            data-testid="delete-account-modal-title"
          >
            Delete account
          </h2>

          <p
            className="mb-5 font-bold text-[var(--sc-text)]"
            data-testid="delete-account-modal-question"
          >
            Why are you choosing to delete your account?
          </p>

          <div
            className="space-y-4"
            data-testid="delete-account-reasons-list"
          >
            <ReasonCheckbox
              id="another-account"
              label="I have another account"
              checked={checkedReasons.has("another_account")}
              onChange={() => toggleReason("another_account")}
            />

            <ReasonCheckbox
              id="new-account"
              label="I want to make a new account"
              checked={checkedReasons.has("new_account")}
              onChange={() => toggleReason("new_account")}
            />

            <div>
              <ReasonCheckbox
                id="privacy-options"
                label="There aren't enough privacy options"
                checked={checkedReasons.has("privacy_options")}
                onChange={() => toggleReason("privacy_options")}
              />
              {checkedReasons.has("privacy_options") && (
                <div
                  className="mt-2 pl-7"
                  data-testid="privacy-options-content"
                >
                  <p className="mb-1 text-sm text-[var(--sc-text-secondary)]">
                    What options do you need that are currently missing?
                  </p>
                  <textarea
                    value={privacyText}
                    onChange={(e) => setPrivacyText(e.target.value)}
                    className="w-full bg-[var(--sc-surface)] p-3 text-sm text-[var(--sc-text)] outline-none"
                    rows={3}
                    data-testid="privacy-options-textarea"
                  />
                </div>
              )}
            </div>

            <ReasonCheckbox
              id="no-content"
              label="I am no longer creating content for this account"
              checked={checkedReasons.has("no_content")}
              onChange={() => toggleReason("no_content")}
            />

            <ReasonCheckbox
              id="copyright"
              label="I had copyright issues with a track or tracks"
              checked={checkedReasons.has("copyright")}
              onChange={() => toggleReason("copyright")}
            />

            <div>
              <ReasonCheckbox
                id="no-pro"
                label="I don't want to subscribe to SoundCloud Pro anymore"
                checked={checkedReasons.has("no_pro")}
                onChange={() => toggleReason("no_pro")}
              />
              {checkedReasons.has("no_pro") && (
                <p
                  className="mt-1 pl-7 text-sm text-[var(--sc-text-secondary)]"
                  data-testid="no-pro-content"
                >
                  You can cancel your subscription{" "}
                  <a
                    href="https://soundcloud.com/you/subscriptions?ref=t2206"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5b9cff] hover:underline"
                    data-testid="subscription-link"
                  >
                    here
                  </a>
                  .
                </p>
              )}
            </div>

            <div>
              <ReasonCheckbox
                id="switched-service"
                label="I switched to another music or audio service"
                checked={checkedReasons.has("switched_service")}
                onChange={() => toggleReason("switched_service")}
              />
              {checkedReasons.has("switched_service") && (
                <div
                  className="mt-2 space-y-2 pl-7"
                  data-testid="switched-service-content"
                >
                  <p className="text-sm text-[var(--sc-text-secondary)]">
                    Which service are you switching to?
                  </p>
                  {STREAMING_SERVICES.map((service) => {
                    const serviceId = service
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "");
                    return (
                      <label
                        key={service}
                        className="flex cursor-pointer items-center gap-2 font-bold text-[var(--sc-text)]"
                        data-testid={`service-option-label-${serviceId}`}
                      >
                        <input
                          type="radio"
                          name="streaming-service"
                          value={service}
                          checked={selectedService === service}
                          onChange={() => setSelectedService(service)}
                          className="h-4 w-4 accent-[var(--sc-text)]"
                          data-testid={`service-radio-${serviceId}`}
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    );
                  })}
                  {selectedService === "Other, please specify:" && (
                    <textarea
                      value={otherServiceText}
                      onChange={(e) => setOtherServiceText(e.target.value)}
                      className="w-full bg-[var(--sc-surface)] p-3 text-sm text-[var(--sc-text)] outline-none"
                      rows={3}
                      data-testid="other-service-textarea"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <ReasonCheckbox
                id="hacked"
                label="My account got hacked"
                checked={checkedReasons.has("hacked")}
                onChange={() => toggleReason("hacked")}
              />
              {checkedReasons.has("hacked") && (
                <div
                  className="mt-2 space-y-2 pl-7 text-sm text-[var(--sc-text-secondary)]"
                  data-testid="hacked-content"
                >
                  <p>We're sorry to hear that.</p>
                  <p>
                    Please{" "}
                    <a
                      href="#"
                      className="text-[#5b9cff] hover:underline"
                      data-testid="reset-password-link"
                    >
                      reset your password
                    </a>
                    . We also suggest{" "}
                    <a
                      href="#"
                      className="text-[#5b9cff] hover:underline"
                      data-testid="revoke-connections-link"
                    >
                      revoking connections to your account
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-[#5b9cff] hover:underline"
                      data-testid="connected-emails-link"
                    >
                      checking your account's connected emails
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>

            <div>
              <ReasonCheckbox
                id="cant-remove-tracks"
                label="I can't remove my tracks"
                checked={checkedReasons.has("cant_remove_tracks")}
                onChange={() => toggleReason("cant_remove_tracks")}
              />
              {checkedReasons.has("cant_remove_tracks") && (
                <p
                  className="mt-1 pl-7 text-sm text-[var(--sc-text-secondary)]"
                  data-testid="cant-remove-tracks-content"
                >
                  Need help deleting your tracks?{" "}
                  <a
                    href="https://help.soundcloud.com/hc/en-us/articles/115003562248"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5b9cff] hover:underline"
                    data-testid="remove-tracks-link"
                  >
                    Here&apos;s how you can.
                  </a>
                </p>
              )}
            </div>

            <div>
              <ReasonCheckbox
                id="harassment"
                label="People are harassing me"
                checked={checkedReasons.has("harassment")}
                onChange={() => toggleReason("harassment")}
              />
              {checkedReasons.has("harassment") && (
                <p
                  className="mt-2 pl-7 text-sm text-[var(--sc-text-secondary)]"
                  data-testid="harassment-content"
                >
                  Sorry to hear that. If you are being harassed on SoundCloud,
                  please{" "}
                  <a
                    href="#"
                    className="text-[#5b9cff] hover:underline"
                    data-testid="block-users-link"
                  >
                    block the user(s) involved
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#5b9cff] hover:underline"
                    data-testid="contact-us-link"
                  >
                    get in touch with us
                  </a>
                  .
                </p>
              )}
            </div>

            <ReasonCheckbox
              id="spam"
              label="Too much spam on the platform"
              checked={checkedReasons.has("spam")}
              onChange={() => toggleReason("spam")}
            />

            <div>
              <ReasonCheckbox
                id="other"
                label="Other, please specify"
                checked={checkedReasons.has("other")}
                onChange={() => toggleReason("other")}
              />
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="mt-2 w-full bg-[var(--sc-surface)] p-3 text-sm text-[var(--sc-text)] outline-none"
                rows={3}
                data-testid="other-reason-textarea"
              />
            </div>
          </div>

          <div className="mt-6" data-testid="delete-confirmation-section">
            <label
              className="flex cursor-pointer items-start gap-3"
              data-testid="delete-confirmation-label"
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed(!confirmed)}
                className="sr-only"
                data-testid="delete-confirmation-checkbox"
              />
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  confirmed
                    ? "border-[var(--sc-text)] bg-[var(--sc-text)]"
                    : "border-[var(--sc-text)] bg-transparent"
                }`}
                aria-hidden="true"
              >
                {confirmed && (
                  <Check
                    size={11}
                    className="text-[var(--sc-bg)]"
                    strokeWidth={3}
                  />
                )}
              </span>
              <span className="text-sm font-bold text-[var(--sc-text)]">
                Yes, I want to delete my account and all my tracks, comments
                and stats.
              </span>
            </label>
          </div>

          <div className="mt-4" data-testid="delete-password-section">
            <label
              htmlFor="delete-account-password"
              className="mb-1.5 block text-sm font-bold text-[var(--sc-text)]"
            >
              Confirm your password
              <span className="ml-1 text-xs font-normal text-[var(--sc-text-secondary)]">
                (required for password accounts)
              </span>
            </label>
            <div className="relative">
              <input
                id="delete-account-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="Your password"
                className="w-full rounded-sm bg-[var(--sc-surface)] px-4 py-3 pr-10 text-sm text-[var(--sc-text)] outline-none placeholder:text-[var(--sc-text-secondary)]"
                data-testid="delete-account-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sc-text-secondary)] hover:text-[var(--sc-text)]"
                data-testid="delete-account-toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {deleteError && (
            <p
              className="mt-3 text-sm text-red-500"
              data-testid="delete-account-error"
            >
              {deleteError}
            </p>
          )}

          <div
            className="mt-6 flex items-center justify-end gap-6"
            data-testid="delete-account-modal-actions"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="text-sm font-bold text-[var(--sc-text)] hover:underline disabled:opacity-50"
              data-testid="delete-account-cancel-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || isDeleting}
              className="flex items-center gap-2 rounded-sm bg-[var(--sc-text)] px-5 py-3 text-sm font-bold text-[var(--sc-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="delete-account-confirm-button"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete my account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

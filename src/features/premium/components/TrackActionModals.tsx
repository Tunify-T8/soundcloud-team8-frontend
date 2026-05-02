import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckoutModal from "@/features/premium/components/CheckoutModal";

type PremiumActionModalProps = {
  featureLabel: string;
  onClose: () => void;
  isArtistPro?: boolean;
};

export function PremiumComingSoonModal({
  featureLabel,
  onClose,
  isArtistPro = false,
}: PremiumActionModalProps) {
  const proTheme = isArtistPro;
  const isMonetizationModal = featureLabel === "Monetization";
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div
        className={proTheme ? "absolute inset-0 bg-black/60 backdrop-blur-[2px]" : "absolute inset-0 bg-black/45 backdrop-blur-[1px]"}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-[121] w-full max-w-[760px] overflow-hidden rounded-2xl border shadow-2xl ${proTheme ? "border-[#d4b253]/35 bg-[#1c1608]" : "border-zinc-800 bg-[#111]"}`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${proTheme ? "bg-[#d4b253] text-[#281f07] hover:bg-[#e6c86c]" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`flex flex-col gap-6 px-6 pb-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10 sm:pt-10 ${proTheme ? "bg-[linear-gradient(135deg,rgba(212,178,83,0.16),rgba(28,22,8,0.08))]" : ""}`}>
          <div className="max-w-xl">
            <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase ${proTheme ? "bg-[#d4b253]/20 text-[#f7e6ad]" : "bg-zinc-800 text-zinc-300"}`}>
              SoundCloud
            </div>
            {isMonetizationModal && !proTheme ? (
              <>
                <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Get paid for your plays with Artist Pro.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  Artists need to eat too. When you monetize your tracks through SoundCloud, you get 100% of royalties from plays there, and can keep earning from your streams on other platforms too.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  Simply put, the more fans that listen to your music, the more you get paid.
                </p>
              </>
            ) : (
              <>
                <h2 className={`text-2xl font-bold leading-tight sm:text-3xl ${proTheme ? "text-[#f7e6ad]" : "text-white"}`}>
                  {featureLabel} coming soon.
                </h2>
                <p className={`mt-4 text-sm leading-relaxed ${proTheme ? "text-[#f7e6ad]/90" : "text-zinc-300"}`}>
                  Stay tuned, you'll be the first to get notified!
                </p>
                {!proTheme && (
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                    Upgrade to Artist Pro to unlock this feature sooner and get access to more ways to grow your catalog.
                  </p>
                )}
              </>
            )}
          </div>

          {isMonetizationModal && !proTheme ? (
            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-zinc-900 sm:w-64">
              <svg viewBox="0 0 180 140" className="h-full w-full">
                <path d="M20 95c20-10 30-30 40-32 18-3 32 20 49 14 18-6 26-34 45-34 10 0 17 4 26 16v41H20V95Z" fill="#13c77b" opacity="0.96" />
                <path d="M44 49c0-8 6-14 14-14h13c6 0 11 3 14 8l8 15h22c8 0 14 6 14 14v13H44V49Z" fill="#14b86f" />
                <rect x="63" y="34" width="62" height="62" rx="10" fill="#0f0f0f" stroke="#17d481" strokeWidth="2" />
                <text x="93" y="78" textAnchor="middle" fontSize="52" fontWeight="900" fill="#ffffff">$</text>
              </svg>
            </div>
          ) : (
            <div className={`flex h-40 w-full items-center justify-center rounded-xl sm:w-64 ${proTheme ? "bg-[#d4b253]/15 ring-1 ring-[#d4b253]/25" : "bg-zinc-900"}`}>
              <div className={`text-center text-4xl font-black ${proTheme ? "text-[#f7e6ad]" : "text-emerald-400"}`}>
                {featureLabel === "Distribution" ? "⟟" : "$"}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6 sm:px-10 sm:pb-8">
          {isMonetizationModal && !proTheme && (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-zinc-100"
            >
              Get started
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${proTheme ? "text-[#f7e6ad] hover:text-white" : "text-white hover:text-zinc-300"}`}
          >
            OK
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  );
}

export function MasteringEligibilityModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[121] w-full max-w-[820px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-4 pt-10 sm:px-6">
          <div className="flex items-center gap-3 rounded-md border border-[#f2b5ba] bg-[#fde8ea] px-4 py-3 text-[#111]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-600 text-red-600">
              !
            </span>
            <p className="text-sm leading-relaxed">
              This track is not eligible for mastering.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => navigate("/upload")}
              className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
            >
              Upload a new track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { X, Upload, Zap, Share2, RefreshCw, Plus, Star } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

interface UpgradeModalProps {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [checkoutPlan, setCheckoutPlan] = useState<"artist" | "artist-pro" | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (checkoutPlan) {
    return (
      <CheckoutModal
        plan={checkoutPlan}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white w-full max-w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-zinc-600" />
        </button>

        <div className="px-8 pt-10 pb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-[26px] text-2xl font-semibold text-zinc-700 tracking-tight mb-2">
              Unlock artist tools and reach more listeners
            </h2>
            <p className="text-sm text-zinc-500">Select the plan that suits you best</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Artist Plan */}
            <div className="border border-zinc-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
               <h3 className="text-xl font-semibold text-zinc-700 tracking-tight">Artist</h3>
                <div className="w-6 h-6 rounded-full bg-[#5b4ff5] flex items-center justify-center">
                  <Plus size={13} className="text-white" strokeWidth={2.5} />
                </div>
              </div>

              <p className="text-[13px] text-zinc-500 mb-4">
                Tailored access to essential artist tools
              </p>

              <div className="mb-1">
                <span className="text-xl font-semibold text-[#5b4ff5]">EGP 29.99</span>
                <span className="text-sm text-zinc-400 ml-1">/ month</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-5">billed yearly for EGP 359.88</p>

              <button
                onClick={() => setCheckoutPlan("artist")}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-colors mb-5"
              >
                Get started
              </button>

              <ul className="space-y-3">
                <FeatureRow icon={<Upload size={15} />} label="3 hours of uploads" />
                <FeatureRow
                  icon={<Zap size={15} />}
                  label="Boost tracks and get 100+ listeners"
                  badge="2X MONTH"
                  badgeColor="blue"
                />
                <FeatureRow
                  icon={<Share2 size={15} />}
                  label="Distribute & monetize tracks"
                  badge="2X MONTH"
                  badgeColor="blue"
                />
                <FeatureRow
                  icon={<RefreshCw size={15} />}
                  label="Replace tracks without losing stats"
                  badge="3X MONTH"
                  badgeColor="blue"
                />
              </ul>
            </div>

            {/* Artist Pro Plan */}
            <div className="border-2 border-[#c9a227] rounded-2xl p-6 relative overflow-hidden">
              {/* Most Popular badge */}
              <div className="absolute top-0 right-0 bg-[#c9a227] text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">
                MOST POPULAR
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-zinc-700 tracking-tight">Artist Pro</h3>
                <div className="w-6 h-6 rounded-full bg-[#c9a227] flex items-center justify-center">
                  <Star size={11} className="text-white" fill="white" />
                </div>
              </div>

              <p className="text-[13px] text-zinc-500 mb-4">
                Unlimited access to all artist tools
              </p>

              <div className="mb-1">
                <span className="text-xl font-semibold text-[#c9a227]">EGP 74.99</span>
                <span className="text-sm text-zinc-400 ml-1">/ month</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-5">billed yearly for EGP 899.88</p>

              <button
                onClick={() => setCheckoutPlan("artist-pro")}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-colors mb-5"
              >
                Start 7-day free trial
              </button>

              <ul className="space-y-3">
                <FeatureRow icon={<Upload size={15} />} label="Unlimited uploads" />
                <FeatureRow
                  icon={<Zap size={15} />}
                  label="Boost tracks and get 100+ listeners"
                  badge="UNLIMITED"
                  badgeColor="gold"
                />
                <FeatureRow
                  icon={<Share2 size={15} />}
                  label="Distribute & monetize tracks"
                  badge="UNLIMITED"
                  badgeColor="gold"
                />
                <FeatureRow
                  icon={<RefreshCw size={15} />}
                  label="Replace tracks without losing stats"
                  badge="UNLIMITED"
                  badgeColor="gold"
                />
              </ul>

              <div className="text-center mt-4">
                <button
                  onClick={() => window.open("/plans#plans-comparison", "_blank")}
                  className="text-[12px] text-[#5b4ff5] hover:underline font-medium"
                >
                  See all benefits
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 hover:border-zinc-500 rounded-full px-5 py-2 transition-colors"
            >
              Or continue without a paid plan
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureRowProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: "blue" | "gold";
}

function FeatureRow({ icon, label, badge, badgeColor }: FeatureRowProps) {
  const badgeStyles =
    badgeColor === "gold"
      ? "bg-[#fdf3d7] text-[#c9a227]"
      : "bg-[#ebe9fd] text-[#5b4ff5]";

  return (
    <li className="flex items-center gap-2.5 text-[13px] text-zinc-700">
      <span className="text-zinc-400 flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${badgeStyles}`}>
          {badge}
        </span>
      )}
    </li>
  );
}
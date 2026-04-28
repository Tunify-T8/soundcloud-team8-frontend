import { useState } from "react";
import powerImg from "@/assets/power.png";
import CheckoutModal from "@/features/premium/components/CheckoutModal";

interface ArtistModalProps {
  onClose: () => void;
}

interface FeatureRowProps {
  label: string;
  multiplier: string;
}

export default function ArtistModal({ onClose }: ArtistModalProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    onClose(); // closes ArtistModal too
  };

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[1000]">
      <div className="bg-[#111] rounded-2xl w-[620px] max-w-[95vw] px-10 pt-12 pb-10 relative font-sans">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#2a2a2a] border-none rounded-full w-9 h-9 text-white text-lg cursor-pointer flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
        >
          ✕
        </button>

        {/* Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[#8b7cf8] text-xs font-bold tracking-[0.12em] uppercase mb-5">
          <div className="w-[18px] h-[18px] bg-[#8b7cf8] rounded-full flex items-center justify-center text-white text-[13px] font-bold">
            +
          </div>
          ARTIST
        </div>

        {/* Heading */}
        <h1 className="text-white text-center font-extrabold tracking-tight leading-[1.15] mb-10 text-[clamp(28px,5vw,40px)]">
          Reach more listeners,<br />with far less effort.
        </h1>

        {/* Content */}
        <div className="flex items-center gap-8">
          {/* Icon */}
          <div className="shrink-0 w-40 h-40 flex items-center justify-center">
            <img src={powerImg} alt="Artist" className="w-[140px] h-auto" />
          </div>

          {/* Features */}
          <div className="flex-1">
            <p className="text-[#888] text-[13px] font-medium mb-[18px]">
              Starting EGP 29.99 / month you can:
            </p>
            <FeatureRow label="Boost your tracks to 100+ listeners" multiplier="2X MONTH" />
            <FeatureRow label="Replace your file without losing stats" multiplier="3X MONTH" />
            <FeatureRow label="Distribute & monetize your tracks" multiplier="2X MONTH" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3.5 mt-9">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="bg-white text-[#111] border-none rounded-full px-10 py-3.5 text-[15px] font-bold cursor-pointer hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all"
          >
            Try Artist now
          </button>
          <button
            onClick={() => window.open("/plans#plans-comparison", "_blank")}
            className="text-white text-[13px] font-semibold cursor-pointer underline underline-offset-[3px] bg-transparent border-none hover:text-[#ccc] transition-colors"
          >
            See all plans
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal plan="artist" onClose={handleCheckoutClose} />
      )}
    </div>
  );
}

const FeatureRow = ({ label, multiplier }: FeatureRowProps) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-[22px] h-[22px] bg-[#8b7cf8] rounded-full flex items-center justify-center shrink-0">
      <svg viewBox="0 0 12 12" fill="none" width={12} height={12}>
        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="text-white text-[15px] font-semibold flex-1">{label}</span>
    <span className="bg-[#1e1a36] text-[#a89cf8] border border-[#3a2f6e] rounded-md text-[11px] font-bold tracking-[0.08em] px-2 py-[3px] whitespace-nowrap">
      {multiplier}
    </span>
  </div>
);
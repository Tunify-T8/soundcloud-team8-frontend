import { useEffect, useState } from "react";
import { X, ChevronLeft, Plus, Star } from "lucide-react";

interface CheckoutModalProps {
  plan: "artist" | "artist-pro";
  onClose: () => void;
  onBack: () => void;
}

const PLAN_CONFIG = {
  artist: {
    title: "Get Artist",
    name: "Artist",
    yearlyTotal: "EGP 359.88",
    yearlyMonthly: "EGP 29.99/month",
    monthlyPrice: "EGP 59.99/month",
    renewAmount: "EGP 359.88",
  },
  "artist-pro": {
    title: "Get Artist Pro",
    name: "Artist Pro",
    yearlyTotal: "EGP 899.88",
    yearlyMonthly: "EGP 74.99/month",
    monthlyPrice: "EGP 149.99/month",
    renewAmount: "EGP 899.88",
  },
};

export default function CheckoutModal({ plan, onClose, onBack }: CheckoutModalProps) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [payment, setPayment] = useState<"card" | "paypal" | null>(null);
  const config = PLAN_CONFIG[plan];

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

  const total = billing === "yearly" ? config.yearlyTotal : config.monthlyPrice;
  const billingLabel = billing === "yearly" ? "Yearly" : "Monthly";

  // Next renewal date: 1 year from today
  const renewDate = new Date();
  renewDate.setFullYear(renewDate.getFullYear() + 1);
  const renewDateStr = renewDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl w-full max-w-[820px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-zinc-600" />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={16} className="text-zinc-600" />
            </button>
            <h2 className="text-2xl font-black text-zinc-900">{config.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* LEFT: Billing + Payment */}
            <div className="space-y-8">
              {/* 1. Billing cycle */}
              <section>
                <h3 className="text-base font-bold text-zinc-900 mb-4">1. Billing cycle</h3>
                <div className="space-y-3">
                  {/* Yearly */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      billing === "yearly"
                        ? "border-orange-500"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="billing"
                      className="mt-0.5 accent-orange-500"
                      checked={billing === "yearly"}
                      onChange={() => setBilling("yearly")}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">Yearly billing</span>
                        <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded">
                          50% YEARLY DISCOUNT
                        </span>
                      </div>
                      <p className="text-[13px] text-zinc-500 mt-0.5">
                        {config.yearlyTotal}, that's {config.yearlyMonthly}
                      </p>
                    </div>
                  </label>

                  {/* Monthly */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      billing === "monthly"
                        ? "border-orange-500"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="billing"
                      className="mt-0.5 accent-orange-500"
                      checked={billing === "monthly"}
                      onChange={() => setBilling("monthly")}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-zinc-900">Monthly billing</span>
                      <p className="text-[13px] text-zinc-500 mt-0.5">{config.monthlyPrice}</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* 2. Payment details */}
              <section>
                <h3 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
                  2. Payment details
                  <span className="text-zinc-400">🔒</span>
                </h3>
                <p className="text-[13px] text-zinc-500 mb-4">Add new payment methods</p>

                <div className="space-y-3">
                  {/* Card */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      payment === "card"
                        ? "border-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="accent-zinc-900"
                      checked={payment === "card"}
                      onChange={() => setPayment("card")}
                    />
                    <span className="text-sm font-medium text-zinc-900 flex-1">Card</span>
                    <div className="flex items-center gap-1.5">
                      {/* Card brand icons as colored blocks */}
                      <span className="w-8 h-5 rounded bg-blue-700 text-white text-[8px] font-black flex items-center justify-center">VISA</span>
                      <span className="w-8 h-5 rounded bg-red-500 text-white text-[7px] font-black flex items-center justify-center">MC</span>
                      <span className="w-8 h-5 rounded bg-blue-500 text-white text-[7px] font-black flex items-center justify-center">AMEX</span>
                      <span className="w-8 h-5 rounded bg-zinc-300 text-zinc-700 text-[7px] font-black flex items-center justify-center">+more</span>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      payment === "paypal"
                        ? "border-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="accent-zinc-900"
                      checked={payment === "paypal"}
                      onChange={() => setPayment("paypal")}
                    />
                    <span className="text-sm font-medium text-zinc-900 flex-1">PayPal</span>
                    <span className="text-[#003087] font-black text-base italic">Pay<span className="text-[#009cde]">Pal</span></span>
                  </label>
                </div>
              </section>
            </div>

            {/* RIGHT: Review purchase */}
            <div>
              <h3 className="text-base font-bold text-zinc-900 mb-4">3. Review your purchase</h3>

              {/* Plan badge */}
              <div className="flex items-center gap-3 mb-4">
                {plan === "artist" ? (
                  <div className="w-8 h-8 rounded-full bg-[#5b4ff5] flex items-center justify-center flex-shrink-0">
                    <Plus size={15} className="text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center flex-shrink-0">
                    <Star size={13} className="text-white" fill="white" />
                  </div>
                )}
                <span className="text-base font-bold text-zinc-900">{config.name}</span>
              </div>

              {/* Coupon */}
              <button className="text-[13px] text-blue-600 hover:underline mb-4 block">
                Do you have a coupon code?
              </button>

              {/* Summary box */}
              <div className="bg-zinc-100 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900">Total</span>
                  <span className="text-sm font-black text-zinc-900">{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-zinc-500">Billing cycle</span>
                  <span className="text-[13px] text-zinc-700 font-medium">{billingLabel}</span>
                </div>
                <p className="text-[12px] text-zinc-500 pt-1 border-t border-zinc-200">
                  Subscription will automatically renew at {config.renewAmount} every{" "}
                  {billing === "yearly" ? "year" : "month"}, starting {renewDateStr}, unless you
                  cancel before the day of your next renewal in your subscription settings.
                </p>
                <p className="text-[11px] text-zinc-400">All prices in EGP</p>
              </div>

              {/* Buy button */}
              <button className="w-full py-3.5 bg-zinc-500 hover:bg-zinc-600 text-white text-sm font-bold rounded-lg transition-colors mb-3">
                Buy subscription
              </button>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                By submitting your payment information and clicking Buy subscription you agree to
                the{" "}
                <a href="#" className="underline text-zinc-600">
                  Terms of Use for Artist Subscriptions
                </a>{" "}
                and{" "}
                <a href="#" className="underline text-zinc-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
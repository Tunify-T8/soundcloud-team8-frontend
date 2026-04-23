import { useEffect, useState } from "react";
import { X } from "lucide-react";
import soundcloudImg from "@/assets/silhouette.png";
import lockImg from "@/assets/lock.png";

interface CheckoutModalProps {
  plan: "artist" | "artist-pro";
  onClose: () => void;
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

export default function CheckoutModal({ plan, onClose }: CheckoutModalProps) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [payment, setPayment] = useState<"card" | "paypal" | "apple" | null>(null);
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
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-semibold text-zinc-700">{config.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* LEFT: Billing + Payment */}
            <div className="space-y-8">
              {/* 1. Billing cycle */}
              <section>
                <h3 className="text-base font-bold text-zinc-700 mb-4">1. Billing cycle</h3>
                <div className="space-y-3">
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
                        <span className="text-sm font-bold text-zinc-700">Yearly billing</span>
                        <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded">
                          50% YEARLY DISCOUNT
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 mt-0.5">
                        {config.yearlyTotal}, that's {config.yearlyMonthly}
                      </p>
                    </div>
                  </label>

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
                      <span className="text-sm font-bold text-zinc-700">Monthly billing</span>
                      <p className="text-[12px] text-zinc-500 mt-0.5">{config.monthlyPrice}</p>
                    </div>
                  </label>
                </div>
              </section>
                {/* 2. Payment details */}
                <section>
                  <h3 className="text-base font-bold text-zinc-700 mb-1 flex items-center gap-2">
                    2. Payment details
                    <img src={lockImg} alt="Secure" className="w-6 h-6 object-contain" />
                  </h3>
                  <p className="text-[13px] text-zinc-500 mb-4">Add new payment methods</p>

                  <div className="space-y-3">
                    {/* Apple Pay option */}
                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        payment === "apple"
                          ? "border-orange-500"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="accent-orange-500"
                        checked={payment === "apple"}
                        onChange={() => setPayment("apple")}
                      />
                      <span className="text-sm font-medium text-zinc-700 flex-1">Apple Pay</span>
                      <span className="border border-zinc-300 rounded px-2 py-0.5 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-zinc-800">
                          <path d="M11.05 7.38c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.36.71-2.97.71-.61 0-1.56-.69-2.56-.67-1.32.02-2.54.77-3.22 1.95-1.37 2.38-.35 5.9 .98 7.83.65.94 1.42 2 2.44 1.96.98-.04 1.35-.63 2.54-.63 1.18 0 1.52.63 2.56.61 1.05-.02 1.72-.96 2.36-1.91.75-1.09 1.05-2.15 1.07-2.2-.02-.01-2.04-.79-2.03-3.17zM9.07 1.9C9.58 1.28 9.93.42 9.83-.5c-.76.03-1.68.51-2.22 1.12-.49.55-.91 1.43-.8 2.27.85.07 1.72-.43 2.26-1z"/>
                        </svg>
                        <span className="text-xs font-semibold text-zinc-800">Pay</span>
                      </span>
                    </label>

                    {/* Card option */}
                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        payment === "card"
                          ? "border-orange-500"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="accent-orange-500"
                        checked={payment === "card"}
                        onChange={() => setPayment("card")}
                      />
                      <span className="text-sm font-medium text-zinc-700 flex-1">Card</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-8 h-5 rounded bg-blue-700 text-white text-[8px] font-black flex items-center justify-center">VISA</span>
                        <span className="w-8 h-5 rounded bg-red-500 text-white text-[7px] font-black flex items-center justify-center">MC</span>
                        <span className="w-8 h-5 rounded bg-blue-500 text-white text-[7px] font-black flex items-center justify-center">AMEX</span>
                        <span className="w-8 h-5 rounded bg-zinc-300 text-zinc-700 text-[7px] font-black flex items-center justify-center">+more</span>
                      </div>
                    </label>

                    {/* Card fields */}
                    {payment === "card" && (
                      <div className="space-y-3 px-1">
                        <input type="text" placeholder="First name" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                        <input type="text" placeholder="Surname" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                        <div className="relative">
                          <input type="text" placeholder="Card number" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400 pr-10" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                              <rect width="20" height="14" rx="2" fill="#E5E7EB"/>
                              <rect y="3" width="20" height="3" fill="#9CA3AF"/>
                            </svg>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" placeholder="Exp. month" className="px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                          <input type="text" placeholder="Exp. year" className="px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                          <input type="text" placeholder="CVV" className="px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                        </div>
                        <select className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-orange-400 appearance-none">
                          <option value="">Billing Country</option>
                          <option value="EG">Egypt</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="AE">UAE</option>
                        </select>
                        <input type="text" placeholder="Postcode (optional)" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                      </div>
                    )}

                    {/* PayPal option */}
                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        payment === "paypal"
                          ? "border-orange-500"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="accent-orange-500"
                        checked={payment === "paypal"}
                        onChange={() => setPayment("paypal")}
                      />
                      <span className="text-sm font-medium text-zinc-700 flex-1">PayPal</span>
                      <span className="text-[#003087] font-black text-base italic">
                        Pay<span className="text-[#009cde]">Pal</span>
                      </span>
                    </label>

                    {/* PayPal fields */}
                    {payment === "paypal" && (
                      <div className="space-y-3 px-1">
                        <select className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-orange-400 appearance-none">
                          <option value="">Billing Country</option>
                          <option value="EG">Egypt</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="AE">UAE</option>
                        </select>
                        <input type="text" placeholder="Postcode (optional)" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                          <span className="text-[13px] text-zinc-600">Add billing address (visible on invoice)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </section>
            </div>

            {/* RIGHT: Review purchase */}
            <div>
              <h3 className="text-base font-bold text-zinc-700 mb-4">3. Review your purchase</h3>

              {/* Plan badge — rounded square image like SoundCloud */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={soundcloudImg}
                  alt="Artist"
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <span className="text-base font-bold text-zinc-700">{config.name}</span>
              </div>

              {/* Coupon */}
              <button className="text-[13px] text-blue-600 hover:underline mb-4 block">
                Do you have a coupon code?
              </button>

              {/* Summary box */}
              <div className="bg-zinc-100 p-4 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">Total</span>
                  <span className="text-sm font-medium text-gray-800">{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-zinc-700 font-semibold">Billing cycle</span>
                  <span className="text-[13px] text-zinc-700 font-semibold">{billingLabel}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed pt-3 mt-3 border-zinc-200">
                  Subscription will automatically renew at {config.renewAmount} every{" "}
                  {billing === "yearly" ? "year" : "month"}, starting {renewDateStr}, unless you
                  cancel before the day of your next renewal in your subscription settings.
                </p>
                <p className="text-[11px] text-zinc-400">All prices in EGP</p>
              </div>

             {/* Buy / PayPal / Apple Pay button */}
              {payment === "apple" ? (
                <button className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors mb-3 flex items-center justify-center gap-1 tracking-tight">
                  Continue with
                  <svg width="16" height="16" viewBox="1 1 14 14" fill="white">
                    <path d="M11.05 7.38c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.36.71-2.97.71-.61 0-1.56-.69-2.56-.67-1.32.02-2.54.77-3.22 1.95-1.37 2.38-.35 5.9.98 7.83.65.94 1.42 2 2.44 1.96.98-.04 1.35-.63 2.54-.63 1.18 0 1.52.63 2.56.61 1.05-.02 1.72-.96 2.36-1.91.75-1.09 1.05-2.15 1.07-2.2-.02-.01-2.04-.79-2.03-3.17zM9.07 1.9C9.58 1.28 9.93.42 9.83-.5c-.76.03-1.68.51-2.22 1.12-.49.55-.91 1.43-.8 2.27.85.07 1.72-.43 2.26-1z"/>
                  </svg>
                  Pay
                </button>
              ) : payment === "paypal" ? (
                <button className="w-full py-3.5 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm font-bold rounded-lg transition-colors mb-3 flex items-center justify-center gap-2">
                  <span className="font-black italic text-base">
                    <span className="text-white">Pay</span><span className="text-[#70d0f6]">Pal</span>
                  </span>
                  Continue with PayPal
                </button>
              ) : (
                <button className="w-full py-3.5 bg-zinc-500 hover:bg-zinc-600 text-white text-sm font-bold rounded-lg transition-colors mb-3">
                  Buy subscription
                </button>
              )}

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                By submitting your payment information and clicking{"   "}
                {payment === "apple"
                  ? "Continue with Apple Pay"
                  : payment === "paypal"
                  ? "Continue with PayPal"
                  : "Buy subscription"}{" "}
                you agree to the{" "}
                <a href="#" className="underline text-zinc-600">Terms of Use for Artist Subscriptions</a>{" "}
                and{" "}
                <a href="#" className="underline text-zinc-600">Privacy Policy</a>
              </p>           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
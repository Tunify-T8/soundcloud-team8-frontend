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

// Luhn algorithm 3shan ne validate el card number
function luhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

interface CardErrors {
  firstName?: string;
  surname?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
}

export default function CheckoutModal({ plan, onClose }: CheckoutModalProps) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [payment, setPayment] = useState<"card" | "paypal" | "apple" | null>(null);
  const config = PLAN_CONFIG[plan];

  // Card fields
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<CardErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  function validate(): CardErrors {
    const e: CardErrors = {};
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!firstName.trim()) e.firstName = "Enter the first name on the card";
    if (!surname.trim()) e.surname = "Enter the last name on the card";

    const rawCard = cardNumber.replace(/\s/g, "");
    if (!rawCard) e.cardNumber = "Enter the card number";
    else if (!/^\d+$/.test(rawCard)) e.cardNumber = "Enter a valid card number";
    else if (!luhn(rawCard)) e.cardNumber = "Enter a valid card number";

    const monthNum = parseInt(expMonth, 10);
    if (!expMonth) e.expMonth = "Enter the expiry month in format MM";
    else if (!/^\d{1,2}$/.test(expMonth) || monthNum < 1 || monthNum > 12)
      e.expMonth = "Enter the expiry month in format MM";

    const yearNum = parseInt(expYear, 10);
    if (!expYear) e.expYear = "Enter the expiry year";
    else if (!/^\d{4}$/.test(expYear) || yearNum < currentYear)
      e.expYear = "Enter the expiry year";
    else if (yearNum === currentYear && monthNum < currentMonth)
      e.expMonth = "This card has expired";

    if (!cvv) e.cvv = "Enter the CVV/CVC";
    else if (!/^\d{3,4}$/.test(cvv)) e.cvv = "Enter the CVV/CVC";

    return e;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  function handleSubmit() {
    const allTouched = { firstName: true, surname: true, cardNumber: true, expMonth: true, expYear: true, cvv: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // proceed with payment
    }
  }

  const inputClass = (field: keyof CardErrors) =>
    `w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 transition-all ${
      touched[field] && errors[field]
        ? "ring-2 ring-red-400 border border-red-300"
        : "focus:ring-orange-400"
    }`;

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
            {/* LEFT */}
            <div className="space-y-8">
              {/* 1. Billing cycle */}
              <section>
                <h3 className="text-base font-bold text-zinc-700 mb-4">1. Billing cycle</h3>
                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      billing === "yearly" ? "border-orange-500" : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input type="radio" name="billing" className="mt-0.5 accent-orange-500" checked={billing === "yearly"} onChange={() => setBilling("yearly")} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-700">Yearly billing</span>
                        <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded">50% YEARLY DISCOUNT</span>
                      </div>
                      <p className="text-[12px] text-zinc-500 mt-0.5">{config.yearlyTotal}, that's {config.yearlyMonthly}</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      billing === "monthly" ? "border-orange-500" : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <input type="radio" name="billing" className="mt-0.5 accent-orange-500" checked={billing === "monthly"} onChange={() => setBilling("monthly")} />
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
                  {/* Apple Pay */}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${payment === "apple" ? "border-orange-500" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <input type="radio" name="payment" className="accent-orange-500" checked={payment === "apple"} onChange={() => setPayment("apple")} />
                    <span className="text-sm font-medium text-zinc-700 flex-1">Apple Pay</span>
                    <span className="border border-zinc-300 rounded px-2 py-0.5 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-zinc-800">
                        <path d="M11.05 7.38c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.36.71-2.97.71-.61 0-1.56-.69-2.56-.67-1.32.02-2.54.77-3.22 1.95-1.37 2.38-.35 5.9 .98 7.83.65.94 1.42 2 2.44 1.96.98-.04 1.35-.63 2.54-.63 1.18 0 1.52.63 2.56.61 1.05-.02 1.72-.96 2.36-1.91.75-1.09 1.05-2.15 1.07-2.2-.02-.01-2.04-.79-2.03-3.17zM9.07 1.9C9.58 1.28 9.93.42 9.83-.5c-.76.03-1.68.51-2.22 1.12-.49.55-.91 1.43-.8 2.27.85.07 1.72-.43 2.26-1z"/>
                      </svg>
                      <span className="text-xs font-semibold text-zinc-800">Pay</span>
                    </span>
                  </label>

                  {/* Card */}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${payment === "card" ? "border-orange-500" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <input type="radio" name="payment" className="accent-orange-500" checked={payment === "card"} onChange={() => setPayment("card")} />
                    <span className="text-sm font-medium text-zinc-700 flex-1">Card</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-8 h-5 rounded bg-blue-700 text-white text-[8px] font-black flex items-center justify-center">VISA</span>
                      <span className="w-8 h-5 rounded bg-red-500 text-white text-[7px] font-black flex items-center justify-center">MC</span>
                      <span className="w-8 h-5 rounded bg-blue-500 text-white text-[7px] font-black flex items-center justify-center">AMEX</span>
                      <span className="w-8 h-5 rounded bg-zinc-300 text-zinc-700 text-[7px] font-black flex items-center justify-center">+more</span>
                    </div>
                  </label>

                  {/* Card fields with validation */}
                  {payment === "card" && (
                    <div className="space-y-3 px-1">
                      {/* First name */}
                      <div>
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onBlur={() => handleBlur("firstName")}
                          className={inputClass("firstName")}
                        />
                        {touched.firstName && errors.firstName && (
                          <p className="text-red-500 text-[12px] mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      {/* Surname */}
                      <div>
                        <input
                          type="text"
                          placeholder="Surname"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          onBlur={() => handleBlur("surname")}
                          className={inputClass("surname")}
                        />
                        {touched.surname && errors.surname && (
                          <p className="text-red-500 text-[12px] mt-1">{errors.surname}</p>
                        )}
                      </div>

                      {/* Card number */}
                      <div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Card number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            onBlur={() => handleBlur("cardNumber")}
                            className={`${inputClass("cardNumber")} pr-10`}
                            maxLength={19}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            {touched.cardNumber && errors.cardNumber ? (
                              <svg width="18" height="18" viewBox="0 0 20 20" fill="#ef4444">
                                <circle cx="10" cy="10" r="9" />
                                <text x="10" y="15" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">!</text>
                              </svg>
                            ) : (
                              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                <rect width="20" height="14" rx="2" fill="#E5E7EB"/>
                                <rect y="3" width="20" height="3" fill="#9CA3AF"/>
                              </svg>
                            )}
                          </span>
                        </div>
                        {touched.cardNumber && errors.cardNumber && (
                          <p className="text-red-500 text-[12px] mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      {/* Exp month / year / CVV */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Exp. month"
                              value={expMonth}
                              onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              onBlur={() => handleBlur("expMonth")}
                              className={`px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 w-full transition-all ${
                                touched.expMonth && errors.expMonth ? "ring-2 ring-red-400" : "focus:ring-orange-400"
                              }`}
                            />
                            {touched.expMonth && errors.expMonth && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                                  <circle cx="10" cy="10" r="9" />
                                  <text x="10" y="15" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">!</text>
                                </svg>
                              </span>
                            )}
                          </div>
                          {touched.expMonth && errors.expMonth && (
                            <p className="text-red-500 text-[11px] mt-1 leading-tight">{errors.expMonth}</p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Exp. year"
                              value={expYear}
                              onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              onBlur={() => handleBlur("expYear")}
                              className={`px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 w-full transition-all ${
                                touched.expYear && errors.expYear ? "ring-2 ring-red-400" : "focus:ring-orange-400"
                              }`}
                            />
                            {touched.expYear && errors.expYear && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                                  <circle cx="10" cy="10" r="9" />
                                  <text x="10" y="15" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">!</text>
                                </svg>
                              </span>
                            )}
                          </div>
                          {touched.expYear && errors.expYear && (
                            <p className="text-red-500 text-[11px] mt-1 leading-tight">{errors.expYear}</p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="CVV"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              onBlur={() => handleBlur("cvv")}
                              className={`px-3 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 w-full transition-all ${
                                touched.cvv && errors.cvv ? "ring-2 ring-red-400" : "focus:ring-orange-400"
                              }`}
                            />
                            {touched.cvv && errors.cvv && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                                  <circle cx="10" cy="10" r="9" />
                                  <text x="10" y="15" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">!</text>
                                </svg>
                              </span>
                            )}
                          </div>
                          {touched.cvv && errors.cvv && (
                            <p className="text-red-500 text-[11px] mt-1 leading-tight">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      {/* Country */}
                      <select className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-orange-400 appearance-none">
                        <option value="">Billing Country</option>
                        <option value="EG">Egypt</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="AE">UAE</option>
                      </select>

                      {/* Postcode */}
                      <input type="text" placeholder="Postcode (optional)" className="w-full px-4 py-3 rounded-xl bg-zinc-100 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-orange-400" />

                      {/* Billing address checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                        <span className="text-[13px] text-zinc-600">Add billing address (visible on invoice)</span>
                      </label>
                    </div>
                  )}

                  {/* PayPal */}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${payment === "paypal" ? "border-orange-500" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <input type="radio" name="payment" className="accent-orange-500" checked={payment === "paypal"} onChange={() => setPayment("paypal")} />
                    <span className="text-sm font-medium text-zinc-700 flex-1">PayPal</span>
                    <span className="text-[#003087] font-black text-base italic">
                      Pay<span className="text-[#009cde]">Pal</span>
                    </span>
                  </label>

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

              <div className="flex items-center gap-3 mb-4">
                <img src={soundcloudImg} alt="Artist" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <span className="text-base font-bold text-zinc-700">{config.name}</span>
              </div>

              <button className="text-[13px] text-blue-600 hover:underline mb-4 block">
                Do you have a coupon code?
              </button>

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
                  {billing === "yearly" ? "year" : "month"}, starting {renewDateStr}, unless you cancel before the day of your next renewal in your subscription settings.
                </p>
                <p className="text-[11px] text-zinc-400">All prices in EGP</p>
              </div>

              {payment === "apple" ? (
                <button className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors mb-3 flex items-center justify-center gap-1 tracking-tight">
                  Continue with
                  <span className="flex items-center gap-0.5">
                    <svg width="16" height="16" viewBox="1 1 14 14" fill="white">
                      <path d="M11.05 7.38c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.36.71-2.97.71-.61 0-1.56-.69-2.56-.67-1.32.02-2.54.77-3.22 1.95-1.37 2.38-.35 5.9.98 7.83.65.94 1.42 2 2.44 1.96.98-.04 1.35-.63 2.54-.63 1.18 0 1.52.63 2.56.61 1.05-.02 1.72-.96 2.36-1.91.75-1.09 1.05-2.15 1.07-2.2-.02-.01-2.04-.79-2.03-3.17zM9.07 1.9C9.58 1.28 9.93.42 9.83-.5c-.76.03-1.68.51-2.22 1.12-.49.55-.91 1.43-.8 2.27.85.07 1.72-.43 2.26-1z"/>
                    </svg>
                    Pay
                  </span>
                </button>
              ) : payment === "paypal" ? (
                <button className="w-full py-3.5 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm font-bold rounded-lg transition-colors mb-3 flex items-center justify-center gap-2">
                  <span className="font-black italic text-base">
                    <span className="text-white">Pay</span><span className="text-[#70d0f6]">Pal</span>
                  </span>
                  Continue with PayPal
                </button>
              ) : (
                <button
                  onClick={payment === "card" ? handleSubmit : undefined}
                  className="w-full py-3.5 bg-zinc-500 hover:bg-zinc-600 text-white text-sm font-bold rounded-lg transition-colors mb-3"
                >
                  Buy subscription
                </button>
              )}

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                By submitting your payment information and clicking{" "}
                {payment === "apple" ? "Continue with Apple Pay" : payment === "paypal" ? "Continue with PayPal" : "Buy subscription"}{" "}
                you agree to the{" "}
                <a href="#" className="underline text-zinc-600">Terms of Use for Artist Subscriptions</a>{" "}
                and{" "}
                <a href="#" className="underline text-zinc-600">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
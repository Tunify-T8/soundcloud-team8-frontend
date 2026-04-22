import { useEffect, useRef, useState } from "react";
import { Upload, Zap, Share2, RefreshCw, Plus, Star, Check } from "lucide-react";
import { MdEqualizer } from "react-icons/md";
import { useMe } from "@/features/profile/context/useMe";
import { useLocation } from "react-router-dom";
import soundcloudImg from "@/assets/graysound.png";
import CheckoutModal from "../components/CheckoutModal";

const sections = [
  {
    title: "Get heard",
    rows: [
      {
        name: "Promote tracks",
        desc: "Our algorithm analyzes and recommends your tracks to 100 to even 1000 listeners most likely to love it.",
        basic: null,
        artist: "2 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Get playlisted",
        desc: "Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more",
        basic: null,
        artist: "2 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Distribute and get paid",
        desc: "Earn royalties from 60+ social and streaming platforms like Spotify and TikTok",
        basic: null,
        artist: "2 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Advanced audience stats",
        desc: "See how listeners found your music, your top fans, and where they're located",
        basic: null,
        artist: "How fans found you",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Comments hub",
        desc: "Effectively track and answer messages and comments",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
    ],
  },
  {
    title: "Manage your music",
    rows: [
      {
        name: "Upload limit",
        desc: "",
        basic: "2 hours",
        artist: "3 hours",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Free mastering credits",
        desc: "",
        basic: null,
        artist: "1 track / month",
        pro: "3 tracks / month",
        proHighlight: true,
      },
      {
        name: "Replace tracks",
        desc: "Swap out your track files without losing plays, likes or comments.",
        basic: null,
        artist: "3 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Quiet mode",
        desc: "Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
      {
        name: "Schedule track releases",
        desc: "",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
    ],
  },
  {
    title: "Build your brand",
    rows: [
      {
        name: "Profile badge",
        desc: "Visible to fans and collaborators.",
        basic: null,
        artist: "badge-artist",
        pro: "badge-pro",
        proHighlight: false,
      },
      {
        name: "Spotlight",
        desc: "Have control over your first impression by spotlighting your best tracks at the top of your profile.",
        basic: null,
        artist: "1 track",
        pro: "5 tracks",
        proHighlight: true,
      },
    ],
  },
  {
    title: "Get paid",
    rows: [
      {
        name: "Monetize on SoundCloud",
        desc: "Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.",
        basic: null,
        artist: "2 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "Distribute and monetize on 60+ other platforms",
        desc: "Get paid regularly for streams on Spotify, Apple Music, TikTok and more, and keep 100% of your earnings.",
        basic: null,
        artist: "2 tracks / month",
        pro: "Unlimited",
        proHighlight: true,
      },
      {
        name: "YouTube Content ID",
        desc: "Get paid when your music is used in YouTube videos",
        basic: null,
        artist: "available",
        pro: "available",
        proHighlight: false,
      },
      {
        name: "Split royalties",
        desc: "Make sure your collaborators get paid",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
    ],
  },
  {
    title: "Special treatment",
    rows: [
      {
        name: "Priority support",
        desc: "",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
      {
        name: "Get 50% off Go+",
        desc: "",
        basic: null,
        artist: null,
        pro: "available",
        proHighlight: true,
      },
      {
        name: "Exclusive Partner Savings",
        desc: "Exclusive offers & discounts from partners like Groover, Serato, and Tracklib.",
        basic: null,
        artist: "Partial access",
        pro: "Full access",
        proHighlight: true,
      },
    ],
  },
];

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ value, highlight }: { value: string | null; highlight?: boolean }) {
  if (value === null) {
    return <span className="text-zinc-400 text-[13px]">Not Available –</span>;
  }
  if (value === "available") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${highlight ? "text-[#1db954]" : "text-zinc-700"}`}>
        Available
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${highlight ? "bg-[#1db954]" : "bg-zinc-700"}`}>
          <Check size={11} className="text-white" strokeWidth={3} />
        </span>
      </span>
    );
  }
  if (value === "badge-artist") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-black bg-[#ebe9fd] px-2.5 py-1 rounded-full">
        <Plus size={11} strokeWidth={3} />
        ARTIST
      </span>
    );
  }
  if (value === "badge-pro") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-black bg-[#fdf3d7] px-2.5 py-1 rounded-full">
        <Star size={11} fill="#c9a227" />
        ARTIST PRO
      </span>
    );
  }
  return (
    <span className={`text-[13px] font-medium ${highlight ? "text-[#1db954]" : "text-zinc-700"}`}>
      {value}
    </span>
  );
}



export default function PlansPage() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const { me } = useMe();
  const location = useLocation();
  const plansRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<"artist" | "artist-pro">("artist-pro");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Stand out with Artist Pro";
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    if (location.hash !== "#plans-comparison") return;

    const frame = window.requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 h-[52px] border-b border-white/5 bg-[#373434]">
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-6">
          <div className="flex items-center gap-2.5">
            <img
              src={soundcloudImg}
              alt="SoundCloud"
              className="h-[20px] w-[54px] object-cover object-center"
            />
            <span className="text-[15px] font-semibold tracking-[0.08em] text-white uppercase">SoundCloud</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs font-semibold text-white">
                  {me?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[13px] font-medium text-zinc-100">{me?.username}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section 
       className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%),
            #111
          `,
        }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect x='320' y='20' width='180' height='120' rx='8' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Crect x='330' y='30' width='160' height='100' rx='4' fill='%231a1a1a'/%3E%3Ccircle cx='370' cy='80' r='20' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Ccircle cx='430' cy='80' r='20' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Ccircle cx='490' cy='80' r='15' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Crect x='50' y='200' width='500' height='80' rx='6' fill='none' stroke='%23333' stroke-width='1'/%3E%3Crect x='60' y='210' width='8' height='60' rx='2' fill='%23222'/%3E%3Crect x='80' y='215' width='8' height='50' rx='2' fill='%23222'/%3E%3Crect x='100' y='205' width='8' height='65' rx='2' fill='%23222'/%3E%3Crect x='120' y='220' width='8' height='40' rx='2' fill='%23222'/%3E%3Ccircle cx='450' cy='350' r='80' fill='none' stroke='%23333' stroke-width='2'/%3E%3Ccircle cx='450' cy='350' r='55' fill='none' stroke='%232a2a2a' stroke-width='1.5'/%3E%3Ccircle cx='450' cy='350' r='20' fill='%231a1a1a' stroke='%23444' stroke-width='1.5'/%3E%3Cpath d='M 200 300 Q 250 280 300 300 Q 350 320 400 300' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain",
            opacity: 0.6,
          }}
        />
       {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-left">   {/* ← left-aligned like screenshot 2 */}
          <h1 className="text-[92px] font-black leading-none tracking-tight text-white mb-5">
            Reach more listeners.
          </h1>
          <div className="flex items-center gap-2 mb-10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black" />
            </div>
            <p className="text-zinc-300 text-[16px]">Join millions of artists that use SoundCloud to get heard.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-white text-zinc-900 font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-zinc-100 transition-colors"
             onClick={
              () => {
                setCheckoutPlan("artist-pro"); 
                setCheckoutOpen(true);
                document.title = "Get Artist Pro";
              } 
            }
              >
              Get Artist Pro
            </button>
           <button
              onClick={scrollToPlans}
              className="border border-zinc-600 text-white font-bold text-[14px] px-6 py-3 rounded-full hover:border-zinc-400 transition-colors"
            >
                See all plans
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative max-w-5xl mx-auto px-6 pb-20 grid grid-cols-4 gap-8">
          {[
            { icon: "◎", title: "Grow your audience", desc: "Artist Pro subscribers get on average 400% more listens, thanks to our audio algorithm and featured playlists." },
            { icon: "▨", title: "Know your audience", desc: "Get advanced fan insights and custom listening reports to build connections and plan promotions, releases, and tours." },
            { icon: "∞", title: "Upload unlimited tracks", desc: "Upload and replace unlimited tracks without losing your plays, likes, and comments." },
            { icon: "↑↓", title: "Distribution is included", desc: "Distribute and get paid on SoundCloud and 60+ platforms including Spotify, Apple Music, and TikTok." },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-2xl text-zinc-400 mb-3 font-mono">{f.icon}</div>
              <h3 className="text-white text-[15px] mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Plans */}
      <section ref={plansRef} className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-zinc-900 font-semibold text-[52px] tracking-tight mb-14 text-center">
            Available plans.
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Artist */}
            <div className="border border-zinc-200 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-zinc-900 font-semibold text-[25px]">Artist</h3>
                <div className="w-6 h-6 rounded-full bg-[#5b4ff5] flex items-center justify-center">
                  <Plus size={13} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-zinc-500 text-[13px] mb-6">Tailored access to essential artist tools</p>

              <div className="mb-1">
                <span className="text-2xl font-semibold text-[#5b4ff5]">EGP 29.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month, billed yearly for EGP 359.88</span>
              </div>

              <button className="w-full mt-6 mb-6 py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[14px] rounded-xl transition-colors"
              onClick={
              () => {
                setCheckoutPlan("artist"); 
                setCheckoutOpen(true);
                document.title = "Get Artist";
              } 
            }>
                Get started
              </button>

              <ul className="space-y-4">
                {[
                  { icon: <Upload size={15} />, label: "3 hours of uploads" },
                  { icon: <Zap size={15} />, label: "Boost tracks and get 100+ listeners", badge: "2X MONTH", blue: true },
                  { icon: <Share2 size={15} />, label: "Distribute & monetize tracks", badge: "2X MONTH", blue: true },
                  { icon: <RefreshCw size={15} />, label: "Replace tracks without losing stats", badge: "3X MONTH", blue: true },
                  { icon: <MdEqualizer size={15} />, label: "AI Mastering", badge: "1X MONTH", blue: true },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-[13px] text-zinc-700">
                    <span className="text-zinc-400 flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ebe9fd] text-[#5b4ff5]">
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Artist Pro */}
            <div className="border-2 border-[#c9a227] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#c9a227] text-white text-[10px] font-semibold tracking-widest px-5 py-2 rounded-bl-xl rounded-tr-2xl">
                MOST POPULAR
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-zinc-900 font-semibold text-[25px]">Artist Pro</h3>
                <div className="w-6 h-6 rounded-full bg-[#c9a227] flex items-center justify-center">
                  <Star size={11} className="text-white" fill="white" />
                </div>
              </div>
              <p className="text-zinc-500 text-[13px] mb-6">Unlimited access to all artist tools</p>

              <div className="mb-1">
                <span className="text-2xl font-semibold text-[#c9a227]">EGP 74.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month, billed yearly for EGP 899.88</span>
              </div>

              <button className="w-full mt-6 mb-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-[14px] rounded-xl transition-colors"
              onClick={
              () => {
                setCheckoutPlan("artist-pro"); 
                setCheckoutOpen(true);
                document.title = "Get Artist Pro";
              } 
            }>
                Get started
              </button>

              <ul className="space-y-4">
                {[
                  { icon: <Upload size={15} />, label: "Unlimited uploads" },
                  { icon: <Zap size={15} />, label: "Boost tracks and get 100+ listeners", badge: "UNLIMITED", gold: true },
                  { icon: <Share2 size={15} />, label: "Distribute & monetize tracks", badge: "UNLIMITED", gold: true },
                  { icon: <RefreshCw size={15} />, label: "Replace tracks without losing stats", badge: "UNLIMITED", gold: true },
                  { icon: <MdEqualizer size={15} />, label: "AI Mastering", badge: "3X MONTH", gold: true },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-[13px] text-zinc-700">
                    <span className="text-zinc-400 flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#fdf3d7] text-[#c9a227]">
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-5 text-center border-t border-zinc-100 pt-4">
                <div className="text-[13px] text-zinc-500 mb-2 font-medium">AND MORE</div>
                <ul className="space-y-3">
                  {["Audience stats and insights", "Community management tools"].map((extra) => (
                    <li key={extra} className="flex items-center gap-2.5 text-[13px] text-zinc-700">
                      <span className="text-zinc-400 flex-shrink-0"><Check size={14} /></span>
                      {extra}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare features */}
      <section
        ref={comparisonRef}
        id="plans-comparison"
        className="scroll-mt-20 bg-white pb-24"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-zinc-900 font-semibold text-[52px] tracking-tight mb-14 text-center">
            Compare features.
          </h2>

          {/* Sticky header */}
          <div className="sticky top-[52px] z-20 bg-white pt-4 pb-2 border-b border-zinc-200 mb-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
              <div />
              <div className="text-center">
                <div className="text-zinc-900 font-semibold text-[30px]">Basic</div>
                <div className="text-zinc-500 text-[13px]">Free</div>
                <div className="mt-3">
                  <span className="text-[12px] text-zinc-500 border border-zinc-300 rounded-full px-4 py-1.5 font-medium">
                    Current plan
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-zinc-900 font-semibold text-[30px]">Artist</div>
                <div className="text-zinc-500 text-[13px]">EGP 29.99 <span className="text-[11px]">/month, billed yearly for EGP 359.88</span></div>
                <button className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[12px] px-5 py-2 rounded-full transition-colors"
                onClick={
                  () => {
                    setCheckoutPlan("artist"); 
                    setCheckoutOpen(true);
                    document.title = "Get Artist";
                  } 
                }>
                  Get started
                </button>
              </div>
              <div className="text-center">
                <div className="text-zinc-900 font-semibold text-[30px]">Artist Pro</div>
                <div className="text-[#1db954] text-[13px] font-medium">EGP 74.99 <span className="text-[11px] text-zinc-500">/month, billed yearly for EGP 899.88</span></div>
                <button className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[12px] px-5 py-2 rounded-full transition-colors"
                onClick={
                  () => {
                    setCheckoutPlan("artist-pro"); 
                    setCheckoutOpen(true);
                    document.title = "Get Artist Pro";
                  } 
                }>
                  Get started
                </button>
              </div>
            </div>
          </div>

          {/* Feature rows */}
          {sections.map((section) => (
            <div key={section.title} className="mt-10">
              <h3 className="text-zinc-900 font-black text-[20px] mb-4">{section.title}</h3>
              <div className="border-t border-zinc-200">
                {section.rows.map((row) => {
                  const rowKey = section.title + row.name;
                  const isHovered = hoveredRow === rowKey;
                  return (
                    <div
                      key={row.name}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr] py-4 border-b border-zinc-200 transition-colors duration-150 cursor-default ${isHovered ? "bg-zinc-100" : ""}`}
                      onMouseEnter={() => setHoveredRow(rowKey)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <div className="pr-6">
                        <div className="text-zinc-900 font-bold text-[14px]">{row.name}</div>
                        {row.desc && <div className="text-zinc-500 text-[12px] mt-0.5 leading-relaxed">{row.desc}</div>}
                      </div>
                      <div className="flex items-center justify-center">
                        <Cell value={row.basic} highlight={false} />
                      </div>
                      <div className="flex items-center justify-center">
                        <Cell value={row.artist} highlight={false} />
                      </div>
                      <div className="flex items-center justify-center">
                        <Cell value={row.pro} highlight={row.proHighlight} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      {checkoutOpen && <CheckoutModal plan = {checkoutPlan} onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

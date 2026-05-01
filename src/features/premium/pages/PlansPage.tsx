import { useEffect, useRef, useState } from "react";
import { Upload, Zap, Share2, RefreshCw, Plus, Star, Check, ChevronDown, Menu, X } from "lucide-react";
import { MdEqualizer } from "react-icons/md";
import { useMe } from "@/features/profile/context/useMe";
import { useLocation, useNavigate } from "react-router-dom";
import soundcloudImg from "@/assets/graysound.png";
import CheckoutModal from "../components/CheckoutModal";
import { clearClientSessionData, logout } from "@/features/auth/services";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useDispatch } from "react-redux";
import { clearUser } from "@/store/userSlice";

const sections = [
  {
    title: "Get heard",
    rows: [
      { name: "Promote tracks", desc: "Our algorithm analyzes and recommends your tracks to 100 to even 1000 listeners most likely to love it.", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "Get playlisted", desc: "Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "Distribute and get paid", desc: "Earn royalties from 60+ social and streaming platforms like Spotify and TikTok", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "Advanced audience stats", desc: "See how listeners found your music, your top fans, and where they're located", basic: null, artist: "How fans found you", pro: "Unlimited", proHighlight: true },
      { name: "Comments hub", desc: "Effectively track and answer messages and comments", basic: null, artist: null, pro: "available", proHighlight: true },
    ],
  },
  {
    title: "Manage your music",
    rows: [
      { name: "Upload limit", desc: "", basic: "2 hours", artist: "3 hours", pro: "Unlimited", proHighlight: true },
      { name: "Free mastering credits", desc: "", basic: null, artist: "1 track / month", pro: "3 tracks / month", proHighlight: true },
      { name: "Replace tracks", desc: "Swap out your track files without losing plays, likes or comments.", basic: null, artist: "3 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "Quiet mode", desc: "Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.", basic: null, artist: null, pro: "available", proHighlight: true },
      { name: "Schedule track releases", desc: "", basic: null, artist: null, pro: "available", proHighlight: true },
    ],
  },
  {
    title: "Build your brand",
    rows: [
      { name: "Profile badge", desc: "Visible to fans and collaborators.", basic: null, artist: "badge-artist", pro: "badge-pro", proHighlight: false },
      { name: "Spotlight", desc: "Have control over your first impression by spotlighting your best tracks at the top of your profile.", basic: null, artist: "1 track", pro: "5 tracks", proHighlight: true },
    ],
  },
  {
    title: "Get paid",
    rows: [
      { name: "Monetize on SoundCloud", desc: "Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "Distribute and monetize on 60+ other platforms", desc: "Get paid regularly for streams on Spotify, Apple Music, TikTok and more, and keep 100% of your earnings.", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "YouTube Content ID", desc: "Get paid when your music is used in YouTube videos", basic: null, artist: "available", pro: "available", proHighlight: false },
      { name: "Split royalties", desc: "Make sure your collaborators get paid", basic: null, artist: null, pro: "available", proHighlight: true },
    ],
  },
  {
    title: "Special treatment",
    rows: [
      { name: "Priority support", desc: "", basic: null, artist: null, pro: "available", proHighlight: true },
      { name: "Get 50% off Go+", desc: "", basic: null, artist: null, pro: "available", proHighlight: true },
      { name: "Exclusive Partner Savings", desc: "Exclusive offers & discounts from partners like Groover, Serato, and Tracklib.", basic: null, artist: "Partial access", pro: "Full access", proHighlight: true },
    ],
  },
];

function Cell({ value, highlight }: { value: string | null; highlight?: boolean }) {
  if (value === null) return <span className="text-zinc-400 text-[13px]">–</span>;
  if (value === "available") return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${highlight ? "text-[#1db954]" : "text-zinc-700"}`}>
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${highlight ? "bg-[#1db954]" : "bg-zinc-700"}`}>
        <Check size={11} className="text-white" strokeWidth={3} />
      </span>
      <span className="hidden sm:inline">Available</span>
    </span>
  );
  if (value === "badge-artist") return (
    <span className="inline-flex items-center gap-1 text-[11px] text-black bg-[#ebe9fd] px-2 py-1 rounded-full">
      <Plus size={10} strokeWidth={3} /><span className="hidden sm:inline">ARTIST</span>
    </span>
  );
  if (value === "badge-pro") return (
    <span className="inline-flex items-center gap-1 text-[11px] text-black bg-[#fdf3d7] px-2 py-1 rounded-full">
      <Star size={10} fill="#c9a227" /><span className="hidden sm:inline">PRO</span>
    </span>
  );
  return <span className={`text-[12px] sm:text-[13px] font-medium text-center leading-tight ${highlight ? "text-[#1db954]" : "text-zinc-700"}`}>{value}</span>;
}

// Mobile comparison: tabs per plan
function MobileComparison({ onCheckout }: { onCheckout: (plan: "artist" | "artist-pro") => void }) {
  const [activeTab, setActiveTab] = useState<"basic" | "artist" | "artist-pro">("artist-pro");

  const tabs = [
    { key: "basic", label: "Basic", sub: "Free" },
    { key: "artist", label: "Artist", sub: "EGP 29.99/mo" },
    { key: "artist-pro", label: "Artist Pro", sub: "EGP 74.99/mo" },
  ] as const;

  function getVal(row: typeof sections[0]["rows"][0]) {
    if (activeTab === "basic") return row.basic;
    if (activeTab === "artist") return row.artist;
    return row.pro;
  }

  return (
    <div className="md:hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-zinc-200 mb-6 sticky top-[52px] bg-white z-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-400"
            }`}
          >
            <div className="text-[13px] font-bold">{tab.label}</div>
            <div className="text-[11px]">{tab.sub}</div>
          </button>
        ))}
      </div>

      {/* CTA */}
      {activeTab !== "basic" && (
        <button
          onClick={() => onCheckout(activeTab as "artist" | "artist-pro")}
          className="w-full mb-6 py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[14px] rounded-xl transition-colors"
        >
          Get started
        </button>
      )}

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-zinc-900 font-semibold text-[16px] mb-3 px-1">{section.title}</h3>
          <div className="border-t border-zinc-200">
            {section.rows.map((row) => {
              const val = getVal(row);
              return (
                <div key={row.name} className="flex items-start justify-between py-3 border-b border-zinc-100 gap-3">
                  <div className="flex-1">
                    <div className="text-zinc-900 font-semibold text-[13px]">{row.name}</div>
                    {row.desc && <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{row.desc}</div>}
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-end min-w-[80px]">
                    <Cell value={val} highlight={activeTab === "artist-pro" && row.proHighlight} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlansPage() {
  const dispatch = useDispatch();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { me } = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsPlaying } = usePlayer();
  const plansRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<"artist" | "artist-pro">("artist-pro");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function openCheckout(plan: "artist" | "artist-pro") {
    setCheckoutPlan(plan);
    setCheckoutOpen(true);
    document.title = plan === "artist-pro" ? "Get Artist Pro" : "Get Artist";
  }

  useEffect(() => {
    const prev = document.title;
    document.title = "Stand out with Artist Pro";
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.hash !== "#plans-comparison") return;
    const frame = window.requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  useEffect(() => {
    if (location.hash !== "#available-plans") return;
    const frame = window.requestAnimationFrame(() => {
      plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  const scrollToPlans = () => plansRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSignOut = async () => {
    setIsPlaying(false);
    try { await logout(); } catch {}
    dispatch(clearUser());
    clearClientSessionData();
    navigate("/signed-out", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 h-[52px] border-b border-white/5 bg-[#3a3838]">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={soundcloudImg} alt="SoundCloud" className="h-[18px] w-[48px] sm:h-[20px] sm:w-[54px] object-cover object-center" />
            <span className="hidden sm:block text-[15px] font-semibold tracking-[0.08em] text-white uppercase">SoundCloud</span>
          </div>

          {/* Desktop: avatar + name */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
              {me?.avatarUrl
                ? <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : <span className="text-xs font-semibold text-white">{(me?.displayName || me?.username)?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button type="button" onClick={() => setProfileMenuOpen((v) => !v)} className="group flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-zinc-200 group-hover:text-white">{me?.displayName || me?.username}</span>
                <ChevronDown size={14} className={`text-zinc-300 transition-all duration-200 group-hover:text-white ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 min-w-[150px] border border-white/5 bg-[#121212] py-2 shadow-2xl">
                  <button type="button" onClick={handleSignOut} className="block w-full px-4 py-2 text-left text-[14px] text-white/90 hover:bg-white/5 hover:text-white transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: hamburger */}
          <button className="sm:hidden p-1 text-zinc-300 hover:text-white" onClick={() => setMobileNavOpen((v) => !v)}>
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="sm:hidden absolute top-[52px] left-0 right-0 bg-[#2a2a2a] border-b border-white/10 px-4 py-4 space-y-3 z-50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/15">
                {me?.avatarUrl
                  ? <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  : <span className="text-xs font-semibold text-white">{(me?.displayName || me?.username)?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <span className="text-sm font-medium text-white">{me?.displayName || me?.username}</span>
            </div>
            <button type="button" onClick={handleSignOut} className="block w-full text-left text-[14px] text-zinc-300 hover:text-white py-1 transition-colors">
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), #111" }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect x='320' y='20' width='180' height='120' rx='8' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Crect x='330' y='30' width='160' height='100' rx='4' fill='%231a1a1a'/%3E%3Ccircle cx='370' cy='80' r='20' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Ccircle cx='430' cy='80' r='20' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Ccircle cx='490' cy='80' r='15' fill='none' stroke='%23444' stroke-width='1.5'/%3E%3Crect x='50' y='200' width='500' height='80' rx='6' fill='none' stroke='%23333' stroke-width='1'/%3E%3Crect x='60' y='210' width='8' height='60' rx='2' fill='%23222'/%3E%3Crect x='80' y='215' width='8' height='50' rx='2' fill='%23222'/%3E%3Crect x='100' y='205' width='8' height='65' rx='2' fill='%23222'/%3E%3Crect x='120' y='220' width='8' height='40' rx='2' fill='%23222'/%3E%3Ccircle cx='450' cy='350' r='80' fill='none' stroke='%23333' stroke-width='2'/%3E%3Ccircle cx='450' cy='350' r='55' fill='none' stroke='%232a2a2a' stroke-width='1.5'/%3E%3Ccircle cx='450' cy='350' r='20' fill='%231a1a1a' stroke='%23444' stroke-width='1.5'/%3E%3Cpath d='M 200 300 Q 250 280 300 300 Q 350 320 400 300' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain",
            opacity: 0.6,
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <h1 className="text-[48px] sm:text-[72px] lg:text-[92px] font-black leading-none tracking-tight text-white mb-5">
            Reach more listeners.
          </h1>
          <div className="flex items-center gap-2 mb-8 sm:mb-10">
            <div className="flex -space-x-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-600 border-2 border-black" />
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-500 border-2 border-black" />
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-700 border-2 border-black" />
            </div>
            <p className="text-zinc-300 text-[14px] sm:text-[16px]">Join millions of artists that use SoundCloud to get heard.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => openCheckout("artist-pro")}
              className="bg-white text-zinc-900 font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-zinc-100 transition-colors text-center"
            >
              Get Artist Pro
            </button>
            <button
              onClick={scrollToPlans}
              className="border border-zinc-600 text-white font-bold text-[14px] px-6 py-3 rounded-full hover:border-zinc-400 transition-colors text-center"
            >
              See all plans
            </button>
          </div>
        </div>

        {/* Feature highlights — 2 cols on mobile, 4 on desktop */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-40 sm:pb-45 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: "◎", title: "Grow your audience", desc: "Artist Pro subscribers get on average 400% more listens, thanks to our audio algorithm and featured playlists." },
            { icon: "▨", title: "Know your audience", desc: "Get advanced fan insights and custom listening reports to build connections and plan promotions, releases, and tours." },
            { icon: "∞", title: "Upload unlimited tracks", desc: "Upload and replace unlimited tracks without losing your plays, likes, and comments." },
            { icon: "↑↓", title: "Distribution is included", desc: "Distribute and get paid on SoundCloud and 60+ platforms including Spotify, Apple Music, and TikTok." },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-xl sm:text-2xl text-zinc-400 mb-2 sm:mb-3 font-mono">{f.icon}</div>
              <h3 className="text-white text-[14px] sm:text-[15px] mb-1 sm:mb-2 font-semibold">{f.title}</h3>
              <p className="text-zinc-500 text-[12px] sm:text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Available Plans ── */}
      <section id="available-plans" ref={plansRef} className="scroll-mt-20 bg-white py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-zinc-900 font-semibold text-[36px] sm:text-[52px] tracking-tight mb-10 sm:mb-14 text-center">
            Available plans.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Artist */}
            <div className="border border-zinc-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-zinc-900 font-semibold text-[22px] sm:text-[25px]">Artist</h3>
                <div className="w-6 h-6 rounded-full bg-[#5b4ff5] flex items-center justify-center">
                  <Plus size={13} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-zinc-500 text-[13px] mb-5">Tailored access to essential artist tools</p>
              <div className="mb-1">
                <span className="text-xl sm:text-2xl font-semibold text-[#5b4ff5]">EGP 29.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month</span>
              </div>
              <p className="text-zinc-400 text-[12px] mb-5">billed yearly for EGP 359.88</p>
              <button
                onClick={() => openCheckout("artist")}
                className="w-full mt-2 mb-6 py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[14px] rounded-xl transition-colors"
              >
                Get started
              </button>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  { icon: <Upload size={15} />, label: "3 hours of uploads" },
                  { icon: <Zap size={15} />, label: "Boost tracks and get 100+ listeners", badge: "2X MONTH", blue: true },
                  { icon: <Share2 size={15} />, label: "Distribute & monetize tracks", badge: "2X MONTH", blue: true },
                  { icon: <RefreshCw size={15} />, label: "Replace tracks without losing stats", badge: "3X MONTH", blue: true },
                  { icon: <MdEqualizer size={15} />, label: "AI Mastering", badge: "1X MONTH", blue: true },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-[13px] text-zinc-700">
                    <span className="text-zinc-400 flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-[12px] sm:text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ebe9fd] text-[#5b4ff5] flex-shrink-0">{item.badge}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Artist Pro */}
            <div className="border-2 border-[#c9a227] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#c9a227] text-white text-[10px] font-semibold tracking-widest px-4 py-2 rounded-bl-xl rounded-tr-2xl">
                MOST POPULAR
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-zinc-900 font-semibold text-[22px] sm:text-[25px]">Artist Pro</h3>
                <div className="w-6 h-6 rounded-full bg-[#c9a227] flex items-center justify-center">
                  <Star size={11} className="text-white" fill="white" />
                </div>
              </div>
              <p className="text-zinc-500 text-[13px] mb-5">Unlimited access to all artist tools</p>
              <div className="mb-1">
                <span className="text-xl sm:text-2xl font-semibold text-[#c9a227]">EGP 74.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month</span>
              </div>
              <p className="text-zinc-400 text-[12px] mb-5">billed yearly for EGP 899.88</p>
              <button
                onClick={() => openCheckout("artist-pro")}
                className="w-full mt-2 mb-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-[14px] rounded-xl transition-colors"
              >
                Get started
              </button>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  { icon: <Upload size={15} />, label: "Unlimited uploads" },
                  { icon: <Zap size={15} />, label: "Boost tracks and get 100+ listeners", badge: "UNLIMITED", gold: true },
                  { icon: <Share2 size={15} />, label: "Distribute & monetize tracks", badge: "UNLIMITED", gold: true },
                  { icon: <RefreshCw size={15} />, label: "Replace tracks without losing stats", badge: "UNLIMITED", gold: true },
                  { icon: <MdEqualizer size={15} />, label: "AI Mastering", badge: "3X MONTH", gold: true },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-zinc-700">
                    <span className="text-zinc-400 flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-[12px] sm:text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#fdf3d7] text-[#c9a227] flex-shrink-0">{item.badge}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-zinc-100 pt-4">
                <div className="text-[13px] text-zinc-500 mb-2 font-medium text-center">AND MORE</div>
                <ul className="space-y-3">
                  {["Audience stats and insights", "Community management tools"].map((extra) => (
                    <li key={extra} className="flex items-center gap-2.5 text-[12px] sm:text-[13px] text-zinc-700">
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

      {/* ── Compare features ── */}
      <section ref={comparisonRef} id="plans-comparison" className="scroll-mt-20 bg-white pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-zinc-900 font-semibold text-[36px] sm:text-[52px] tracking-tight mb-10 sm:mb-14 text-center">
            Compare features.
          </h2>

          {/* Mobile comparison (tabs) */}
          <MobileComparison onCheckout={openCheckout} />

          {/* Desktop comparison table */}
          <div className="hidden md:block">
            {/* Sticky header */}
            <div className="sticky top-[52px] z-20 bg-white pt-4 pb-2 border-b border-zinc-200">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
                <div />
                <div className="text-center px-2">
                  <div className="text-zinc-900 font-semibold text-[24px] lg:text-[30px]">Basic</div>
                  <div className="text-zinc-500 text-[13px]">Free</div>
                  <div className="mt-3">
                    <span className="text-[12px] text-zinc-500 border border-zinc-300 rounded-full px-4 py-1.5 font-medium">Current plan</span>
                  </div>
                </div>
                <div className="text-center px-2">
                  <div className="text-zinc-900 font-semibold text-[24px] lg:text-[30px]">Artist</div>
                  <div className="text-zinc-500 text-[12px] lg:text-[13px]">EGP 29.99 <span className="text-[11px]">/mo</span></div>
                  <button
                    onClick={() => openCheckout("artist")}
                    className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[12px] px-4 py-2 rounded-full transition-colors"
                  >
                    Get started
                  </button>
                </div>
                <div className="text-center px-2">
                  <div className="text-zinc-900 font-semibold text-[24px] lg:text-[30px]">Artist Pro</div>
                  <div className="text-[#1db954] text-[12px] lg:text-[13px] font-medium">EGP 74.99 <span className="text-[11px] text-zinc-500">/mo</span></div>
                  <button
                    onClick={() => openCheckout("artist-pro")}
                    className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold text-[12px] px-4 py-2 rounded-full transition-colors"
                  >
                    Get started
                  </button>
                </div>
              </div>
            </div>

            {/* Rows */}
            {sections.map((section) => (
              <div key={section.title} className="mt-10">
                <h3 className="text-zinc-900 font-semibold text-[18px] lg:text-[20px] mb-4">{section.title}</h3>
                <div className="border-t border-zinc-200">
                  {section.rows.map((row) => {
                    const rowKey = section.title + row.name;
                    return (
                      <div
                        key={row.name}
                        className={`grid grid-cols-[2fr_1fr_1fr_1fr] py-4 border-b border-zinc-200 transition-colors duration-150 cursor-default ${hoveredRow === rowKey ? "bg-zinc-100" : ""}`}
                        onMouseEnter={() => setHoveredRow(rowKey)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <div className="pr-4 lg:pr-6">
                          <div className="text-zinc-900 font-bold text-[13px] lg:text-[14px]">{row.name}</div>
                          {row.desc && <div className="text-zinc-500 text-[11px] lg:text-[12px] mt-0.5 leading-relaxed">{row.desc}</div>}
                        </div>
                        <div className="flex items-center justify-center"><Cell value={row.basic} highlight={false} /></div>
                        <div className="flex items-center justify-center"><Cell value={row.artist} highlight={false} /></div>
                        <div className="flex items-center justify-center"><Cell value={row.pro} highlight={row.proHighlight} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white pb-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-[13px] text-zinc-600">
          <div className="border-t border-zinc-200 pt-6">
            <div className="mb-4">
              <span>Signed in as {me?.displayName || me?.username || "User"}. </span>
              <button type="button" onClick={handleSignOut} className="text-[#004cff] hover:underline">Sign out</button>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[#004cff]">
              {["Legal", "Privacy", "Cookies", "Consent Manager", "Imprint", "Help Center"].map((item, index) => (
                <div key={item} className="flex items-center gap-x-2">
                  {index > 0 && <span className="text-zinc-500">-</span>}
                  <a href="#" className="hover:underline">{item}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {checkoutOpen && <CheckoutModal plan={checkoutPlan} onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

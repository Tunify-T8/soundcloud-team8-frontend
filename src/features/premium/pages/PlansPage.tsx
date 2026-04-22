import { useEffect, useRef, useState } from "react";
import { Upload, Zap, Share2, RefreshCw, Plus, Star, Check, X } from "lucide-react";
import { MdEqualizer } from "react-icons/md";
import { useMe } from "@/features/profile/context/useMe";

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
      <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#5b4ff5] bg-[#ebe9fd] px-2.5 py-1 rounded-full">
        <Plus size={11} strokeWidth={3} />
        ARTIST
      </span>
    );
  }
  if (value === "badge-pro") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#c9a227] bg-[#fdf3d7] px-2.5 py-1 rounded-full">
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const { me } = useMe();
  const plansRef = useRef<HTMLElement>(null);   

  useEffect(() => {
    const prev = document.title;
    document.title = "Stand out with Artist Pro";
    return () => { document.title = prev; };
  }, []);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <header className="bg-zinc-950 border-b border-zinc-800 h-12 flex items-center px-6 gap-3">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-3 bg-white rounded-sm" />
            <div className="w-1.5 h-3 bg-white rounded-sm" />
            <div className="w-1.5 h-3 bg-white rounded-sm opacity-60" />
          </div>
          <span className="text-white font-black text-[15px] tracking-widest uppercase">SoundCloud</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-600 overflow-hidden">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-white font-bold flex items-center justify-center h-full">
              {me?.username?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-[13px] text-zinc-300">{me?.username}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-[64px] font-black leading-none tracking-tight text-white mb-5">
            Reach more listeners.
          </h1>
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black" />
            </div>
            <p className="text-zinc-400 text-[15px]">Join millions of artists that use SoundCloud to get heard.</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button className="bg-white text-zinc-900 font-black text-[14px] px-6 py-3 rounded-full hover:bg-zinc-100 transition-colors">
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
        <div className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-4 gap-8">
          {[
            { icon: "◎", title: "Grow your audience", desc: "Artist Pro subscribers get on average 400% more listens, thanks to our audio algorithm and featured playlists." },
            { icon: "▨", title: "Know your audience", desc: "Get advanced fan insights and custom listening reports to build connections and plan promotions, releases, and tours." },
            { icon: "∞", title: "Upload unlimited tracks", desc: "Upload and replace unlimited tracks without losing your plays, likes, and comments." },
            { icon: "↑↓", title: "Distribution is included", desc: "Distribute and get paid on SoundCloud and 60+ platforms including Spotify, Apple Music, and TikTok." },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-2xl text-zinc-400 mb-3 font-mono">{f.icon}</div>
              <h3 className="text-white font-bold text-[15px] mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Plans */}
      <section ref={plansRef} className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-zinc-900 font-black text-[52px] tracking-tight mb-14 text-center">
            Available plans.
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Artist */}
            <div className="border border-zinc-200 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#5b4ff5] flex items-center justify-center">
                  <Plus size={13} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-zinc-900 font-black text-2xl">Artist</h3>
              </div>
              <p className="text-zinc-500 text-[13px] mb-6">Tailored access to essential artist tools</p>

              <div className="mb-1">
                <span className="text-2xl font-black text-[#5b4ff5]">EGP 29.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month, billed yearly for EGP 359.88</span>
              </div>

              <button className="w-full mt-6 mb-6 py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-black text-[14px] rounded-xl transition-colors">
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
              <div className="absolute top-0 right-0 bg-[#c9a227] text-white text-[10px] font-black tracking-widest px-5 py-2 rounded-bl-xl rounded-tr-2xl">
                MOST POPULAR
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#c9a227] flex items-center justify-center">
                  <Star size={11} className="text-white" fill="white" />
                </div>
                <h3 className="text-zinc-900 font-black text-2xl">Artist Pro</h3>
              </div>
              <p className="text-zinc-500 text-[13px] mb-6">Unlimited access to all artist tools</p>

              <div className="mb-1">
                <span className="text-2xl font-black text-[#c9a227]">EGP 74.99</span>
                <span className="text-zinc-400 text-sm ml-1">/ month, billed yearly for EGP 899.88</span>
              </div>

              <button className="w-full mt-6 mb-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-black text-[14px] rounded-xl transition-colors">
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
      <section className="bg-white pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-zinc-900 font-black text-[52px] tracking-tight mb-14 text-center">
            Compare features.
          </h2>

          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-white pt-4 pb-2 border-b border-zinc-200 mb-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
              <div />
              <div className="text-center">
                <div className="text-zinc-900 font-black text-[18px]">Basic</div>
                <div className="text-zinc-500 text-[13px]">Free</div>
                <div className="mt-3">
                  <span className="text-[12px] text-zinc-500 border border-zinc-300 rounded-full px-4 py-1.5 font-medium">
                    Current plan
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-zinc-900 font-black text-[18px]">Artist</div>
                <div className="text-zinc-500 text-[13px]">EGP 29.99 <span className="text-[11px]">/month, billed yearly for EGP 359.88</span></div>
                <button className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-black text-[12px] px-5 py-2 rounded-full transition-colors">
                  Get started
                </button>
              </div>
              <div className="text-center">
                <div className="text-zinc-900 font-black text-[18px]">Artist Pro</div>
                <div className="text-[#1db954] text-[13px] font-medium">EGP 74.99 <span className="text-[11px] text-zinc-500">/month, billed yearly for EGP 899.88</span></div>
                <button className="mt-3 bg-zinc-900 hover:bg-zinc-700 text-white font-black text-[12px] px-5 py-2 rounded-full transition-colors">
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
    </div>
  );
}
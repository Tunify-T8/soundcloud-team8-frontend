import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CheckoutModal from "@/features/premium/components/CheckoutModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageId =
  | "overview"
  | "tracks"
  | "distribution"
  | "comments"
  | "fans"
  | "monetization"
  | "earnings"
  | "insights"
  | "benefits";

interface NavItem {
  id: PageId;
  label: string;
  beta?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "tracks", label: "Tracks" },
  { id: "distribution", label: "Distribution" },
  { id: "comments", label: "Comments" },
  { id: "fans", label: "Fans", beta: true },
  { id: "monetization", label: "Monetization" },
  { id: "earnings", label: "Earnings" },
  { id: "insights", label: "Insights" },
  { id: "benefits", label: "Benefits" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SoundCloudLogo = () => (
  <svg viewBox="0 0 33 18" className="w-7 h-auto" fill="currentColor">
    <path d="M0 13.5C0 15.43 1.57 17 3.5 17C5.43 17 7 15.43 7 13.5V8C7 6.07 5.43 4.5 3.5 4.5C1.57 4.5 0 6.07 0 8V13.5Z" />
    <rect x="9" y="6" width="3" height="11" rx="1.5" />
    <rect x="14" y="3" width="3" height="14" rx="1.5" />
    <rect x="19" y="1" width="3" height="16" rx="1.5" />
    <rect x="24" y="4" width="3" height="13" rx="1.5" />
    <rect x="29" y="6" width="3" height="11" rx="1.5" />
  </svg>
);

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  outlined?: boolean;
}

const Card = ({ icon, title, description, action, outlined }: CardProps) => (
  <div className="border border-gray-200 rounded-xl p-5 flex gap-5 items-start">
    {icon && (
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          outlined
            ? "border-2 border-black bg-transparent"
            : "bg-black"
        }`}
      >
        <span className={outlined ? "text-black" : "text-white"}>{icon}</span>
      </div>
    )}
    <div>
      <h3 className="text-sm font-bold text-black mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-3">{description}</p>
      {action}
    </div>
  </div>
);

const BtnPrimary = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors mr-2"
  >
    {children}
  </button>
);

const BtnSecondary = ({ children }: { children: React.ReactNode }) => (
  <button className="bg-transparent text-black text-sm font-medium px-5 py-2.5 rounded-full border border-black hover:bg-gray-50 transition-colors">
    {children}
  </button>
);

// ─── Globe SVG ────────────────────────────────────────────────────────────────
const GlobeGraphic = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 opacity-90" fill="none">
    <circle cx="100" cy="100" r="55" stroke="black" strokeWidth="1.5" />
    <ellipse cx="100" cy="100" rx="30" ry="55" stroke="black" strokeWidth="1" />
    <line x1="45" y1="100" x2="155" y2="100" stroke="black" strokeWidth="1" />
    <line x1="54" y1="72" x2="146" y2="72" stroke="black" strokeWidth="1" />
    <line x1="54" y1="128" x2="146" y2="128" stroke="black" strokeWidth="1" />
    <rect x="85" y="85" width="30" height="30" rx="15" fill="black" />
    {[
      [100, 45, 100, 35], [100, 155, 100, 170],
      [45, 100, 30, 100], [155, 100, 172, 100],
      [59, 59, 48, 48], [141, 59, 152, 48],
      [59, 141, 48, 152], [141, 141, 152, 152],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
    ))}
    {[
      [100, 28], [100, 172], [22, 100], [178, 100],
      [40, 40], [160, 40], [40, 160], [160, 160],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="9" stroke="black" strokeWidth="1.5" />
    ))}
  </svg>
);

// ─── Pages ────────────────────────────────────────────────────────────────────

const OverviewPage = ({ navigate }: { navigate: (id: PageId) => void }) => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3">Welcome to SoundCloud for Artists</h1>
    <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-8">
      Your hub for managing tracks, growing your fanbase, distributing music worldwide, and earning from your plays.
    </p>
    <hr className="border-gray-200 mb-8" />
    <div className="grid grid-cols-2 gap-4 max-w-xl">
      {[
        { id: "distribution" as PageId, title: "Distribution", desc: "Get your music on Spotify, Apple Music, TikTok and 30+ more platforms." },
        { id: "monetization" as PageId, title: "Monetization", desc: "Earn money from your plays with fan-powered royalties." },
        { id: "earnings" as PageId, title: "Earnings", desc: "Track your statements, payouts, and split pay." },
        { id: "insights" as PageId, title: "Insights", desc: "Real-time stats on how your tracks perform and trend." },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.id)}
          className="border border-gray-200 rounded-xl p-5 text-left hover:border-gray-400 transition-colors"
        >
          <h3 className="text-sm font-bold text-black mb-1">{item.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const TracksPage = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3">Your Tracks</h1>
    <p className="text-sm text-gray-500 mb-8">Upload, manage, and track performance of all your music in one place.</p>
    <hr className="border-gray-200 mb-8" />
    <Card
      outlined
      icon={
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      }
      title="Manage your music"
      description="View all your uploaded tracks, control privacy settings, and see how they're performing across the platform."
      action={<BtnPrimary>Upload a track</BtnPrimary>}
    />
  </div>
);

const DistributionPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="p-10">
    <div className="flex justify-between items-start mb-10">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold text-black leading-snug mb-4">
          Distribute your music to<br />Spotify, Apple Music, TikTok<br />and more.
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          It's true — SoundCloud is the only streaming platform that also helps amplify the reach of your albums, EPs, and singles as a distributor to 30+ major streaming platforms and social networks around the world.
        </p>
        <p className="text-sm font-semibold text-black mb-5">
          Distribution is available to Artist or Artist Pro subscribers only.
        </p>
        <div>
          <BtnPrimary onClick={onGetStarted}>Get started</BtnPrimary>
          <BtnSecondary>Distribution FAQs</BtnSecondary>
        </div>
      </div>
      <div className="flex-shrink-0">
        <GlobeGraphic />
      </div>
    </div>
    <hr className="border-gray-200 mb-6" />
    <h2 className="text-xl font-bold text-black mb-4">Distribution</h2>
    <Card
      icon={
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
        </svg>
      }
      title="Everything you need to manage your releases"
      description="SoundCloud makes it easy to distribute your music. We'll walk you through each step of the process and are here to provide support as needed to help. Distribution is available to Artist or Artist Pro subscribers only."
      action={<BtnPrimary onClick={onGetStarted}>Get started</BtnPrimary>}
    />
  </div>
);

const CommentsPage = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3">Comments</h1>
    <p className="text-sm text-gray-500 mb-8">Engage with your listeners and see what fans are saying about your tracks.</p>
    <hr className="border-gray-200 mb-8" />
    <Card
      outlined
      icon={
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      }
      title="Your listener comments"
      description="See timestamped comments left by your fans on every track. Respond and build your community."
      action={<BtnPrimary>View comments</BtnPrimary>}
    />
  </div>
);

const FansPage = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3 flex items-center gap-2">
      Fans
      <span className="text-xs font-semibold bg-gray-100 border border-gray-300 px-2 py-0.5 rounded align-middle">
        BETA
      </span>
    </h1>
    <p className="text-sm text-gray-500 mb-8">Understand who's listening and connect with your top supporters.</p>
    <hr className="border-gray-200 mb-8" />
    <Card
      outlined
      icon={
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      }
      title="Know your fans"
      description="Discover your top listeners, where they're from, and what tracks they love most. Build deeper connections with your audience."
      action={<BtnPrimary>Explore fans</BtnPrimary>}
    />
  </div>
);

const MonetizationPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="p-10">
    <div className="flex justify-between items-start mb-10">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold text-black leading-snug mb-4">
          Get paid for your plays on SoundCloud
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          As an Artist or Artist Pro subscriber, you can earn money from the plays your tracks get on SoundCloud. We call this Monetization. When you monetize your tracks you'll benefit from SoundCloud's revolutionary fan-powered royalties: the more fans listen to your music, the more you get paid.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          Note: If you request to monetize a track that is already monetizing under the SoundCloud Premier program, SoundCloud Direct will handle monetizing the track for you moving forward.
        </p>
        <p className="text-sm text-gray-500 mb-5">Monetized tracks also support custom waveform background.</p>
        <BtnPrimary onClick={onGetStarted}>Get started</BtnPrimary>
      </div>
      <div className="flex-shrink-0 w-48 h-44 relative">
        <svg viewBox="0 0 180 160" className="w-full h-full">
          <ellipse cx="90" cy="80" rx="60" ry="50" fill="#bbf7d0" />
          <ellipse cx="70" cy="90" rx="40" ry="35" fill="#86efac" />
          <rect x="55" y="55" width="70" height="55" rx="8" fill="#111" />
          <rect x="65" y="65" width="12" height="30" rx="2" fill="#4ade80" />
          <rect x="82" y="72" width="12" height="23" rx="2" fill="#4ade80" />
          <rect x="99" y="60" width="12" height="35" rx="2" fill="#4ade80" />
          <rect x="116" y="68" width="12" height="27" rx="2" fill="#4ade80" />
        </svg>
      </div>
    </div>
  </div>
);

const EarningsPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Your earnings", "Statements", "Payouts", "Split pay"];

  return (
    <div className="p-10">
      <div className="flex justify-between items-start mb-10">
        <div className="max-w-lg">
          <h1 className="text-3xl font-bold text-black leading-snug mb-4">
            Get paid fairly for your music with Fan Powered Royalties.
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            Our revolutionary new model pays artists directly based on your top fans' listening habits. Fan Powered Royalties are a more equitable and transparent way for independent artists who monetize directly with SoundCloud to get paid.
          </p>
          <p className="text-sm text-gray-400 italic mb-3">
            "It's such a simple idea. (As a fan) your monthly fees get split up between the songs (and artists) you actually listen to." —{" "}
            <span className="font-semibold not-italic text-gray-600">RAC</span> (artist and producer)
          </p>
          <p className="text-sm font-semibold text-black mb-5">
            Available to Artist or Artist Pro subscribers.
          </p>
          <BtnPrimary onClick={onGetStarted}>Get started</BtnPrimary>
          <BtnSecondary>Learn more</BtnSecondary>
        </div>
        <div className="flex-shrink-0 relative w-52 h-40">
          <div className="absolute top-0 left-4 rotate-[-8deg] bg-green-100 text-green-800 font-black text-lg px-4 py-2 rounded">EUR</div>
          <div className="absolute top-3 left-20 rotate-[5deg] bg-teal-100 text-teal-800 font-black text-base px-3 py-2 rounded">POUNDS</div>
          <div className="absolute top-16 left-2 rotate-[-3deg] bg-orange-100 text-orange-700 font-black text-base px-3 py-2 rounded">DOLLARS</div>
          <div className="absolute top-20 left-24 rotate-[6deg] bg-rose-200 text-rose-700 font-black text-2xl px-3 py-2 rounded-xl">♥</div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />
      <h2 className="text-xl font-bold text-black mb-4">Earnings</h2>

      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? "border-black text-black font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Card
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          }
          title="Make Money From Your Streams On SoundCloud."
          description="Start earning royalties from your tracks on SoundCloud and other streaming services with an Artist or Artist Pro membership."
        />
        <h2 className="text-xl font-bold text-black mt-2">Tracks</h2>
        <Card
          outlined
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          }
          title="See what tracks are earning you the most."
          description="Get real time stats on how your tracks are performing and trending on SoundCloud."
        />
      </div>
    </div>
  );
};

const InsightsPage = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3">Insights</h1>
    <p className="text-sm text-gray-500 mb-8">Deep dive into your audience data, play counts, reposts, and geographic reach.</p>
    <hr className="border-gray-200 mb-8" />
    <Card
      outlined
      icon={
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      }
      title="Your audience insights"
      description="See play counts, listener locations, follower growth, and which tracks are trending. Use data to grow smarter."
      action={<BtnPrimary>View insights</BtnPrimary>}
    />
  </div>
);

const BenefitsPage = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-black mb-3">Benefits</h1>
    <p className="text-sm text-gray-500 mb-8">Explore everything included in your Artist or Artist Pro plan.</p>
    <hr className="border-gray-200 mb-8" />
    <div className="grid grid-cols-2 gap-4 max-w-xl">
      {[
        { title: "Unlimited uploads", desc: "Upload as much music as you want without storage limits." },
        { title: "Advanced stats", desc: "Get deeper analytics on your plays and audience." },
        { title: "Spotlight tracks", desc: "Pin your best tracks to the top of your profile." },
        { title: "Scheduled releases", desc: "Plan and schedule your music releases in advance." },
        { title: "Custom waveforms", desc: "Personalize your track waveform background with custom art." },
        { title: "Priority support", desc: "Get faster responses from the SoundCloud support team." },
      ].map((item) => (
        <div key={item.title} className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-black mb-1">{item.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page Map ─────────────────────────────────────────────────────────────────
const PAGES: Record<PageId, (props: { navigate: (id: PageId) => void; onGetStarted: () => void }) => JSX.Element> = {
  overview: ({ navigate }) => <OverviewPage navigate={navigate} />,
  tracks: () => <TracksPage />,
  distribution: ({ onGetStarted }) => <DistributionPage onGetStarted={onGetStarted} />,
  comments: () => <CommentsPage />,
  fans: () => <FansPage />,
  monetization: ({ onGetStarted }) => <MonetizationPage onGetStarted={onGetStarted} />,
  earnings: ({ onGetStarted }) => <EarningsPage onGetStarted={onGetStarted} />,
  insights: () => <InsightsPage />,
  benefits: () => <BenefitsPage />,
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function PromoPage() {
  const location = useLocation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const getInitialPage = (): PageId => {
    if (location.pathname.includes("monetization")) return "monetization";
    if (location.pathname.includes("distribution")) return "distribution";
    return "distribution";
  };

  const [activePage, setActivePage] = useState<PageId>(getInitialPage);

  const openArtistProCheckout = () => {
    setCheckoutOpen(true);
  };

  useEffect(() => {
    setActivePage(getInitialPage());
  }, [location.pathname]);

  const PageComponent = PAGES[activePage];

  return (
    <div className="flex min-h-screen font-sans bg-white text-black">
      {/* Sidebar */}
      <aside className="w-40 flex-shrink-0 border-r border-gray-200 flex flex-col py-5">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 pb-5 border-b border-gray-200 mb-4">
          <SoundCloudLogo />
          <span className="text-[9px] font-semibold leading-tight tracking-wide uppercase">
            SoundCloud<br />for Artists
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`text-left px-4 py-2 text-[11px] tracking-widest uppercase transition-colors ${
                activePage === item.id
                  ? "font-black text-black"
                  : "font-normal text-gray-400 hover:text-black"
              }`}
            >
              {item.label}
              {item.beta && (
                <span className="ml-1.5 bg-gray-100 border border-gray-300 text-[8px] font-semibold px-1.5 py-0.5 rounded align-middle">
                  BETA
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <PageComponent navigate={setActivePage} onGetStarted={openArtistProCheckout} />
      </main>

      {checkoutOpen && (
        <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  );
}

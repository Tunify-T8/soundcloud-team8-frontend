import { useState, useMemo, useEffect } from "react";
import { Search, Upload, Plus, Globe, DollarSign, SlidersHorizontal, ArrowUpDown, BarChart, Users, Gift } from "lucide-react";
import TrackList from "../components/TrackList";
import ArtistsNavbar from "../components/ArtistsNavbar";
import ArtistsSidebar from "../components/ArtistsSidebar";
import { trackService } from "../trackService";
import type { Track } from "@/shared/types/Track";
import { Link } from "react-router-dom";
import wwwImg from "@/assets/www.png";
import spotifyImg from "@/assets/spotify.png";
import appleMusicImg from "@/assets/appleMusic.png";
import deezerImg from "@/assets/deezer.png";
import amazonMusicImg from "@/assets/amazonMusic.png";
import tiktokImg from "@/assets/tiktok.png";
import instagramImg from "@/assets/insta.png";
import youtubeImg from "@/assets/youtube.png";
import tidalImg from "@/assets/tidal.png";
import pandoraImg from "@/assets/pandora.png";
import vinylImg from "@/assets/vinyl.png";
import commentsImg from "@/assets/comment_bubbles.png";
import { BenefitsSection } from "../components/BenefitsSection";
import CheckoutModal from "@/features/premium/components/CheckoutModal";

import insightsImg from "@/assets/insights.png";
import earningsImg from "@/assets/monetize.png";
import fansImg from "@/assets/top_fans.png";
import benefitsImg from "@/assets/benefits.png";
import fansHoverImg from "@/assets/top_fans_hover.png";
import benefitsHoverImg from "@/assets/benefits_hover.png";

export function UploadBanner() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <div className="bg-[hsl(0,0%,11%)] border-b border-[hsl(0,0%,18%)] flex items-center justify-between px-8 py-3 shrink-0">
      <div className="flex items-center gap-3">
        <Upload className="w-4 h-4 text-[hsl(0,0%,60%)]" />
        <span className="text-white text-sm font-medium tracking-tighter">0% of uploads used</span>
        <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(0,0%,50%)] rounded-full" style={{ width: "0%" }} />
        </div>
        <span className="text-[hsl(0,100%,99%)] text-sm font-semibold">0 of 180 minutes</span>
      </div>
      <button 
      onClick={() => setCheckoutOpen(true)}
      className="bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[hsl(0,0%,20%)] transition-colors">
        Get unlimited uploads
      </button>

      {checkoutOpen && <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />}
        
    </div>
  );
}

function StudioHeader() {
  return (
    <div className="bg-[hsl(0,0%,7%)] border border-[hsl(0,0%,17%)] rounded-md mx-6 mt-5 mb-6 px-7 py-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-white text-[28px] font-bold tracking-tight">Artist Studio</h1>
        <span className="text-[hsl(0,0%,45%)] text-sm">All time stats updated daily.</span>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col gap-1 pr-7">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">SC plays</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Reposts</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Downloads</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Likes</span>
        </div>
        <div className="flex flex-col gap-1 pl-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Comments</span>
        </div>

     
       <div className="w-px bg-[hsl(0,0%,20%)] self-stretch mx-7" />

      <div className="flex items-center justify-between flex-1">
        {/* Insights */}
        <button className="group flex flex-col items-center gap-1.5 transition-colors">
          <img src={insightsImg} alt="Insights" className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-125" />
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Insights</span>
          <span className="text-[10px] font-bold tracking-tight text-[hsl(0,0%,65%)] opacity-0 group-hover:opacity-100 transition-opacity -mt-1">Limited</span>
        </button>

        {/* Earnings */}
        <button className="group flex flex-col items-center gap-1.5 transition-colors">
          <img src={earningsImg} alt="Earnings" className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-125" />
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Earnings</span>
             </button>

        {/* Fans */}
        <button className="group flex flex-col items-center gap-1.5 transition-colors">
          <div className="relative">
            <img src={fansImg}      alt="Fans" className="w-10 h-10 object-contain transition-all duration-200 group-hover:scale-130 group-hover:opacity-0 absolute" />
            <img src={fansHoverImg} alt="Fans" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 opacity-0 group-hover:opacity-100" />
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center text-black" style={{ fontSize: "8px", fontWeight: 900 }}>★</span>
          </div>
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Fans</span>
          <span className="text-[10px] font-bold tracking-widest text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">ARTIST PRO</span>
        </button>

        {/* Benefits */}
        <button className="group flex flex-col items-center gap-1.5 transition-colors">
          <div className="relative">
            <img src={benefitsImg}      alt="Benefits" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 group-hover:opacity-0 absolute" />
            <img src={benefitsHoverImg} alt="Benefits" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 opacity-0 group-hover:opacity-100" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>+</span>
          </div>
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Benefits</span>
          <span className="text-[10px] font-bold tracking-widest text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">ARTIST</span>
        </button>
      </div>
      </div>
    </div>
  );
}


function DistributionTab() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const platforms = [
    { img: spotifyImg,      alt: "Spotify"       },
    { img: appleMusicImg,   alt: "Apple Music"   },
    { img: deezerImg,       alt: "Deezer"        },
    { img: amazonMusicImg,  alt: "Amazon Music"  },
    { img: tiktokImg,       alt: "TikTok"        },
    { img: instagramImg,    alt: "Instagram"     },
    { img: youtubeImg,      alt: "YouTube"       },
    { img: tidalImg,        alt: "TIDAL"         },
    { img: pandoraImg,      alt: "Pandora"       },
  ];

  return (
    <div className="px-8 py-10 text-white">
      {/* Hero */}
      <div className="flex items-start justify-between mb-12">
        <div className="max-w-[560px]">
          <h2 className="text-3xl font-bold leading-tight mb-4 tracking-tighter">
            Distribute your music to Spotify, Apple Music,{" "}
            <br />YouTube, and more
          </h2>
          <p className="text-[hsl(0, 0%, 99%)] text-sm leading-relaxed mb-8">
            As an Artist Pro subscriber, you get unlimited music distribution to
            all the major streaming platforms like Spotify, YouTube Music, Apple
            Music, TIDAL, and more all around the world. You'll also be able to
            get your music on to social media like Instagram, TikTok, Facebook
            and others — extending your reach and audience.
          </p>
          <button className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
          onClick={() => setCheckoutOpen(true)}
          >
            Get Artist Pro
          </button>
        </div>

        <div className="flex-shrink-0 w-[280px] h-[280px]">
          <img src={wwwImg} alt="Distribution" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Platform logos */}
      <div className="flex items-center justify-between gap-6 mb-12 flex-wrap">
        {platforms.map(({ img, alt }) => (
          <img
            key={alt}
            src={img}
            alt={alt}
            className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>

      {/* How it works */}
      <div>
        <p className="text-sm font-bold text-white mb-3">How it works</p>
        <div className="border-t border-[hsl(0,0%,17%)] pt-8 grid grid-cols-3 gap-10">
          {[
            {
              num: "1",
              title: "Select your membership",
              desc: "Choose the membership plan that works best for you. Get started with distribution for as little as $3.25 a month.",
            },
            {
              num: "2",
              title: "Create your release",
              desc: "We'll guide you through the simple steps to add credits and release information to make sure you get paid for your plays.",
            },
            {
              num: "3",
              title: "We'll deliver your tracks",
              desc: "We'll double-check your release to help ensure it is successfully delivered to Spotify, Apple Music, TIDAL and so many more.",
            },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-5">
              <span
                className="text-[72px] font-bold leading-none text-transparent select-none flex-shrink-0"
                style={{ WebkitTextStroke: "1px hsl(0,0%,30%)" }}
              >
                {num}
              </span>
              <div className="pt-3">
                <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                <p className="text-[hsl(0,0%,50%)] text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
       {checkoutOpen && <CheckoutModal plan = "artist-pro" onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

function VinylRecordsTab() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <div className="px-8 py-10 text-white">

      {/* Hero */}
      <div className="flex items-start justify-between mb-14">
        <div className="max-w-[560px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Artist Pro</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-5 tracking-tighter">
            Your music. On vinyl. On demand.
          </h2>
          <p className="text-[hsl(0, 0%, 100%)] text-sm leading-relaxed mb-3">
            We're partnering with elasticStage to{" "}
            <span className="text-white font-bold">
              release your albums on vinyl, on-demand, with no up-front cost to you.
            </span>
          </p>
          <p className="text-[hsl(0, 0%, 100%)] text-sm leading-relaxed mb-8">
            You and your fans can purchase just one record or a thousand. Either
            way, you get paid for every sale.
          </p>
          <div className="flex items-center gap-3">
            <button className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
            onClick={() => setCheckoutOpen(true)}
            >
              Get Artist Pro
            </button>
            <button className="bg-[hsl(0,0%,16%)] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[hsl(0,0%,22%)] border border-[hsl(0,0%,26%)] transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 w-[320px] h-[280px]">
          <img src={vinylImg} alt="Vinyl record" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* No upfront cost */}
      <div className="mb-10">
        <p className="text-sm font-bold text-white mb-3">No upfront cost to you</p>
        <div className="border-t border-[hsl(0,0%,17%)] pt-8 flex items-start justify-between gap-10">

          {/* Left — $0 + description */}
          <div className="flex items-start gap-6">
            <span
              className="text-[80px] font-bold leading-none text-transparent flex-shrink-0 select-none"
              style={{ WebkitTextStroke: "1.5px hsl(0,0%,35%)" }}
            >
              $0
            </span>
            <div className="pt-4">
              <p className="text-white font-bold text-sm mb-1.5">
                You pay nothing to create a record.
              </p>
              <p className="text-[hsl(0,0%,55%)] text-sm">
                Your fans pay for every purchase, and we pass the royalties on to you.
              </p>
            </div>
          </div>

          {/* Right — pricing breakdown */}
          <div className="min-w-[360px] space-y-3">
            {[
              { label: "Your upfront cost",  value: "$0"   },
              { label: "Sales price for fan", value: "$39*" },
              { label: "Royalties you earn",  value: "$11*" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white text-sm font-bold">{label}</span>
                <span className="text-white text-sm font-bold">{value}</span>
              </div>
            ))}
            <p className="text-[hsl(0,0%,40%)] text-xs pt-1">
              *Prices vary slightly due to currency conversions.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <p className="text-sm font-bold text-white mb-3">How it works</p>
        <div className="border-t border-[hsl(0,0%,17%)] pt-8 grid grid-cols-3 gap-10">
          {[
            {
              num: "1",
              title: "Create your new record from your tracks.",
              desc: "Just pick your tracks on SoundCloud, add credits, upload artwork, and submit your new record for review.",
              link: null,
            },
            {
              num: "2",
              title: "We create a web page and list your record for sale.",
              desc: "No need to worry about out-of-pocket fees or leftover stock. Each album will cost your fans around $39 plus shipping and handling.",
              link: "Learn more about pricing.",
            },
            {
              num: "3",
              title: "We print and ship your record. You get paid.",
              desc: "Records are shipped to fans within weeks of their order. And every record sold means you get paid.",
              link: "Learn more about splits",
            },
          ].map(({ num, title, desc, link }) => (
            <div key={num} className="flex items-start gap-5">
              <span
                className="text-[72px] font-bold leading-none text-transparent select-none flex-shrink-0"
                style={{ WebkitTextStroke: "1px hsl(0,0%,30%)" }}
              >
                {num}
              </span>
              <div className="pt-3">
                <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                <p className="text-[hsl(0,0%,50%)] text-xs leading-relaxed">
                  {desc}{" "}
                  {link && (
                    <a href="#" className="text-white underline hover:text-zinc-300 transition-colors">
                      {link}
                    </a>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
       {checkoutOpen && <CheckoutModal plan = "artist-pro" onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

function CommentsTab() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <div className="px-8 py-10 text-white">
      <div className="flex items-start justify-between">
        <div className="max-w-[560px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Artist Pro</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-5">
            Every comment in one place
          </h2>
          <p className="text-[hsl(0,0%,65%)] text-sm leading-relaxed mb-8">
            With Artist Pro, you get access to Comments Hub which brings together
            every comment across all of your tracks, so you can easily see what
            fans are saying about you. Read, moderate and respond to your
            comments, all in one place.
          </p>
          <button className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
           onClick={() => setCheckoutOpen(true)}
           >
            Get Artist Pro
          </button>
        </div>

        <div className="flex-shrink-0 w-[340px] h-[240px]">
          <img src={commentsImg} alt="Comments Hub" className="w-full h-full object-contain" />
        </div>
      </div>
       {checkoutOpen && <CheckoutModal plan = "artist-pro" onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

const TABS = ["SoundCloud Tracks", "Distribution", "Vinyl Records", "Comments"];

export default function ArtistsPage() {
  const [activeTab, setActiveTab] = useState("SoundCloud Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [tracks, setTracks] = useState<Track[]>([]);
  

const handleUpdate = (updatedTrack: Track) => {
  setTracks(prev =>
    prev.map(t => t.id === updatedTrack.id ? { ...t, ...updatedTrack } : t)
  );
};

useEffect(() => {
  const fetchTracks = async () => {
   try {
      const data = await trackService.getUploadedTracks();
      setTracks(data);
    } catch(e) {
      console.log("Failed to fetch tracks:", e)
      setTracks([])
    }
  }
  fetchTracks();
}, []);

const filteredTracks = useMemo(() => {
  return tracks.filter((track) => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "public" && !track.isPrivate) ||
      (visibilityFilter === "private" && track.isPrivate);
    return matchesSearch && matchesVisibility;
  });
}, [tracks, searchQuery, visibilityFilter]);

  const handleVisibilityChange = (v: "public" | "private") => {
    setVisibilityFilter((prev) => (prev === v ? "all" : v));
  };

  const handleDeleteTrack = (id: string) => {
  setTracks((prev) => prev.filter((t) => t.id !== id));
};

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      <ArtistsSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <ArtistsNavbar />
        <UploadBanner />

       
       <div className="flex-1 overflow-y-auto [overflow-x:clip]">
          <StudioHeader />

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[hsl(0,0%,17%)] px-6 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-sm transition-colors
                  ${activeTab === tab
                    ? "text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white"
                    : "text-[hsl(0,0%,50%)] hover:text-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "SoundCloud Tracks" && (
            <div className="px-6 space-y-4">
              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                { icon: Plus, label: "Upload or drop tracks", to: "/upload" },
                { icon: Globe, label: "Distribute tracks", to: null },
                { icon: DollarSign, label: "Monetize tracks", to: null },
                { icon: SlidersHorizontal, label: "Master track audio", to: null },
                ].map(({ icon: Icon, label, to }) => {
                    const btn = (
                      <button
                        key={label}
                        className="flex items-center gap-2 bg-[hsl(0,0%,16%)] hover:bg-[hsl(0,0%,21%)] border border-[hsl(0,0%,26%)] text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    );
                    return to ? <Link key={label} to={to}>{btn}</Link> : btn;
              })}
              </div>

              {/* Search + filters + count */}
              <div className="flex items-center gap-3 font-bold tracking-tighter flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0,0%,42%)]" />
                  <input
                    type="text"
                    placeholder="Search tracks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border border-[hsl(0,0%,26%)] rounded-full text-white text-sm pl-9 pr-3 py-2 w-56 placeholder:text-[hsl(0,0%,42%)] focus:outline-none focus:border-[hsl(0,0%,48%)]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVisibilityChange("public")}
                    className={`px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "public"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => handleVisibilityChange("private")}
                    className={`px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "private"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Private
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2 text-[hsl(0,0%,50%)] text-sm">
                  <span>{filteredTracks.length} tracks</span>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Date</span>
                  </button>
                </div>
              </div>

              <TrackList tracks={filteredTracks} onDelete={handleDeleteTrack} onUpdate={handleUpdate} />
              <BenefitsSection />
            </div>
          )}

          {activeTab === "Distribution" && <DistributionTab />}

          {activeTab === "Vinyl Records" && <VinylRecordsTab />}

          {activeTab === "Comments" && <CommentsTab />}

        </div>
      </div>
    </div>
  );
}
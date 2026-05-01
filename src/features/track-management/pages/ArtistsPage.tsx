import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Globe, DollarSign, SlidersHorizontal, ArrowUpDown, BarChart, Users, Gift } from "lucide-react";
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
import UploadQuotaBanner from "@/features/upload/components/UploadQuotaBanner";
import { api } from "@/features/auth/services/api";
import { subscriptionService } from "@/features/premium/premiumService";

import insightsImg from "@/assets/insights.png";
import earningsImg from "@/assets/monetize.png";
import fansImg from "@/assets/top_fans.png";
import benefitsImg from "@/assets/benefits.png";
import fansHoverImg from "@/assets/top_fans_hover.png";
import benefitsHoverImg from "@/assets/benefits_hover.png";

import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";

export function UploadBanner() {
  const [quota, setQuota] = useState<
    | {
        tier: string;
        uploadMinutesLimit: number | null;
        uploadMinutesUsed: number;
        uploadMinutesRemaining: number | null;
        canReplaceFiles: boolean;
        canScheduleRelease: boolean;
        canAccessAdvancedTab: boolean;
      }
    | null
  >(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaBlocked, setQuotaBlocked] = useState(false);
  const [planTier, setPlanTier] = useState<"free" | "artist" | "artist-pro">("free");

  useEffect(() => {
    let mounted = true;
    api
      .get("/users/me/upload")
      .then(({ data }) => {
        if (!mounted) return;
        setQuota(data);
      })
      .catch((err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (!mounted) return;
        if (status === 403) {
          setQuotaBlocked(true);
          setQuota({
            tier: "free",
            uploadMinutesLimit: 180,
            uploadMinutesUsed: 180,
            uploadMinutesRemaining: 0,
            canReplaceFiles: false,
            canScheduleRelease: false,
            canAccessAdvancedTab: false,
          });
          return;
        }
        setQuota({
          tier: "free",
          uploadMinutesLimit: 180,
          uploadMinutesUsed: 0,
          uploadMinutesRemaining: 180,
          canReplaceFiles: false,
          canScheduleRelease: false,
          canAccessAdvancedTab: false,
        });
      })
      .finally(() => {
        if (mounted) setQuotaLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    subscriptionService
      .getMySubscription({ fallbackToFree: true })
      .then((sub) => {
        if (!mounted) return;
        setPlanTier(sub.tier);
      })
      .catch(() => {
        if (!mounted) return;
        setPlanTier("free");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <UploadQuotaBanner
      quota={quota}
      loading={quotaLoading}
      forceOverLimit={quotaBlocked}
      statusMessage={
        quotaBlocked ? "You've reached your upload limit for your plan" : undefined
      }
    />
  );
}

function StudioHeader() {
  return (
    <div data-testid="studio-header" className="bg-[hsl(0,0%,7%)] border border-[hsl(0,0%,17%)] rounded-md mx-3 sm:mx-6 mt-5 mb-6 px-4 sm:px-7 py-5 sm:py-6">
      <div className="flex items-baseline gap-3 mb-5 sm:mb-6 flex-wrap">
        <h1 className="text-white text-2xl sm:text-[28px] font-bold tracking-tight">Artist Studio</h1>
        <span className="text-[hsl(0,0%,45%)] text-sm">All time stats updated daily.</span>
      </div>

      {/* Stats row — scrolls horizontally on very small screens */}
      <div className="flex items-center overflow-x-auto pb-1 -mb-1 scrollbar-none">
        <div className="flex items-center shrink-0">
          <div className="flex flex-col gap-1 pr-5 sm:pr-7">
            <span className="text-white text-xl sm:text-2xl font-semibold tabular-nums">0</span>
            <span className="text-[hsl(0,0%,42%)] text-xs whitespace-nowrap">SC plays</span>
          </div>
          <div className="flex flex-col gap-1 px-5 sm:px-7 border-l border-[hsl(0,0%,20%)]">
            <span className="text-white text-xl sm:text-2xl font-semibold tabular-nums">0</span>
            <span className="text-[hsl(0,0%,42%)] text-xs whitespace-nowrap">Reposts</span>
          </div>
          <div className="flex flex-col gap-1 px-5 sm:px-7 border-l border-[hsl(0,0%,20%)]">
            <span className="text-white text-xl sm:text-2xl font-semibold tabular-nums">0</span>
            <span className="text-[hsl(0,0%,42%)] text-xs whitespace-nowrap">Downloads</span>
          </div>
          <div className="flex flex-col gap-1 px-5 sm:px-7 border-l border-[hsl(0,0%,20%)]">
            <span className="text-white text-xl sm:text-2xl font-semibold tabular-nums">0</span>
            <span className="text-[hsl(0,0%,42%)] text-xs whitespace-nowrap">Likes</span>
          </div>
          <div className="flex flex-col gap-1 pl-5 sm:pl-7 border-l border-[hsl(0,0%,20%)]">
            <span className="text-white text-xl sm:text-2xl font-semibold tabular-nums">0</span>
            <span className="text-[hsl(0,0%,42%)] text-xs whitespace-nowrap">Comments</span>
          </div>
        </div>

     
       <div className="w-px bg-[hsl(0,0%,20%)] self-stretch mx-7" />

      <div className="flex items-center justify-between flex-1">
        {/* Insights */}
        <Link to="/me/insights/overview">
        <button data-testid="studio-header-insights-btn" className="group flex flex-col items-center gap-1.5 transition-colors">
          <img src={insightsImg} alt="Insights" className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-125" />
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Insights</span>
          <span className="text-[10px] font-bold tracking-tight text-[hsl(0,0%,65%)] opacity-0 group-hover:opacity-100 transition-opacity -mt-1">Limited</span>
        </button>
        </Link>

        {/* Earnings */}
        <button data-testid="studio-header-earnings-btn" className="group flex flex-col items-center gap-1.5 transition-colors">
          <img src={earningsImg} alt="Earnings" className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-125" />
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Earnings</span>
             </button>

        {/* Fans */}
          <Link to = "/me/insights/fanz"> 
        <button data-testid="studio-header-fans-btn" className="group flex flex-col items-center gap-1.5 transition-colors">
        
          <div className="relative overview-visible">
            <img src={fansImg}      alt="Fans" className="w-10 h-11 object-contain transition-all duration-200 group-hover:scale-130 group-hover:opacity-0 absolute" />
            <img src={fansHoverImg} alt="Fans" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 opacity-0 group-hover:opacity-100" />
            <span className="absolute top-1 right-[-7px] right-0.5 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center text-black" style={{ fontSize: "8px", fontWeight: 900 }}>★</span>
          </div>
          <span className="text-xs font-bold text-[hsl(0,0%,65%)] group-hover:text-white transition-colors">Fans</span>
          <span className="text-[10px] font-bold tracking-widest text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">ARTIST PRO</span>
        
        </button>
        </Link>

        {/* Benefits */}
        <button data-testid="studio-header-benefits-btn" className="group flex flex-col items-center gap-1.5 transition-colors">
          <div className="relative overview-visible">
            <img src={benefitsImg}      alt="Benefits" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 group-hover:opacity-0 absolute" />
            <img src={benefitsHoverImg} alt="Benefits" className="w-8 h-8 object-contain transition-all duration-200 group-hover:scale-125 opacity-0 group-hover:opacity-100" />
            <span className="absolute top-1 right-[-7px] w-3.5 h-3.5 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>+</span>
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
    <div className="px-4 sm:px-8 py-8 sm:py-10 text-white">
      {/* Hero */}
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-8 mb-10 sm:mb-12">
        <div className="max-w-full sm:max-w-[560px]">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 tracking-tighter">
            Distribute your music to Spotify, Apple Music, YouTube, and more
          </h2>
          <p className="text-[hsl(0,0%,70%)] text-sm leading-relaxed mb-8">
            As an Artist Pro subscriber, you get unlimited music distribution to
            all the major streaming platforms like Spotify, YouTube Music, Apple
            Music, TIDAL, and more all around the world. You'll also be able to
            get your music on to social media like Instagram, TikTok, Facebook
            and others — extending your reach and audience.
          </p>
          <ArtistProUpgradeButton
            className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Get Artist Pro
          </ArtistProUpgradeButton>
        </div>

        <div className="w-full sm:flex-shrink-0 sm:w-[280px] h-[200px] sm:h-[280px]">
          <img src={wwwImg} alt="Distribution" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Platform logos */}
      <div className="flex items-center justify-start sm:justify-between gap-4 sm:gap-6 mb-10 sm:mb-12 flex-wrap">
        {platforms.map(({ img, alt }) => (
          <img
            key={alt}
            src={img}
            alt={alt}
            className="h-5 sm:h-6 object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>

      {/* How it works */}
      <div>
        <p className="text-sm font-bold text-white mb-3">How it works</p>
        <div className="border-t border-[hsl(0,0%,17%)] pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
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
                className="text-[64px] sm:text-[72px] font-bold leading-none text-transparent select-none flex-shrink-0"
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
    </div>
  );
}

function VinylRecordsTab() {
  return (
    <div className="px-4 sm:px-8 py-8 sm:py-10 text-white">

      {/* Hero */}
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-8 mb-10 sm:mb-14">
        <div className="max-w-full sm:max-w-[560px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Artist Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-5 tracking-tighter">
            Your music. On vinyl. On demand.
          </h2>
          <p className="text-[hsl(0,0%,70%)] text-sm leading-relaxed mb-3">
            We're partnering with elasticStage to{" "}
            <span className="text-white font-bold">
              release your albums on vinyl, on-demand, with no up-front cost to you.
            </span>
          </p>
          <p className="text-[hsl(0,0%,70%)] text-sm leading-relaxed mb-8">
            You and your fans can purchase just one record or a thousand. Either
            way, you get paid for every sale.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <ArtistProUpgradeButton
              className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Get Artist Pro
            </ArtistProUpgradeButton>
            <button className="bg-[hsl(0,0%,16%)] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[hsl(0,0%,22%)] border border-[hsl(0,0%,26%)] transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="w-full sm:flex-shrink-0 sm:w-[320px] h-[200px] sm:h-[280px]">
          <img src={vinylImg} alt="Vinyl record" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* No upfront cost */}
      <div className="mb-10">
        <p className="text-sm font-bold text-white mb-3">No upfront cost to you</p>
        <div className="border-t border-[hsl(0,0%,17%)] pt-6 sm:pt-8 flex flex-col sm:flex-row items-start justify-between gap-8 sm:gap-10">

          {/* Left — $0 + description */}
          <div className="flex items-start gap-6">
            <span
              className="text-[64px] sm:text-[80px] font-bold leading-none text-transparent flex-shrink-0 select-none"
              style={{ WebkitTextStroke: "1.5px hsl(0,0%,35%)" }}
            >
              $0
            </span>
            <div className="pt-3 sm:pt-4">
              <p className="text-white font-bold text-sm mb-1.5">
                You pay nothing to create a record.
              </p>
              <p className="text-[hsl(0,0%,55%)] text-sm">
                Your fans pay for every purchase, and we pass the royalties on to you.
              </p>
            </div>
          </div>

          {/* Right — pricing breakdown */}
          <div className="w-full sm:min-w-[360px] sm:w-auto space-y-3">
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
        <div className="border-t border-[hsl(0,0%,17%)] pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
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
                className="text-[64px] sm:text-[72px] font-bold leading-none text-transparent select-none flex-shrink-0"
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
    </div>
  );
}

function CommentsTab() {
  return (
    <div className="px-4 sm:px-8 py-8 sm:py-10 text-white">
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-8">
        <div className="max-w-full sm:max-w-[560px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Artist Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-5">
            Every comment in one place
          </h2>
          <p className="text-[hsl(0,0%,65%)] text-sm leading-relaxed mb-8">
            With Artist Pro, you get access to Comments Hub which brings together
            every comment across all of your tracks, so you can easily see what
            fans are saying about you. Read, moderate and respond to your
            comments, all in one place.
          </p>
          <ArtistProUpgradeButton
            className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Get Artist Pro
          </ArtistProUpgradeButton>
        </div>

        <div className="w-full sm:flex-shrink-0 sm:w-[340px] h-[180px] sm:h-[240px]">
          <img src={commentsImg} alt="Comments Hub" className="w-full h-full object-contain" />
        </div>
      </div>
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
        console.log("Failed to fetch tracks:", e);
        setTracks([]);
      }
    };
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
      <div className="hidden sm:block">
        <ArtistsSidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <ArtistsNavbar />
        <UploadBanner />

        <div className="flex-1 overflow-y-auto overflow-x-visible">
          <StudioHeader />

          {/* Tabs — horizontally scrollable on mobile */}
          <div data-testid="artists-page-tabs" className="flex items-center gap-0 border-b border-[hsl(0,0%,17%)] px-3 sm:px-6 mb-5 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab}
                data-testid={`tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap px-3 sm:px-4 py-3 text-sm transition-colors shrink-0
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
            <div className="px-3 sm:px-6 space-y-4">
              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {[
                  { icon: Plus, label: "Upload or drop tracks", to: "/upload" },
                  { icon: Globe, label: "Distribute tracks", to: null },
                  { icon: DollarSign, label: "Monetize tracks", to: null },
                  { icon: SlidersHorizontal, label: "Master track audio", to: null },
                ].map(({ icon: Icon, label, to }) => {
                  const btn = (
                    <button
                      key={label}
                      className="flex items-center gap-2 bg-[hsl(0,0%,16%)] hover:bg-[hsl(0,0%,21%)] border border-[hsl(0,0%,26%)] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  );
                  return to ? <Link key={label} to={to}>{btn}</Link> : btn;
                })}
              </div>

              {/* Search + filters + count */}
              <div className="flex items-center gap-2 sm:gap-3 font-bold tracking-tighter flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0,0%,42%)]" />
                  <input
                    data-testid="tracks-search-input"
                    type="text"
                    placeholder="Search tracks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border border-[hsl(0,0%,26%)] rounded-full text-white text-sm pl-9 pr-3 py-2 w-44 sm:w-56 placeholder:text-[hsl(0,0%,42%)] focus:outline-none focus:border-[hsl(0,0%,48%)]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    data-testid="tracks-filter-public"
                    onClick={() => handleVisibilityChange("public")}
                    className={`px-4 sm:px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "public"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Public
                  </button>
                  <button
                    data-testid="tracks-filter-private"
                    onClick={() => handleVisibilityChange("private")}
                    className={`px-4 sm:px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "private"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Private
                  </button>
                </div>

                <div data-testid="tracks-count-sort" className="ml-auto flex items-center gap-2 text-[hsl(0,0%,50%)] text-sm">
                  <span data-testid="tracks-count">{filteredTracks.length} tracks</span>
                  <button data-testid="tracks-sort-btn" className="flex items-center gap-1 hover:text-white transition-colors">
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

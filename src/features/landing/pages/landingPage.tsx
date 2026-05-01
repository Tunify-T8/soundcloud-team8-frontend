import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { DiscoverCard } from "@/features/discover/components/discoverCard";
import type { DiscoverTrack } from "@/features/discover/Discover";
import { Link } from "react-router-dom";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Discover. Get Discovered.",
    subtitle: "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together to discover and connect through music.",
    buttonText: "Get Started",
    image: "https://linkstorage.linkfire.com/medialinks/images/997e4c9e-8ca5-4665-8621-1d081cc8887c/artwork-440x220.jpg",
    artistName: "DC the Don",
    artistTitle: "SoundCloud Artist Pro"
  },
  {
    id: 2,
    title: "It all starts with an upload.",
    subtitle: "From bedrooms and broom closets to studios and stadiums, SoundCloud is where you define what's next in music. Just hit upload.",
    buttonText: "Upload",
    secondaryButton: "Explore Artist Pro",
    image: "https://i.ytimg.com/vi/TPmT0ufa_eU/maxresdefault.jpg",
    artistName: "1800-hug-rat",
    artistTitle: "Ascending Artist"
  }
];

// Using "as const" tells TypeScript these are specific literal strings, not generic strings
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
} as const;

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

export default function SoundCloudLanding() {
  const [index, setIndex] = useState(0);

  const trendingTracks: DiscoverTrack[] = [
    { id: "1", title: "palm", artist: "Cameron Fairy", coverUrl: "https://i1.sndcdn.com/artworks-yR8pge2WFqnlRgqX-vJLLqA-t500x500.png", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "2", title: "do you love me?", artist: "K.ONE", coverUrl: "https://i.ytimg.com/vi/5ZT0l0dfB_c/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCDMATxdEgnpEEasy8ZQy7nUg6mRg", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "3", title: "Trevon O'Ryan Echols", artist: "Nine Vicious", coverUrl: "https://i.scdn.co/image/ab6761610000e5eb9d3d1eb4d6eef6e04e4d1d89", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "4", title: "Pagan - Hey Papi", artist: "Pagan", coverUrl: "https://i1.sndcdn.com/artworks-cNjddYx0tTNz7l8s-hwWu5w-t240x240.jpg", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "5", title: "Teach You Desire", artist: "IDEMI", coverUrl: "https://i1.sndcdn.com/artworks-DYYdm4SLlD4BdgD1-mbWFHg-t500x500.jpg", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "6", title: "M.A.A.D. CITY", artist: "Kendrick Lamar", coverUrl: "https://i1.sndcdn.com/artworks-4zHNGWh2Yduu60z0-nztMmw-t500x500.jpg", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "7", title: "Hurts - Finders Keepers", artist: "Hurts", coverUrl: "data:image/jpeg;base64,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", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "8", title: "RUN", artist: "FONZO", coverUrl: "https://i1.sndcdn.com/artworks-Gcn5uvoxtTzuTlrO-yRnVkA-t1080x1080.png", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
    { id: "9", title: "Rapture", artist: "Soldier Boy", coverUrl: "https://i.ytimg.com/vi/kw2EfBohFyI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDubC61MWFCuQ8dLtPh44k5Weo85A", waveformUrl: "", genre: "", createdAt: "", durationSeconds: 0 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const footerLinks = [
    "Directory", "About us", "Artist Resources", "Newsroom", "Topics", 
    "Jobs", "Developers", "Help", "Legal", "Privacy", "Cookie Policy", 
    "Cookie Manager", "Imprint", "Charts", "Transparency Reports"
  ];

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans antialiased overflow-x-hidden">
      
      {/* ── 1. Hero Section ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="px-4 pt-4 max-w-[1240px] mx-auto"
      >
        <div className="relative h-[440px] w-full rounded-xl overflow-hidden bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={HERO_SLIDES[index].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_SLIDES[index].image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
              <div className="relative z-20 h-full flex flex-col justify-center px-12 -mt-4">
                <motion.h1 className="text-5xl font-bold mb-6 max-w-xl">{HERO_SLIDES[index].title}</motion.h1>
                <motion.p className="text-base text-white/90 max-w-lg mb-8">{HERO_SLIDES[index].subtitle}</motion.p>
                <Link to="/create-account">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-fit bg-white text-black px-6 py-2 rounded-sm font-bold text-sm"
                  >
                    {HERO_SLIDES[index].buttonText}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── 2. Search Section ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="flex flex-col items-center pt-10 pb-10"
      >
        <div className="flex items-center gap-4 w-full max-w-3xl px-6">
          <div className="flex-1 flex items-center bg-[#2e2e2e] rounded-sm px-4 h-[44px]">
            <input className="bg-transparent border-none outline-none text-white text-sm w-full" placeholder="Search for artists, bands, tracks, podcasts" />
          </div>
          <span className="text-zinc-400 font-medium text-sm">or</span>
          <Link to="/create-account">
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#e2e2e2" }}
              className="bg-white text-black h-[44px] px-8 rounded-sm text-sm font-bold transition-colors"
            >
              Upload your own
            </motion.button>
          </Link>        
        </div>
      </motion.section>

      {/* ── 3. Trending Tracks Section ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-[1240px] mx-auto px-4 text-center pb-20"
      >
        <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-10">Hear what's trending for free in the SoundCloud community</motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12 mb-16 text-left">
          {trendingTracks.map((track) => (
            <motion.div key={track.id} variants={fadeInUp} whileHover={{ y: -5 }}>
              <DiscoverCard item={track} />
            </motion.div>
          ))}
        </div>
        <motion.button 
          variants={fadeInUp}
          whileHover={{ scale: 1.05 }}
          className="bg-white text-black px-10 py-3 rounded-sm text-sm font-bold mb-10"
        >
          Explore trending playlists
        </motion.button>
      </motion.section>

      {/* ── 4. Never Stop Listening Section ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="px-4 py-4 flex justify-center"
      >
        <div className="relative w-full max-w-[1240px] h-[360px] bg-black rounded-xl overflow-hidden flex items-center border border-white/5 shadow-2xl">
          <div 
            className="absolute inset-0 bg-no-repeat bg-black"
            style={{ 
              backgroundImage: `url('https://techcrunch.com/wp-content/uploads/2025/10/SoundCloud-socialupdate.png?w=1024')`,
              backgroundPosition: 'left center',
              backgroundSize: 'contain',
              width: '55%' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/60" />
          <div className="relative z-10 w-full flex justify-end px-16 text-white">
            <div className="max-w-md">
              <h2 className="text-[36px] font-bold mb-3 tracking-tight leading-none">Never stop listening</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] bg-orange-500 mb-6" 
              />
              <p className="text-[18px] text-zinc-400 mb-8 leading-relaxed font-light">
                SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.
              </p>
              <div className="flex gap-4">
                 <motion.img whileHover={{ scale: 1.1 }} src="https://freepngimg.com/save/58666-play-google-button-now-app-store/2500x846" alt="App Store" className="h-10 cursor-pointer brightness-110" />
                 <motion.img whileHover={{ scale: 1.1 }} src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Google_Play_2022_logo.svg/3840px-Google_Play_2022_logo.svg.png" alt="Google Play" className="h-10 cursor-pointer brightness-110" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. Calling All Creators Section ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="px-4 py-4 flex justify-center"
      >
        <div className="relative w-full max-w-[1240px] h-[360px] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
          <div 
            className="absolute inset-0 bg-no-repeat bg-cover opacity-80"
            style={{ 
              backgroundImage: `url('https://reviewed-com-res.cloudinary.com/image/fetch/s--qbsvJ1xg--/b_white,c_limit,cs_srgb,f_auto,fl_progressive.strip_profile,g_center,q_auto,w_792/https://reviewed-production.s3.amazonaws.com/attachment/32bfe061d4ba40bb/SoundCloudForArtists.jpg')`,
              backgroundPosition: 'right center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-16 text-white">
            <h2 className="text-[36px] font-bold mb-4 leading-none">Calling all creators</h2>
            <p className="text-[17px] text-zinc-400 mb-8 max-w-[440px] leading-relaxed font-light">
              Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#f97316", color: "white" }}
              className="w-fit bg-white text-black px-8 py-3 rounded-full font-bold text-[14px] transition-all uppercase tracking-wider shadow-lg"
            >
              Find out more
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ── 6. Final Join Section & Footer ── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="pt-20 pb-12 flex flex-col items-center text-center px-4"
      >
        <h2 className="text-[48px] font-medium mb-2 tracking-tight">Thanks for listening. Now join in.</h2>
        <p className="text-[22px] text-zinc-400 mb-10 font-light">Save tracks, follow artists and build playlists. All for free.</p>
        
        <Link to="/create-account">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-12 py-4 rounded-md font-bold text-[18px] mb-6"
          >
            Create account
          </motion.button>
        </Link>

        <div className="flex items-center gap-2 mb-24">
          <span className="text-zinc-500 text-sm">Already have an account?</span>
          <Link to="/signin">
            <button className="text-white font-bold text-sm hover:underline">Sign in</button>
          </Link>        
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[1240px] border-t border-zinc-800 pt-8"
        >
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6">
            {footerLinks.map((link) => (
              <a key={link} href="#" className="text-zinc-500 text-[13px] hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="flex justify-center items-center gap-1 text-[13px]">
            <span className="text-zinc-500">Language:</span>
            <button className="text-[#3399FF] hover:underline">English (US)</button>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
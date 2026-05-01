import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";

// Optimized Imports"   ;
import SearchBar from "../components/searchBar";

import TrendingList from "../components/trendingList";
const HERO_SLIDES = [
  {
    id: 1,
    title: "Discover. Get Discovered.",
    subtitle: "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together to discover and connect through music.",
    buttonText: "Get Started",
    image: "https://linkstorage.linkfire.com/medialinks/images/997e4c9e-8ca5-4665-8621-1d081cc8887c/artwork-440x220.jpg",
  },
  {
    id: 2,
    title: "It all starts with an upload.",
    subtitle: "From bedrooms and broom closets to studios and stadiums, SoundCloud is where you define what's next in music. Just hit upload.",
    buttonText: "Upload",
    image: "https://i.ytimg.com/vi/TPmT0ufa_eU/maxresdefault.jpg",
  }
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
} as const;

export default function SoundCloudLanding() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
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
                <h1 className="text-5xl font-bold mb-6 max-w-xl">{HERO_SLIDES[index].title}</h1>
                <p className="text-base text-white/90 max-w-lg mb-8">{HERO_SLIDES[index].subtitle}</p>
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
            <SearchBar /> {/* DYNAMIC: Fetches real results from musicApi */}
  
          <Link to="/create-account">
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#e2e2e2" }}
              className="bg-white text-black h-[44px] px-8 rounded-sm text-sm font-bold transition-colors whitespace-nowrap"
            >
              Upload your own
            </motion.button>
          </Link>        
        </div>
      </motion.section>

      {/* ── 3. Dynamic Trending Section ── */}
      <section className="max-w-[1240px] mx-auto px-4 pb-20">
        <TrendingList /> {/* DYNAMIC: Staggered animation and real API data */}
      </section>

      {/* ── 4. Mobile Promo ── */}
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
              <div className="h-[2px] bg-orange-500 mb-6 w-16" />
              <p className="text-[18px] text-zinc-400 mb-8 leading-relaxed font-light">
                SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.
              </p>
              <div className="flex gap-4">
                 <img src="https://freepngimg.com/save/58666-play-google-button-now-app-store/2500x846" alt="App Store" className="h-10 brightness-110" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Google_Play_2022_logo.svg/3840px-Google_Play_2022_logo.svg.png" alt="Google Play" className="h-10 brightness-110" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. Creator Promo ── */}
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

      {/* ── 6. Footer ── */}
      <footer className="pt-20 pb-12 flex flex-col items-center text-center px-4">
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

        <div className="w-full max-w-[1240px] border-t border-zinc-800 pt-8">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6">
            {footerLinks.map((link) => (
              <a key={link} href="#" className="text-zinc-500 text-[13px] hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
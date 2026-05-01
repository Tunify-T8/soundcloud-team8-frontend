import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the hook
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { musicApi } from  "../service/landingPageService";
import type { TrendingItem } from '../types';

const FALLBACK_IMAGE = "https://sites.duke.edu/dek23/wp-content/themes/koji/assets/images/default-fallback-image.png";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

const TrendingList = () => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        // Fetching items for the current week
        const data = await musicApi.getTrending('track', 'week');
        setTrendingItems(data.items || []);
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  // Function to handle the redirect
  const handleCardClick = () => {
    navigate('/signin'); // Adjust this path if your route is named differently (e.g., '/login')
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section className="py-12 min-h-[400px]">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Hear what’s trending for free in the SoundCloud community
        </h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }} 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        {trendingItems.map((item) => (
          <motion.div 
            key={item.id} 
            variants={cardVariants}
            whileHover={{ y: -5 }}
            onClick={handleCardClick} // Added click listener
            className="group cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-800 mb-3 shadow-lg">
              <img 
                src={item.coverUrl || FALLBACK_IMAGE}
                alt={item.name} 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                 </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-white truncate group-hover:text-orange-500 transition-colors">
                {item.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {item.artist}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TrendingList;
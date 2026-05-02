import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the hook
import { motion, AnimatePresence } from "framer-motion";
import { musicApi } from "../service/landingPageService";
import type { AutocompleteResults } from "../types";

const SearchBar = () => {
  const [results, setResults] = useState<AutocompleteResults>({ 
    tracks: [], 
    users: [], 
    collections: [] 
  });
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.length >= 1) {
      try {
        const data = await musicApi.getAutocomplete(query);
        setResults(data);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    } else {
      setResults({ tracks: [], users: [], collections: [] });
    }
  };

  // Shared redirect function
  const handleResultSelection = () => {
    navigate('/signin'); // Redirects to your sign-in route
  };

  const hasResults = results.tracks.length > 0 || results.users.length > 0;

  return (
    <div className="relative w-full max-w-3xl">
      {/* Search Input Container */}
      <div className="flex items-center bg-[#2e2e2e] rounded-sm px-4 h-[44px] transition-all focus-within:bg-[#3e3e3e]">
        <input 
          type="text" 
          onChange={handleInputChange} 
          onFocus={() => setIsFocused(true)}
          // Keep the timeout so the onClick has time to fire before the input blurs
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-400" 
          placeholder="Search for tracks, artists..." 
        />
      </div>

      {/* Animated Dropdown Results */}
      <AnimatePresence>
        {isFocused && hasResults && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[48px] left-0 w-full bg-[#121212] border border-zinc-800 rounded-sm z-50 overflow-hidden shadow-2xl"
          >
            <div className="max-h-[400px] overflow-y-auto p-2">
              {/* Tracks Section */}
              {results.tracks.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-zinc-500 text-[11px] uppercase font-bold px-3 mb-2 tracking-wider">Tracks</h4>
                  {results.tracks.map(track => (
                    <motion.div 
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      key={track.id} 
                      onClick={handleResultSelection} // Add redirect here
                      className="px-3 py-2 text-sm cursor-pointer rounded-sm"
                    >
                      <span className="text-white">{track.title}</span>
                      <span className="text-zinc-400"> by {track.artist}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Artists Section */}
              {results.users.length > 0 && (
                <div>
                  <h4 className="text-zinc-500 text-[11px] uppercase font-bold px-3 mb-2 tracking-wider">Artists</h4>
                  {results.users.map(user => (
                    <motion.div 
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      key={user.id} 
                      onClick={handleResultSelection} // Add redirect here
                      className="px-3 py-2 text-sm cursor-pointer rounded-sm text-white"
                    >
                      {user.displayName || user.username}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
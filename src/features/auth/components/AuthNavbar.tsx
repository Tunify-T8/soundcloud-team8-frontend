import { Search } from 'lucide-react';
import { SiSoundcloud } from 'react-icons/si';
import { Link } from 'react-router-dom';

const AuthNavbar: React.FC<{ onCreateAccount?: () => void }> = ({ onCreateAccount }) => (
  <nav className="w-full h-12 bg-black text-white border-b border-zinc-800" data-testid="authNavbar">
    <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 sm:px-6">

      {/* LEFT */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link to="/" className="text-white flex-shrink-0" data-testid="navLogoLink">
          <SiSoundcloud size={28} className="sm:text-[35px]" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-zinc-400 hover:text-white font-bold tracking-tight text-sm" data-testid="navHomeLink">Home</Link>
          <Link to="/stream" className="text-zinc-400 hover:text-white font-bold tracking-tight text-sm" data-testid="navFeedLink">Feed</Link>
          <Link to="/library" className="text-zinc-400 hover:text-white font-bold tracking-tight text-sm" data-testid="navLibraryLink">Library</Link>
        </div>
      </div>

      {/* SEARCH - hidden on mobile */}
      <div className="relative hidden md:block md:w-[280px] lg:w-[420px] flex-shrink-0">
        <input
          type="text"
          placeholder="Search for artists, bands, tracks, podcasts"
          className="w-full bg-zinc-900 text-sm text-white placeholder-zinc-400 pl-4 pr-10 py-1.5 rounded-md focus:outline-none"
          data-testid="navSearchInput"
        />
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" data-testid="navSearchIcon" />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-4 text-sm">
        <Link to="/signin" className="text-white font-bold hover:text-zinc-300 text-xs sm:text-sm" data-testid="navSignInLink">Sign in</Link>
        <button
          onClick={onCreateAccount}
          className="bg-white text-black font-bold px-3 sm:px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap"
          data-testid="navCreateAccountBtn"
        >
          Create account
        </button>
        <Link to="/upload" className="hidden sm:block text-zinc-400 hover:text-white font-bold tracking-tight text-sm" data-testid="navUploadLink">Upload</Link>
        <span className="hidden sm:block text-zinc-400 text-lg cursor-default" data-testid="navMoreActions">···</span>
      </div>

    </div>
  </nav>
);

export default AuthNavbar;

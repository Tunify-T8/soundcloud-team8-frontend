import { Home, Archive, BarChart2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { SiSoundcloud } from "react-icons/si";

export default function ArtistsSidebar() {
  return (
 <nav data-testid="artists-sidebar" className="w-[90px] bg-black border-r border-[hsl(0,0%,15%)] flex flex-col items-center pt-4 pb-6 gap-1 shrink-0 sticky top-0 h-screen">
   <Link to="/" data-testid="sidebar-logo-link">
      <div className="flex items-center gap-6">
        <SiSoundcloud size={35} />
      </div>
    </Link>

   <Link to="/">
      <button data-testid="sidebar-nav-home" className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>
    </Link>

 <Link to="/feed">
    <button data-testid="sidebar-nav-feed" className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
      <Archive className="w-5 h-5" />
      <span className="text-[10px]">Feed</span>
    </button>
    </Link>

 <Link to="/library">
    <button data-testid="sidebar-nav-library" className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
      <BarChart2 className="w-5 h-5" />
      <span className="text-[10px]">Library</span>
    </button>
    </Link>
      <div className="mt-auto">
        <button data-testid="sidebar-more-menu" className="flex flex-col gap-[3px] items-center text-[hsl(0,0%,45%)] hover:text-white transition-colors px-3 py-2">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </button>
      </div>
    </nav>
  );
}

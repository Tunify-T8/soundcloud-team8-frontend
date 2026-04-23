import { Home, Archive, BarChart2, Star } from "lucide-react";
import { Link } from 'react-router-dom';
import { SiSoundcloud } from "react-icons/si";

export default function ArtistsSidebar() {
  return (
 <nav className="w-[90px] bg-black border-r border-[hsl(0,0%,15%)] flex flex-col items-center pt-4 pb-6 gap-1 shrink-0 sticky top-0 h-screen">
   <a href="/">
      <div className="flex items-center gap-6">
        <SiSoundcloud size={35} />
      </div>
    </a>

   <Link to="/">
      <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>
    </Link>

 <Link to="/feed">
    <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
      <Archive className="w-5 h-5" />
      <span className="text-[10px]">Feed</span>
    </button>
    </Link>

 <Link to="/library">
    <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
      <BarChart2 className="w-5 h-5" />
      <span className="text-[10px]">Library</span>
    </button>
    </Link>

    <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
      <Star className="w-5 h-5" />
      <span className="text-[10px]">Featured</span>
    </button>
      <div className="mt-auto">
        <button className="flex flex-col gap-[3px] items-center text-[hsl(0,0%,45%)] hover:text-white transition-colors px-3 py-2">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </button>
      </div>
    </nav>
  );
}
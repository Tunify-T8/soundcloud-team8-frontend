import { useMe } from "@/features/profile/context/useMe";
import { Search, Upload, Bell, Mail } from "lucide-react";
import { Link } from 'react-router-dom';

export default function ArtistsNavbar() {
  const { me } = useMe();
  
  return (
    <div data-testid="artists-navbar" className="bg-black border-b border-[hsl(0,0%,15%)] flex items-center justify-end gap-2 px-6 h-[52px] shrink-0">
      <Link to="/search">
        <button data-testid="navbar-search-btn" className="flex items-center gap-2 border border-[hsl(0,0%,32%)] rounded-full px-4 py-1.5 text-white text-sm font-bold tracking-tighter hover:border-white transition-colors">
          <Search className="w-3.5 h-3.5"/> Search
        </button>
      </Link>
     
     <Link to="/upload">
        <button data-testid="navbar-upload-btn" className="flex items-center gap-2 border border-[hsl(0,0%,32%)] rounded-full px-4 py-1.5 text-white text-sm font-bold tracking-tighter hover:border-white transition-colors">
          <Upload className="w-3.5 h-3.5"/> Upload
        </button>
      </Link>
      
      <button data-testid="navbar-notifications-btn" className="text-[hsl(0,0%,55%)] hover:text-white transition-colors p-1.5"><Bell className="w-5 h-5" /></button>
      <button data-testid="navbar-messages-btn" className="text-[hsl(0,0%,55%)] hover:text-white transition-colors p-1.5"><Mail className="w-5 h-5" /></button>
     
      <Link to="/me">
      <button data-testid="navbar-avatar-btn" className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[hsl(0,0%,28%)]">
        {me?.avatarUrl ? (
          <img data-testid="navbar-avatar-img" src={me.avatarUrl} alt="User" className="w-full h-full object-cover" />
        ) : (
          <span data-testid="navbar-avatar-initials" className="text-xs text-white font-bold">
            {me?.username?.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
      </Link>
    </div>
  );
}

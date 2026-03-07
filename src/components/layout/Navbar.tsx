import { Search, Bell, Mail, MoreHorizontal } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
export default function Navbar() {
  return (
    <>
    <nav className="w-full h-12 bg-black text-white border-b border-zinc-800">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-orange-500">
            <SiSoundcloud size={28} />
          </Link>

          <Link to="/" className="text-white text-sm font-medium">
            Home
          </Link>
          <Link to="/feed" className="text-zinc-400 hover:text-white text-sm">
            Feed
          </Link>
          <Link to="/library" className="text-zinc-400 hover:text-white text-sm">
            Library
          </Link>
        </div>

        {/* SEARCH */}
        <div className="relative w-[420px]">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-zinc-900 text-sm text-white placeholder-zinc-400
                       pl-4 pr-10 py-1.5 rounded-md focus:outline-none"
          />

          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-5 text-sm">
          <Link
            to="/pro"
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Try Artist Pro
          </Link>

          <Link to="/artists" className="text-zinc-400 hover:text-white">
            For Artists
          </Link>

          <Link to="/upload" className="text-zinc-400 hover:text-white">
            Upload
          </Link>

          <Bell size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
          <Mail size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
          <MoreHorizontal size={18} className="text-zinc-400 hover:text-white cursor-pointer" />

          <div className="w-7 h-7 bg-zinc-600 rounded-full cursor-pointer" />
        </div>

      </div>
    </nav>
    <Outlet />
    </>
  );
}
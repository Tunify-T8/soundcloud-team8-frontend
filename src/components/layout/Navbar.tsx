import { Search, Bell, Mail, MoreHorizontal } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { profileService } from "../features/profile/profileService";

export default function Navbar() {
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    profileService
      .getMeProfile()
      .then((user) => {
        setAvatarUrl(user.avatarUrl ?? null);
        setUsername(user.username);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <nav className="w-full h-12 bg-black text-white border-b border-zinc-800">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white-500">
              <SiSoundcloud size={35} />
            </Link>

            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-bold tracking-tight"
            >
              Home
            </Link>
            <Link
              to="/feed"
              className="text-zinc-400 hover:text-white font-bold tracking-tight"
            >
              Feed
            </Link>
            <Link
              to="/library"
              className="text-zinc-400 hover:text-white font-bold tracking-tight"
            >
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
              className="text-orange-500 hover:text-orange-400 font-bold tracking-tight"
            >
              Try Artist Pro
            </Link>

            <Link
              to="/artists"
              className="text-zinc-400 hover:text-white font-bold tracking-tight"
            >
              For Artists
            </Link>

            <Link
              to="/upload"
              className="text-zinc-400 hover:text-white font-bold tracking-tight"
            >
              Upload
            </Link>

            <Bell
              size={18}
              className="text-zinc-400 hover:text-white cursor-pointer"
            />

            <Link to="/messages" className="text-zinc-400 hover:text-white">
              <Mail size={18} className="cursor-pointer" />
            </Link>
            <MoreHorizontal
              size={18}
              className="text-zinc-400 hover:text-white cursor-pointer"
            />

            <Link
              to={username ? `/${username}` : "/me"}
              className="w-7 h-7 bg-zinc-600 rounded-full cursor-pointer flex items-center justify-center overflow-hidden"
              title="My Profile"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="My Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="sr-only">My Profile</span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

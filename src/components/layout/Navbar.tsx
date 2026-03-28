import { Search, Bell, Mail, MoreHorizontal, ChevronDown, 
  LogOut, Heart, ListMusic, Radio, Users, UserPlus, Star, BarChart2, TrendingUp, Share2, 
  User} from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../features/profile/context/useMe";
import { logout } from "../../features/auth/services/index";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // clear tokens regardless
    }
    navigate("/signin");
  };

  const profileMenuItems = [
    { to: "/me",            icon: <User size={17} />,        label: "Profile" },
    { to: "/likes",         icon: <Heart size={17} />,       label: "Likes" },
    { to: "/playlists",     icon: <ListMusic size={17} />,   label: "Playlists" },
    { to: "/stations",      icon: <Radio size={17} />,       label: "Stations" },
    { to: "/following",     icon: <Users size={17} />,       label: "Following" },
    { to: "/who-to-follow", icon: <UserPlus size={17} />,    label: "Who to follow" },
    { to: "/pro",           icon: <Star size={17} />,        label: "Try Artist Pro", orange: true },
    { to: "/benefits",      icon: <Star size={17} />,        label: "Benefits" },
    { to: "/tracks",        icon: <BarChart2 size={17} />,   label: "Tracks" },
    { to: "/insights",      icon: <TrendingUp size={17} />,  label: "Insights" },
    { to: "/distribute",    icon: <Share2 size={17} />,      label: "Distribute" },
  ];

  const menuItems : { group: { label: string; href?: string; action?: () => void }[] }[] =  [
  { group: [
    { label: "About us",         href: "/about" },
    { label: "Legal",            href: "/legal" },
    { label: "Copyright",        href: "/copyright" },
  ]},
  { group: [
    { label: "Mobile apps",      href: "/mobile" },
    { label: "Artist Membership",href: "/artist-membership" },
    { label: "Newsroom",         href: "/newsroom" },
    { label: "Jobs",             href: "/jobs" },
    { label: "Developers",       href: "/developers" },
    { label: "SoundCloud Store", href: "/store" },
  ]},
  { group: [
    { label: "Support",          href: "/support" },
    { label: "Keyboard shortcuts",href: "/shortcuts" },
  ]},
  { group: [
    { label: "Subscription",     href: "/subscription" },
    { label: "Settings",         href: "/settings" },
    { label: "Sign out",         action: handleSignOut },
  ]},
];

  return (
    <>
      <nav className="w-full h-12 bg-black text-white border-b border-zinc-800">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">

          {/* Left links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white">
              <SiSoundcloud size={35} />
            </Link>
            <Link to="/" className="text-zinc-400 hover:text-white font-bold tracking-tight">Home</Link>
            <Link to="/feed" className="text-zinc-400 hover:text-white font-bold tracking-tight">Feed</Link>
            <Link to="/library" className="text-zinc-400 hover:text-white font-bold tracking-tight">Library</Link>
          </div>

          {/* Search */}
          <div className="relative w-[420px]">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-zinc-900 text-sm text-white placeholder-zinc-400 pl-4 pr-10 py-1.5 rounded-md focus:outline-none"
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>

          <div className="flex items-center gap-5 text-sm">
            <Link to="/pro" className="text-orange-500 hover:text-orange-400 font-bold tracking-tight">Try Artist Pro</Link>
            <Link to="/artists" className="text-zinc-400 hover:text-white font-bold tracking-tight">For Artists</Link>
            <Link to="/upload" className="text-zinc-400 hover:text-white font-bold tracking-tight ml-1">Upload</Link>

            <div className="relative flex items-center gap-0" ref={profileMenuRef}>
              <Link
                to="/me"
                className="w-7 h-7 bg-zinc-600 rounded-full cursor-pointer flex items-center justify-center overflow-hidden"
                title="My Profile"
              >
                {me?.avatarUrl ? (
                  <img src={me.avatarUrl} alt="My Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-xs text-white font-bold">
                    {me?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>

              <ChevronDown
                size={16}
                className={`cursor-pointer transition-transform duration-200 -ml-0.1 ${
                  profileMenuOpen ? "text-white rotate-180" : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => setProfileMenuOpen((v) => !v)}
              />

              {profileMenuOpen && (
                <div className="absolute left-0 top-10 w-40 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-1.5
                        font-bold text-sm tracking-tight
                        transition-colors duration-150
                        ${item.orange
                          ? "text-orange-500 hover:text-orange-400"
                          : "text-white hover:text-zinc-400"
                        }
                      `}
                    >
                      <span className={item.orange ? "text-orange-500" : "text-white"}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                 
                </div>
              )}
            </div>

            <Bell size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
            <Link to="/messages" className="text-zinc-400 hover:text-white">
              <Mail size={18} className="cursor-pointer" />
            </Link>

           <div className="relative" ref={menuRef}>
              <MoreHorizontal
                size={18}
                className="text-zinc-400 hover:text-white cursor-pointer"
                onClick={() => setMenuOpen((v) => !v)}
              />
              {menuOpen && (
                <div className="absolute right-0 top-7 w-50 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                  {menuItems.map((section, i) => (
                    <div key={i} className={i !== 0 ? "border-t border-zinc-800" : ""}>
                      {section.group.map((item) =>
                       item.action ? (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => { item.action(); setMenuOpen(false); }}
                            className="w-full text-left px-4 py-3.5 font-bold text-sm text-white hover:text-zinc-400 transition-colors duration-150"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.href!}
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-1.5 font-bold text-sm text-white hover:text-zinc-400 transition-colors duration-150"
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
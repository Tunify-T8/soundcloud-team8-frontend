"use client";
import { 
  Bell, Mail, MoreHorizontal, ChevronDown, Heart, ListMusic, Radio, Users, UserPlus, Star, BarChart2, TrendingUp, Share2, 
  User, Menu, X, Settings, Smartphone, Shield, Briefcase, Code, Info, HelpCircle, Keyboard, Zap
} from "lucide-react";
import SearchBar from "../ui/SearchBar";

import { SiSoundcloud } from "react-icons/si";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../features/profile/context/useMe";
import { clearClientSessionData, logout } from "../../features/auth/services/index";
import { io, Socket } from "socket.io-client";
import {
  getNotifications,
  markAllAsRead,
  followUser,
  unfollowUser,
} from "@/features/notifications/service/service"; 
import type { NotificationObject } from "@/features/notifications/types";
import { getAccessToken, getStoredUser } from "@/features/auth/utils/token.utils";
import CheckoutModal from "../../features/premium/components/CheckoutModal";
import { socketSingleton } from "../../features/conversation/hooks/useSocket";
import { useUnreadMessages } from "../../features/conversation/hooks/useUnreadMessages";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionBadge from "@/features/premium/components/SubscriptionBadge";
import MyPlanModal from "@/features/premium/components/MyPlanModal";
import { clearUser } from "@/store/userSlice";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { applyTheme } from "../../features/settings/hooks/useTheme";
import type { Theme } from "../../features/settings/types/settings.types";
import type { Variants } from "framer-motion";

// Animation imports
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: 0.15 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 }
};

function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function normaliseSocketPayload(raw: Record<string, unknown>): NotificationObject {
  return {
    id: raw.id as string,
    type: raw.type as NotificationObject["type"],
    actor: raw.actor as NotificationObject["actor"],
    referenceId: (raw.referenceId ?? null) as string | null,
    message: raw.message as string,
    isRead: false,
    readAt: null,
    createdAt: raw.createdAt as string,
    isFollowed: raw.isFollowed as boolean,
  };
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = useMe();
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.user.currentUser?.id ?? null);
  const { unreadMessages } = useUnreadMessages(currentUserId);
  const { setIsPlaying } = usePlayer();

  const { tier, isArtist, isArtistPro } = useSubscription();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const storedUser = getStoredUser();
  const isAdmin = storedUser?.role?.toLowerCase() === "admin";
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // RESTORED: FULL MORE MENU FROM SCREENSHOT
  const moreMenuLinks = [
    { to: "/about", label: "About us", icon: <Info size={16} /> },
    { to: "/legal", label: "Legal", icon: <Shield size={16} /> },
    { to: "/copyright", label: "Copyright", icon: <Shield size={16} /> },
    { to: "/mobile", label: "Mobile apps", icon: <Smartphone size={16} /> },
    { to: "/membership", label: "Artist Membership", icon: <Star size={16} /> },
    { to: "/newsroom", label: "Newsroom", icon: <Radio size={16} /> },
    { to: "/jobs", label: "Jobs", icon: <Briefcase size={16} /> },
    { to: "/developers", label: "Developers", icon: <Code size={16} /> },
    { to: "/store", label: "SoundCloud Store", icon: <SiSoundcloud size={16} /> },
    { to: "/support", label: "Support", icon: <HelpCircle size={16} /> },
    { to: "/shortcuts", label: "Keyboard shortcuts", icon: <Keyboard size={16} /> },
    { to: "/subscriptions", label: "Subscriptions", icon: <Zap size={16} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !me?.id) return;
    socketSingleton.connect(token);
  }, [me?.id]);

  useEffect(() => {
    const token = getAccessToken() ?? "";
    if (!token) return;

    const socket = io("https://tunify.duckdns.org/notifications", {
      query: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 400,
    });

    socketRef.current = socket;

    const handleNewNotification = (raw: Record<string, unknown>) => {
      try {
        const notif = normaliseSocketPayload(raw);
        setNotifications((prev) => [notif, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      } catch { }
    };

    socket.on("notification", handleNewNotification);
    socket.on("user_followed", handleNewNotification);
    socket.on("track_liked", handleNewNotification);
    socket.on("track_commented", handleNewNotification);
    socket.on("track_reposted", handleNewNotification);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [me?.id]);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await getNotifications({ limit: 10 });
      setNotifications(res.data);
    } catch { } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleBellClick = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      await fetchNotifications();
      try {
        await markAllAsRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch { }
    }
  };

  const handleFollowBack = async (actorId: string, isFollowed?: boolean) => {
    if (!actorId) return;
    setNotifications((prev) => prev.map((notif) => notif.actor?.id === actorId ? { ...notif, isFollowed: !isFollowed } : notif));
    try {
      if (isFollowed) await unfollowUser(actorId);
      else await followUser(actorId);
    } catch {
      setNotifications((prev) => prev.map((notif) => notif.actor?.id === actorId ? { ...notif, isFollowed } : notif));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) setAdminMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsPlaying(false);
    const currentTheme = (localStorage.getItem("sc-theme") || localStorage.getItem("tunify-theme") || document.documentElement.getAttribute("data-theme")) as Theme | null;
    try { await logout(); } catch { }
    dispatch(clearUser());
    clearClientSessionData();
    if (currentTheme === "light" || currentTheme === "dark") {
      localStorage.setItem("sc-theme", currentTheme);
      applyTheme(currentTheme);
    }
    navigate("/signed-out", { replace: true }); 
  };

  const hasPaidPlan = isArtist || isArtistPro;
  const avatarBadge = tier !== "free";
  
  const isHomeActive = location.pathname === "/" || location.pathname.startsWith("/discover");
  const isFeedActive = location.pathname.startsWith("/feed") || location.pathname.startsWith("/search");
  const isLibraryActive = location.pathname.startsWith("/library") || location.pathname.startsWith("/me/");

  return (
    <>
      <nav className="w-full bg-black text-white border-b border-zinc-800 sticky top-0 z-50">
        <div className="mx-auto flex h-12 max-w-[1510px] items-center gap-4 px-4 md:gap-6 md:pl-16 md:pr-6 xl:pl-24">
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
            <Link to="/discover" className="text-white"><SiSoundcloud size={28} className="sm:text-[35px]" /></Link>
            <div className="hidden md:flex items-center gap-7 self-stretch">
              <NavLink to="/discover" className={`relative flex h-12 items-center px-0 text-[15px] font-bold tracking-tight transition-colors ${isHomeActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                Home {isHomeActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
              </NavLink>
              <NavLink to="/feed" className={`relative flex h-12 items-center px-0 text-[15px] font-bold tracking-tight transition-colors ${isFeedActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                Feed {isFeedActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
              </NavLink>
              <NavLink to="/library" className={`relative flex h-12 items-center px-0 text-[15px] font-bold tracking-tight transition-colors ${isLibraryActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                Library {isLibraryActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
              </NavLink>
            </div>
          </div>

          <div className="relative hidden min-w-0 flex-1 md:block md:max-w-[590px]"><SearchBar /></div>

          <div className="hidden shrink-0 items-center gap-4 text-sm md:flex">
            {isAdmin ? (
              <div className="relative" ref={adminMenuRef}>
                <button type="button" onClick={() => setAdminMenuOpen((v) => !v)} className="border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-tight px-3 py-1 rounded-sm text-xs flex items-center gap-1">
                  Admin <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {adminMenuOpen && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="absolute right-0 top-9 w-44 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                      {["Dashboard", "Reports", "Content", "Users"].map((item) => (
                        <motion.div key={item} variants={itemVariants}>
                          <Link to={`/admin/${item.toLowerCase()}`} onClick={() => setAdminMenuOpen(false)} className="block px-4 py-2 font-bold text-sm text-white hover:text-zinc-400">{item}</Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : hasPaidPlan ? (
              <button onClick={() => setPlanModalOpen(true)} className="border border-orange-500 text-white font-bold tracking-tight px-3 py-1 rounded-sm text-xs">My Plan</button>
            ) : (
              <ArtistProUpgradeButton className="border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-tight px-3 py-1 rounded-sm text-xs">Try Free</ArtistProUpgradeButton>
            )}

            <Link to="/artists" className="text-zinc-400 hover:text-white font-bold tracking-tight">For Artists</Link>
            <Link to="/upload" className="text-zinc-400 hover:text-white font-bold tracking-tight">Upload</Link>

            {/* PROFILE MENU */}
            <div className="relative flex items-center gap-0" ref={profileMenuRef}>
              <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="relative w-7 h-7 bg-zinc-600 rounded-full cursor-pointer flex items-center justify-center">
                <span className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {me?.avatarUrl ? <img src={me.avatarUrl} alt="My Profile" className="w-full h-full object-cover rounded-full" /> : <span className="text-xs text-white font-bold">{me?.username?.charAt(0).toUpperCase()}</span>}
                </span>
                {avatarBadge && <span className="absolute right-0 top-0 z-10 translate-x-[28%] -translate-y-[18%]"><SubscriptionBadge tier={tier} size={16} /></span>}
              </div>
              <ChevronDown size={16} className={`cursor-pointer transition-transform duration-200 ${profileMenuOpen ? "text-white rotate-180" : "text-zinc-400"}`} onClick={() => setProfileMenuOpen(!profileMenuOpen)} />
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="absolute left-0 top-10 w-44 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                    <motion.div variants={itemVariants}><Link to="/me" className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-white hover:text-zinc-400"><User size={17} /> Profile</Link></motion.div>
                    <motion.div variants={itemVariants}><Link to="/me/likes" className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-white hover:text-zinc-400"><Heart size={17} /> Likes</Link></motion.div>
                    <motion.div variants={itemVariants}><Link to="/me/following" className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-white hover:text-zinc-400"><Users size={17} /> Following</Link></motion.div>
                    <motion.div variants={itemVariants} className="border-t border-zinc-800 mt-1"><button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 px-4 py-2 font-bold text-sm text-white hover:text-zinc-400">Sign out</button></motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative" ref={notifRef}>
              <button onClick={handleBellClick} className="relative text-zinc-400 hover:text-white transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{unreadCount}</span>}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="absolute right-0 top-8 w-[380px] bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-4 border-b border-zinc-800 font-black">Notifications</div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifLoading ? <div className="px-4 py-8 text-center text-zinc-500 text-sm">Loading...</div> : sortedNotifications.length === 0 ? <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications</div> : sortedNotifications.map((notif) => (
                        <motion.div key={notif.id} variants={itemVariants}><DropdownNotifRow notif={notif} onFollowBack={() => handleFollowBack(notif.actor?.id, notif.isFollowed)} onClose={() => setNotifOpen(false)} /></motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/messages" className="relative text-zinc-400 hover:text-white">
              <Mail size={18} />
              {unreadMessages > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{unreadMessages}</span>}
            </Link>

            {/* MORE MENU - FULL RESTORE */}
            <div className="relative" ref={menuRef}>
              <MoreHorizontal size={18} className="text-zinc-400 hover:text-white cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
              <AnimatePresence>
                {menuOpen && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="absolute right-0 top-7 w-56 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden py-1">
                    {moreMenuLinks.map((link) => (
                      <motion.div key={link.to} variants={itemVariants}>
                        <Link to={link.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-white hover:bg-zinc-800 transition-colors">
                          <span className="text-zinc-500">{link.icon}</span>
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div variants={itemVariants} className="border-t border-zinc-800 mt-1">
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 font-bold text-sm text-white hover:bg-zinc-800">Sign out</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
      {planModalOpen && <MyPlanModal onClose={() => setPlanModalOpen(false)} />}
    </>
  );
}

function DropdownNotifRow({ notif, onFollowBack, onClose }: { notif: NotificationObject; onFollowBack: () => void; onClose: () => void; }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-4 hover:bg-zinc-800/30 transition-colors ${!notif.isRead ? "bg-zinc-800/20" : ""}`}>
      <Link to={`/${notif.actor?.id}`} onClick={onClose} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        {notif.actor?.avatarUrl ? <img src={notif.actor.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-700 flex items-center justify-center"><User size={24} /></div>}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug">
          <Link to={`/${notif.actor?.id}`} onClick={onClose} className="font-bold hover:underline">{notif.actor?.username}</Link>{" "}
          <span className="text-white">{notif.message}</span>
        </p>
        <p className="text-xs text-zinc-500 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      {notif.type === "user_followed" && (
        <button onClick={(e) => { e.preventDefault(); onFollowBack(); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${notif.isFollowed ? "bg-zinc-700 text-zinc-400" : "bg-white text-black hover:bg-zinc-200"}`}>
          {notif.isFollowed ? "Following" : "Follow back"}
        </button>
      )}
    </div>
  );
}
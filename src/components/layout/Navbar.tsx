import { Bell, Mail, MoreHorizontal, ChevronDown, Heart, ListMusic, Radio, Users, UserPlus, Star, BarChart2, TrendingUp, Share2, 
  User, Menu, X} from "lucide-react";
import SearchBar from "../ui/SearchBar";

import { SiSoundcloud } from "react-icons/si";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../features/profile/context/useMe";
import { logout } from "../../features/auth/services/index";
import { io, Socket } from "socket.io-client";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  followUser,
  unfollowUser,
} from "@/features/notifications/service/service"; 
import type { NotificationObject } from "@/features/notifications/types";
import { getAccessToken } from "@/features/auth/utils/token.utils";
import CheckoutModal from "../../features/premium/components/CheckoutModal";
import { socketSingleton } from "../../features/conversation/hooks/useSocket";
import { useUnreadMessages } from "../../features/conversation/hooks/useUnreadMessages";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionBadge from "@/features/premium/components/SubscriptionBadge";
import MyPlanModal from "@/features/premium/components/MyPlanModal";


function timeAgo(dateStr: string): string {
  const diff = Math.max( 0 ,Date.now() - new Date(dateStr).getTime());
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
  };
}

function topNavLinkClass(isActive: boolean) {
  return `flex h-12 items-center border-b-2 px-0 text-[15px] font-bold tracking-tight transition-colors ${
    isActive
      ? "border-white text-white"
      : "border-transparent text-zinc-400 hover:text-white"
  }`;
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = useMe();
  const currentUserId = useSelector((state: RootState) => state.user.currentUser?.id ?? null);
  const { unreadMessages } = useUnreadMessages(currentUserId);

  const { tier, isArtist, isArtistPro } = useSubscription();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  // Connect the messaging socket so real-time badge works on ALL pages
  useEffect(() => {
    const token = getAccessToken();
    if (!token || !me?.id) return;
    socketSingleton.connect(token);
  }, [me?.id]);

  // ── Notification unread count ─────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch { }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Notification socket ───────────────────────────────────────────────────
  useEffect(() => {
    const token = getAccessToken() ?? "";
    if (!token) return;

    console.log("navbar connecting to:", `https://tunify.duckdns.org/notifications`);

    const socket = io("https://tunify.duckdns.org/notifications", {
      query: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 400,
    });

    socketRef.current = socket;
    socket.on("connect", () => console.log("socket connected ✅"));
    socket.on("connect_error", (e) => console.log("connect_error:", e.message));

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

  // ── Bell click ────────────────────────────────────────────────────────────
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

    // Step 1: Optimistic update - update UI immediately
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.actor?.id === actorId
          ? { ...notif, isFollowed: !isFollowed }
          : notif
      )
    );

    try {
      // Step 2: Sync with backend
      if (isFollowed) {
        await unfollowUser(actorId);
      } else {
        await followUser(actorId);
      }
      setFollowedBack((prev) => new Set([...prev, actorId]));
    } catch {
      // Step 3: If API call fails, revert the changes
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.actor?.id === actorId
            ? { ...notif, isFollowed }
            : notif
        )
      );
    }
  };

  // ── Outside-click handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try { await logout(); } catch { }
    navigate("/signin");
  };

  const profileMenuItems = [
    { to: "/me",                    icon: <User size={17} />,       label: "Profile" },
    { to: "/me/likes",              icon: <Heart size={17} />,      label: "Likes" },
    { to: "/me/sets",               icon: <ListMusic size={17} />,  label: "Playlists" },
    { to: "/me/stations",           icon: <Radio size={17} />,      label: "Stations" },
    { to: "/me/following",          icon: <Users size={17} />,      label: "Following" },
    { to: "/who-to-follow",         icon: <UserPlus size={17} />,   label: "Who to follow" },
    { to: "#",                      icon: <Star size={17} />,       label: "Try Artist Pro", orange: true, action: () => window.open("/plans", "_blank") },
    { to: "/benefits",              icon: <Star size={17} />,       label: "Benefits" },
    { to: "/artists",               icon: <BarChart2 size={17} />,  label: "Tracks" },
    { to: "/me/insights/overview",  icon: <TrendingUp size={17} />, label: "Insights" },
    { to: "#",                      icon: <Share2 size={17} />,     label: "Distribute", action: () => window.open("/plans", "_blank") },
  ];

  const menuItems: { group: { label: string; href?: string; action?: () => void }[] }[] = [
    { group: [
      { label: "About us",           href: "/about" },
      { label: "Legal",              href: "/legal" },
      { label: "Copyright",          href: "/copyright" },
    ]},
    { group: [
      { label: "Mobile apps",        href: "/mobile" },
      { label: "Artist Membership",  href: "/artist-membership" },
      { label: "Newsroom",           href: "/newsroom" },
      { label: "Jobs",               href: "/jobs" },
      { label: "Developers",         href: "/developers" },
      { label: "SoundCloud Store",   href: "/store" },
    ]},
    { group: [
      { label: "Support",            href: "/support" },
      { label: "Keyboard shortcuts", href: "/shortcuts" },
    ]},
    { group: [
      { label: "Subscription",       href: "/subscription" },
      { label: "Settings",           href: "/settings" },
      { label: "Sign out",           action: handleSignOut },
    ]},
  ];

  const hasPaidPlan = isArtist || isArtistPro;
  const avatarBadge = tier !== "free";
  const planButtonClass = isArtistPro
    ? "border-[#c9a227] hover:bg-[#c9a227] hover:text-black"
    : isArtist
      ? "border-[#b8adff] hover:bg-[#b8adff] hover:text-black"
      : "border-orange-500 hover:bg-orange-500";
  const isHomeActive =
    location.pathname === "/" || location.pathname.startsWith("/discover");
  const isFeedActive =
    location.pathname.startsWith("/feed") || location.pathname.startsWith("/search");
  const isLibraryActive =
    location.pathname.startsWith("/library") || location.pathname.startsWith("/me/");

  return (
    <>
      <nav className="w-full bg-black text-white border-b border-zinc-800 sticky top-0 z-50">
        <div className="mx-auto flex h-12 max-w-[1510px] items-center gap-4 px-4 md:gap-6 md:pl-16 md:pr-6 xl:pl-24">
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
            <Link to="/discover" className="text-white">
              <SiSoundcloud size={28} className="sm:text-[35px]" />
            </Link>
            <div className="md:hidden flex items-center gap-2 text-[12px] font-bold tracking-tight sm:gap-3 sm:text-[13px]">
              <NavLink to="/discover" className={isHomeActive ? "text-white" : "text-zinc-300 hover:text-white"}>Home</NavLink>
              <NavLink to="/feed" className={isFeedActive ? "text-white" : "text-zinc-300 hover:text-white"}>Feed</NavLink>
              <NavLink to="/library" className={isLibraryActive ? "text-white" : "text-zinc-300 hover:text-white"}>Library</NavLink>
            </div>
            <div className="hidden md:flex items-center gap-7 self-stretch">
              <NavLink to="/discover" className={topNavLinkClass(isHomeActive)}>Home</NavLink>
              <NavLink to="/feed" className={topNavLinkClass(isFeedActive)}>Feed</NavLink>
              <NavLink to="/library" className={topNavLinkClass(isLibraryActive)}>Library</NavLink>
            </div>
          </div>

          <div className="relative hidden min-w-0 flex-1 md:block md:max-w-[590px]">
            <SearchBar />
          </div>

          <div className="hidden shrink-0 items-center gap-4 text-sm md:flex">
            {hasPaidPlan ? (
              <button
                onClick={() => setPlanModalOpen(true)}
                className={`border text-white font-bold tracking-tight px-3 py-1 rounded-sm transition-colors duration-150 text-xs ${planButtonClass}`}
              >
                View My Plan
              </button>
            ) : (
              <ArtistProUpgradeButton
                className="border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-tight px-3 py-1 rounded-sm transition-colors duration-150 text-xs"
              >
                Try Free
              </ArtistProUpgradeButton>
            )}
            <Link to="/artists" className="text-zinc-400 hover:text-white font-bold tracking-tight">For Artists</Link>
            <Link to="/upload" className="text-zinc-400 hover:text-white font-bold tracking-tight ml-1">Upload</Link>

            <div className="relative flex items-center gap-0" ref={profileMenuRef}>
              <Link
                to="/me"
                className="relative w-7 h-7 bg-zinc-600 rounded-full cursor-pointer flex items-center justify-center overflow-visible"
                title="My Profile"
              >
                <span className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {me?.avatarUrl ? (
                    <img src={me.avatarUrl} alt="My Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-xs text-white font-bold">
                      {me?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                {avatarBadge && (
                  <span className="pointer-events-none absolute right-0 top-0 z-10 translate-x-[28%] -translate-y-[18%]">
                    <SubscriptionBadge tier={tier} size={16} />
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
                  {profileMenuItems.map((item) =>
                    item.action ? (
                      <button
                        key={item.label}
                        onClick={() => { item.action?.(); setProfileMenuOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-1.5 w-full text-left font-bold text-sm tracking-tight transition-colors duration-150 ${item.orange ? "text-orange-500 hover:text-orange-400" : "text-white hover:text-zinc-400"}`}
                      >
                        <span className={item.orange ? "text-orange-500" : "text-white"}>{item.icon}</span>
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-1.5 font-bold text-sm tracking-tight transition-colors duration-150 ${item.orange ? "text-orange-500 hover:text-orange-400" : "text-white hover:text-zinc-400"}`}
                      >
                        <span className={item.orange ? "text-orange-500" : "text-white"}>{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="relative text-zinc-400 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-8 w-[380px] bg-[#111] border border-zinc-800 rounded-sm shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
                    <span className="text-xl font-black text-white tracking-tight">Notifications</span>
                    <Link
                      to="/notifications/settings"
                      onClick={() => setNotifOpen(false)}
                      className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="px-4 py-8 text-center text-zinc-500 text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications yet</div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownNotifRow
                          key={notif.id}
                          notif={notif}
                          followedBack={followedBack.has(notif.actor?.id)}
                          onFollowBack={() => handleFollowBack(notif.actor?.id, notif.isFollowed)}
                          onClose={() => setNotifOpen(false)}
                        />
                      ))
                    )}
                  </div>
                  <div className="px-4 py-4 text-center border-t border-zinc-800">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-sm font-black text-white hover:text-zinc-300 transition-colors"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/messages"
              className="relative text-zinc-400 hover:text-white"
              aria-label="Messages"
            >
              <Mail size={18} className="cursor-pointer" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none pointer-events-none">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
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
                            onClick={() => { item.action?.(); setMenuOpen(false); }}
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

          <div className="md:hidden flex items-center gap-3">
            <Link to="/messages" className="relative text-zinc-400 hover:text-white" aria-label="Messages">
              <Mail size={18} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none pointer-events-none">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="text-zinc-300 hover:text-white"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 px-3 py-3 space-y-3 bg-black">
            <SearchBar />
            <div className="grid grid-cols-2 gap-2 text-sm font-bold tracking-tight">
              <Link to="/artists" className="text-zinc-300 hover:text-white">For Artists</Link>
              <Link to="/upload" className="text-zinc-300 hover:text-white">Upload</Link>
              <Link to="/me" className="text-zinc-300 hover:text-white">Profile</Link>
            </div>
            {hasPaidPlan ? (
              <button
                onClick={() => setPlanModalOpen(true)}
                className={`w-full border text-white font-bold tracking-tight px-3 py-2 rounded-sm transition-colors duration-150 text-xs ${planButtonClass}`}
              >
                View My Plan
              </button>
            ) : (
              <ArtistProUpgradeButton
                className="w-full border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-tight px-3 py-2 rounded-sm transition-colors duration-150 text-xs"
              >
                Try Free
              </ArtistProUpgradeButton>
            )}
          </div>
        )}
      </nav>
      <Outlet />
      {checkoutOpen && <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />}
      {planModalOpen && <MyPlanModal onClose={() => setPlanModalOpen(false)} />}
    </>
  );
}

function DropdownNotifRow({
  notif,
  followedBack,
  onFollowBack,
  onClose,
}: {
  notif: NotificationObject;
  followedBack: boolean;
  onFollowBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-4 hover:bg-zinc-800/30 transition-colors ${!notif.isRead ? "bg-zinc-800/20" : ""}`}>
      <Link
        to={`/${notif.actor?.id}`}
        onClick={onClose}
        className="w-12 h-12 rounded-full bg-zinc-600 flex-shrink-0 overflow-hidden"
      >
        {notif.actor?.avatarUrl ? (
          <img src={notif.actor.avatarUrl} alt={notif.actor.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-500">
            <User size={26} className="text-zinc-300" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug">
          <Link to={`/${notif.actor?.id}`} onClick={onClose} className="font-bold hover:underline">
            {notif.actor?.username}
          </Link>{" "}
          <span className="text-white font-normal">
            {notif.type === "user_followed" ? "started following you" : notif.message}
          </span>
        </p>
        <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
          <User size={11} className="text-zinc-500" />
          {timeAgo(notif.createdAt)}
        </p>
      </div>
      {notif.type === "user_followed" && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollowBack(); }}
          disabled={followedBack}
          className={`px-4 py-2 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${followedBack ? "bg-zinc-700 text-zinc-400 cursor-default" : "bg-white text-black hover:bg-zinc-200"}`}
        >
          {notif.isFollowed ? "Following" : "Follow back"}
        </button>
      )}
    </div>
  );
}

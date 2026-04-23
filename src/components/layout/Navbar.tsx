import { Bell, Mail, MoreHorizontal, ChevronDown, Heart, ListMusic, Radio, Users, UserPlus, Star, BarChart2, TrendingUp, Share2, 
  User} from "lucide-react";
import SearchBar from "../ui/SearchBar";

import { SiSoundcloud } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../features/profile/context/useMe";
import { logout } from "../../features/auth/services/index";
import UpgradeModal from "./UpgradeModal";
import { io, Socket } from "socket.io-client";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  followUser,
  
} from "@/features/notifications/service/service"; 
import type {NotificationObject} from "@/features/notifications/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * The backend emits e.g. "user_followed" but our NotificationType uses "follow".
 * Normalise any incoming socket payload so it fits NotificationObject.
 */
function normaliseSocketPayload(raw: Record<string, unknown>): NotificationObject {
  const typeMap: Record<string, string> = {
    user_followed: "follow",
    track_liked: "like",
    track_commented: "comment",
    track_reposted: "repost",
  };

  const rawType = raw.type as string;
  const normalisedType = typeMap[rawType] ?? rawType;

  return {
    id: raw.id as string,
    type: normalisedType as NotificationObject["type"],
    actor: raw.actor as NotificationObject["actor"],
    referenceId: (raw.referenceId ?? null) as string | null,
    message: raw.message as string,
    isRead: false,
    readAt: null,
    createdAt: raw.createdAt as string,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  // ── REST: initial unread count ────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Fallback polling every 60 s in case the socket is disconnected
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Grab the JWT however your app stores it (adjust if needed)
    const token =
      localStorage.getItem("accessToken") ??
      sessionStorage.getItem("accessToken") ??
      "";

    if (!token) return; // Not logged in — skip socket

    const socket = io("https://tunify.duckdns.org/notifications", {
      query: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    // Any notification event the server emits
    const handleNewNotification = (raw: Record<string, unknown>) => {
      try {
        const notif = normaliseSocketPayload(raw);
        // Prepend to the dropdown list (keep max 20)
        setNotifications((prev) => [notif, ...prev].slice(0, 20));
        // Bump the badge
        setUnreadCount((prev) => prev + 1);
      } catch {
        // Malformed payload — ignore
      }
    };

    // The server emits a generic "notification" event — listen to it.
    // Also listen to the specific event names as a fallback.
    socket.on("notification", handleNewNotification);
    socket.on("user_followed", handleNewNotification);
    socket.on("track_liked", handleNewNotification);
    socket.on("track_commented", handleNewNotification);
    socket.on("track_reposted", handleNewNotification);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [me?.id]); // Re-connect if the logged-in user changes

  // ── Bell click ────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await getNotifications({ limit: 10 });
      setNotifications(res.data);
    } catch { /* ignore */ } finally {
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
      } catch { /* ignore */ }
    }
  };

  const handleFollowBack = async (actorId: string) => {
    try {
      await followUser(actorId);
      setFollowedBack((prev) => new Set([...prev, actorId]));
    } catch { /* ignore */ }
  };

  // ── Outside-click handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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
    { to: "/me/following",  icon: <Users size={17} />,       label: "Following" },
    { to: "/who-to-follow", icon: <UserPlus size={17} />,    label: "Who to follow" },
    { to: "/pro",           icon: <Star size={17} />,        label: "Try Artist Pro", orange: true },
    { to: "/benefits",      icon: <Star size={17} />,        label: "Benefits" },
    { to: "/tracks",        icon: <BarChart2 size={17} />,   label: "Tracks" },
    { to: "/insights",      icon: <TrendingUp size={17} />,  label: "Insights" },
    { to: "/distribute",    icon: <Share2 size={17} />,      label: "Distribute" },
  ];

  const menuItems: { group: { label: string; href?: string; action?: () => void }[] }[] = [
    { group: [
      { label: "About us",          href: "/about" },
      { label: "Legal",             href: "/legal" },
      { label: "Copyright",         href: "/copyright" },
    ]},
    { group: [
      { label: "Mobile apps",       href: "/mobile" },
      { label: "Artist Membership", href: "/artist-membership" },
      { label: "Newsroom",          href: "/newsroom" },
      { label: "Jobs",              href: "/jobs" },
      { label: "Developers",        href: "/developers" },
      { label: "SoundCloud Store",  href: "/store" },
    ]},
    { group: [
      { label: "Support",           href: "/support" },
      { label: "Keyboard shortcuts",href: "/shortcuts" },
    ]},
    { group: [
      { label: "Subscription",      href: "/subscription" },
      { label: "Settings",          href: "/settings" },
      { label: "Sign out",          action: handleSignOut },
    ]},
  ];

  return (
    <>
      <nav className="w-full h-12 bg-black text-white border-b border-zinc-800 sticky top-0 z-50">
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
            <SearchBar />
          </div>

          <div className="flex items-center gap-5 text-sm">
            <button
              onClick={() => setUpgradeOpen(true)}
              className="border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-tight px-3 py-1 rounded-sm transition-colors duration-150 text-xs"
            >
              Upgrade now
            </button>
            <Link to="/artists" className="text-zinc-400 hover:text-white font-bold tracking-tight">For Artists</Link>
            <Link to="/upload" className="text-zinc-400 hover:text-white font-bold tracking-tight ml-1">Upload</Link>

            {/* Profile menu */}
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

            {/* Bell with notification dropdown */}
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
                  {/* Header */}
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

                  {/* Notification list */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownNotifRow
                          key={notif.id}
                          notif={notif}
                          followedBack={followedBack.has(notif.actor?.id)}
                          onFollowBack={() => handleFollowBack(notif.actor?.id)}
                          onClose={() => setNotifOpen(false)}
                        />
                      ))
                    )}
                  </div>

                  {/* Footer */}
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

            <Link to="/messages" className="text-zinc-400 hover:text-white">
              <Mail size={18} className="cursor-pointer" />
            </Link>

            {/* More menu */}
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
        </div>
      </nav>
      <Outlet />
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}

// ─── Dropdown notification row ────────────────────────────────────────────────

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
    <div
      className={`flex items-center gap-3 px-4 py-4 hover:bg-zinc-800/30 transition-colors ${
        !notif.isRead ? "bg-zinc-800/20" : ""
      }`}
    >
      <Link
        to={`/users/${notif.actor?.id}`}
        onClick={onClose}
        className="w-12 h-12 rounded-full bg-zinc-600 flex-shrink-0 overflow-hidden"
      >
        {notif.actor?.avatarUrl ? (
          <img
            src={notif.actor.avatarUrl}
            alt={notif.actor.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-500">
            <User size={26} className="text-zinc-300" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug">
          <Link
            to={`/users/${notif.actor?.id}`}
            onClick={onClose}
            className="font-bold hover:underline"
          >
            {notif.actor?.username}
          </Link>{" "}
          <span className="text-white font-normal">
            {notif.type === "follow" ? "started following you" : notif.message}
          </span>
        </p>
        <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
          <User size={11} className="text-zinc-500" />
          {timeAgo(notif.createdAt)}
        </p>
      </div>

      {notif.type === "follow" && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollowBack(); }}
          disabled={followedBack}
          className={`px-4 py-2 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${
            followedBack
              ? "bg-zinc-700 text-zinc-400 cursor-default"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {followedBack ? "Following" : "Follow back"}
        </button>
      )}
    </div>
  );
}
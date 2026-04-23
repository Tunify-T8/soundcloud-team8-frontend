import { useState, useEffect, useRef } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  getNotifications,
  markAllAsRead,
  markNotificationAsRead,
  followUser,
} from "@/features/notifications/service/service";
import type {
  NotificationObject,
  NotificationFilterType,
} from "@/features/notifications/types";

const FILTER_OPTIONS: { label: string; value: NotificationFilterType }[] = [
  { label: "All notifications", value: "all" },
  { label: "Likes", value: "like" },
  { label: "Reposts", value: "repost" },
  { label: "Follows", value: "follow" },
  { label: "Comments", value: "comment" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/**
 * Normalise the raw socket payload to match NotificationObject.
 * The backend emits e.g. type:"user_followed" but our type union uses "follow".
 */
function normaliseSocketPayload(raw: Record<string, unknown>): NotificationObject {
  const typeMap: Record<string, string> = {
    user_followed: "follow",
    track_liked: "like",
    track_commented: "comment",
    track_reposted: "repost",
  };
  const rawType = raw.type as string;
  return {
    id: raw.id as string,
    type: (typeMap[rawType] ?? rawType) as NotificationObject["type"],
    actor: raw.actor as NotificationObject["actor"],
    referenceId: (raw.referenceId ?? null) as string | null,
    message: raw.message as string,
    isRead: false,
    readAt: null,
    createdAt: raw.createdAt as string,
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [filter, setFilter] = useState<NotificationFilterType>("follow");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  const currentFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Follows";

  // ── Outside-click for filter dropdown ──────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Fetch on filter change ──────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const params = filter === "all" ? {} : { type: filter };
      const res = await getNotifications({ limit: 50, ...params });
      setNotifications(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  // ── Socket.IO – real-time updates ──────────────────────────────────────────
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ??
      sessionStorage.getItem("accessToken") ??
      "";

    if (!token) return;

    const socket = io("https://tunify.duckdns.org/notifications", {
      query: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    const handleNewNotification = (raw: Record<string, unknown>) => {
      try {
        const notif = normaliseSocketPayload(raw);
        // Only prepend if it matches the active filter (or "all")
        const matches =
          filter === "all" || notif.type === filter;
        if (matches) {
          setNotifications((prev) => [notif, ...prev]);
        }
      } catch {
        // Malformed payload — ignore
      }
    };

    socket.on("notification", handleNewNotification);
    socket.on("user_followed", handleNewNotification);
    socket.on("track_liked", handleNewNotification);
    socket.on("track_commented", handleNewNotification);
    socket.on("track_reposted", handleNewNotification);

    return () => {
      socket.disconnect();
    };
  }, [filter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleFollowBack(actorId: string, notifId: string) {
    try {
      await followUser(actorId);
      await markNotificationAsRead(notifId);
      setFollowedBack((prev) => new Set([...prev, actorId]));
    } catch {
      // handle
    }
  }

  // Get unique recent followers for the sidebar
  const recentFollowers = notifications
    .filter((n) => n.type === "follow")
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1200px] mx-auto px-6 pt-8 flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row — title + filter on same level */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black tracking-tight">
              Notifications
            </h1>

            {/* Filter dropdown */}
            <div className="relative inline-block" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-zinc-700 hover:border-zinc-500 rounded-sm px-4 py-2 text-sm font-bold transition-colors"
              >
                {currentFilterLabel}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-zinc-700 rounded-sm shadow-2xl z-50 overflow-hidden">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-zinc-800 ${
                        filter === opt.value
                          ? "text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="space-y-0">
            {loading ? (
              <div className="text-zinc-500 text-sm py-8">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-zinc-500 text-sm py-8">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notif={notif}
                  followedBack={followedBack.has(notif.actor?.id)}
                  onFollowBack={() =>
                    handleFollowBack(notif.actor?.id, notif.id)
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[260px] flex-shrink-0 pt-14">
          {recentFollowers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-widest uppercase text-white">
                  Recent Followers
                </span>
                <Link
                  to="/me/followers"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentFollowers.slice(0, 3).map((notif) => (
                  <SidebarFollower
                    key={notif.id}
                    notif={notif}
                    followedBack={followedBack.has(notif.actor?.id)}
                    onFollowBack={() =>
                      handleFollowBack(notif.actor?.id, notif.id)
                    }
                  />
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-x-2 gap-y-1">
                {[
                  "Legal",
                  "Privacy",
                  "Cookie Policy",
                  "Cookie Manager",
                  "Imprint",
                  "Artist Resources",
                  "Newsroom",
                  "Charts",
                  "Transparency Reports",
                ].map((item) => (
                  <Link
                    key={item}
                    to="#"
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <div className="mt-3">
                <span className="text-[11px] text-zinc-500">Language: </span>
                <Link
                  to="#"
                  className="text-[11px] text-[#5090d3] hover:underline"
                >
                  English (US)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  notif,
  followedBack,
  onFollowBack,
}: {
  notif: NotificationObject;
  followedBack: boolean;
  onFollowBack: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-800/50 group">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/users/${notif.actor?.id}`}
          className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
        >
          {notif.actor?.avatarUrl ? (
            <img
              src={notif.actor.avatarUrl}
              alt={notif.actor.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600 text-xs font-bold text-white">
              {notif.actor?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <p className="text-sm text-white">
            <Link
              to={`/users/${notif.actor?.id}`}
              className="font-bold hover:underline"
            >
              {notif.actor?.username}
            </Link>{" "}
            <span className="font-normal text-zinc-300">
              {notif.type === "follow"
                ? "started following you"
                : notif.message}
            </span>
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {timeAgo(notif.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        {notif.type === "follow" && (
          <button
            onClick={onFollowBack}
            disabled={followedBack}
            className={`px-3 py-1.5 text-xs font-bold border rounded-sm transition-colors ${
              followedBack
                ? "border-zinc-600 text-zinc-500 cursor-default"
                : "border-zinc-400 text-white hover:border-white"
            }`}
          >
            {followedBack ? "Following" : "Follow back"}
          </button>
        )}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

function SidebarFollower({
  notif,
  followedBack,
  onFollowBack,
}: {
  notif: NotificationObject;
  followedBack: boolean;
  onFollowBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to={`/users/${notif.actor?.id}`}
        className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
      >
        {notif.actor?.avatarUrl ? (
          <img
            src={notif.actor.avatarUrl}
            alt={notif.actor.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-600 text-xs font-bold text-white">
            {notif.actor?.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/users/${notif.actor?.id}`}
          className="text-sm font-bold text-white hover:underline block truncate"
        >
          {notif.actor?.username}
        </Link>
      </div>
      <button
        onClick={onFollowBack}
        disabled={followedBack}
        className={`px-3 py-1.5 text-xs font-bold border rounded-sm transition-colors flex-shrink-0 ${
          followedBack
            ? "border-zinc-600 text-zinc-500 cursor-default"
            : "border-zinc-400 text-white hover:border-white"
        }`}
      >
        {followedBack ? "Following" : "Follow back"}
      </button>
    </div>
  );
}
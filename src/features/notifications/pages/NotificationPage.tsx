import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, MoreHorizontal, Rows } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { BASE_URL } from "@/config/env";
import {
  getNotifications,
  markNotificationAsRead,
  followUser,
} from "@/features/notifications/service/service";
import type {
  NotificationObject,
  NotificationFilterType,
} from "@/features/notifications/types";
import { getAccessToken } from "@/features/auth/utils/token.utils";
import { api } from "@/features/auth/services/api";


const FILTER_OPTIONS: { label: string; value: NotificationFilterType }[] = [
  { label: "All notifications", value: "all" },
  { label: "Likes", value: "track_liked" },
  { label: "Reposts", value: "track_reposted" },
  { label: "Follows", value: "user_followed" },
  { label: "Comments", value: "track_commented" },
  { label: "New Releases", value: "new_release" },
  { label: "Messages", value: "new_message" },
  { label: "System", value: "system" },
  { label: "Subscriptions", value: "subscription" },
];

function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [filter, setFilter] = useState<NotificationFilterType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  const filterRef2 = useRef<NotificationFilterType>(filter);
  useEffect(() => {
    filterRef2.current = filter;
  }, [filter]);

  const currentFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "All notifications";

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const fetchNotifications = useCallback(async (currentFilter: NotificationFilterType) => {
    if (!getAccessToken()) return;
    setLoading(true);
    try {
      const params = currentFilter === "all" ? {} : { type: currentFilter };
      const res = await getNotifications({ limit: 50, ...params });
      setNotifications(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const [token, setToken] = useState(() => getAccessToken() ?? "");

  useEffect(() => {
    if (token) return;
    const interval = setInterval(() => {
      const t = getAccessToken();
      if (t) {
        setToken(t);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;

    const connect = async () => {
      try {
        await api.get("/notifications/unread-count");
      } catch { /* ignore */ }

      const freshToken = getAccessToken() ?? "";
      if (!freshToken) return;
      console.log("connecting to:", `https://tunify.duckdns.org/notifications`);
      socket = io("https://tunify.duckdns.org/notifications", {
        query: { token :freshToken },
        reconnectionAttempts: 10,
        reconnectionDelay: 400,
      });
    

      socket.on("connect", () => console.log("socket connected ✅"));
      socket.on("connect_error", (e) => console.log("connect_error:", e.message));

      const handle = (raw: Record<string, unknown>) => {
        try {
          const notif = normaliseSocketPayload(raw);
          console.log(raw)
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notif.id)) return prev;
            const activeFilter = filterRef2.current;
            if (activeFilter !== "all" && notif.type !== activeFilter) return prev;
            return [notif, ...prev];
          });
        } catch { /* ignore */ }
      };

      const eventNames = [
        "notification", "track_liked", "track_commented", "track_reposted",
        "user_followed", "new_release", "new_message", "system", "subscription",
      ] as const;

      eventNames.forEach((event) => socket?.on(event, handle));
    };

    connect();

    return () => { socket?.disconnect(); };
  }, []);

  async function handleFollowBack(actorId: string, notifId: string) {
    try {
      await followUser(actorId);
      await markNotificationAsRead(notifId);
      setFollowedBack((prev) => new Set([...prev, actorId]));
    } catch {
      // handle
    }
  }

  const recentFollowers = notifications.filter(
    (n) => n.type === "user_followed"
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" data-testid="notifications-page">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex gap-8">

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0" data-testid="notifications-main">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6" data-testid="notifications-header">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Notifications
            </h1>

            {/* Filter dropdown */}
            <div className="relative inline-block" ref={filterRef} data-testid="filter-dropdown-container">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-label={currentFilterLabel}
                data-testid="filter-dropdown-trigger"
                className="flex items-center gap-2 bg-[#1a1a1a] border border-zinc-700 hover:border-zinc-500 rounded-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors"
              >
                <span className="hidden sm:inline" aria-hidden="true">{currentFilterLabel}</span>
                <span className="sm:hidden" aria-hidden="true">
                  {filter === "all" ? "All" : currentFilterLabel}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {filterOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-zinc-700 rounded-sm shadow-2xl z-50 overflow-hidden"
                  data-testid="filter-dropdown-menu"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setFilterOpen(false);
                      }}
                      data-testid={`filter-option-${opt.value}`}
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
          <div className="space-y-0" data-testid="notifications-list">
            {loading ? (
              <div className="text-zinc-500 text-sm py-8" data-testid="notifications-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-zinc-500 text-sm py-8" data-testid="notifications-empty">
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

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside
          className="w-[260px] flex-shrink-0 pt-14 max-lg:hidden"
          aria-label="followers sidebar"
          data-testid="notifications-sidebar"
        >
          {recentFollowers.length > 0 && (
            <div data-testid="sidebar-followers-section">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-widest uppercase text-white">
                  Recent Followers
                </span>
                <Link
                  to="/me/followers"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                  data-testid="sidebar-view-all-link"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3" data-testid="sidebar-followers-list">
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

              <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-x-2 gap-y-1" data-testid="sidebar-footer-links">
                {[
                  "Legal", "Privacy", "Cookie Policy", "Cookie Manager",
                  "Imprint", "Artist Resources", "Newsroom", "Charts",
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
              <div className="mt-3" data-testid="sidebar-language">
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
        </aside>
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
  const messageText =
    notif.type === "user_followed" ? "started following you" : notif.message;

  return (
    <div
      className="flex items-center justify-between py-3 sm:py-4 border-b border-zinc-800/50 group"
      data-testid={`notification-row-${notif.id}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/users/${notif.actor?.id}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
          data-testid={`notification-actor-avatar-${notif.id}`}
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
          <p className="text-xs sm:text-sm text-white">
            <Link
              to={`/users/${notif.actor?.id}`}
              className="font-bold hover:underline"
              data-testid={`notification-actor-username-${notif.id}`}
            >
              {notif.actor?.username}
            </Link>{" "}
            <span
              className="font-normal text-zinc-300"
              data-testid={`notification-message-${notif.id}`}
            >
              {messageText}
            </span>
          </p>
          <p
            className="text-[11px] sm:text-xs text-zinc-500 mt-0.5"
            data-testid={`notification-timestamp-${notif.id}`}
          >
            {timeAgo(notif.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3 sm:ml-4 flex-shrink-0">
        {notif.type === "user_followed" && (
          <button
            onClick={onFollowBack}
            disabled={followedBack}
            data-testid={`follow-back-btn-${notif.id}`}
            className={`px-2 sm:px-3 py-1.5 text-xs font-bold border rounded-sm transition-colors ${
              followedBack
                ? "border-zinc-600 text-zinc-500 cursor-default"
                : "border-zinc-400 text-white hover:border-white"
            }`}
          >
            {followedBack ? "Following" : "Follow back"}
          </button>
        )}
        <button
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white"
          data-testid={`notification-more-btn-${notif.id}`}
        >
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
    <div
      className="flex items-center gap-3"
      data-testid={`sidebar-follower-${notif.id}`}
    >
      <Link
        to={`/users/${notif.actor?.id}`}
        className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
        data-testid={`sidebar-follower-avatar-${notif.id}`}
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
          data-testid={`sidebar-follower-username-${notif.id}`}
        >
          {notif.actor?.username}
        </Link>
      </div>
      <button
        onClick={onFollowBack}
        disabled={followedBack}
        data-testid={`sidebar-follow-back-btn-${notif.id}`}
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
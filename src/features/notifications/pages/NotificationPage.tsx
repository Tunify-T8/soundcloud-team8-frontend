import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import type  {Variants} from "framer-motion";
import {
  getNotifications,
  markNotificationAsRead,
  followUser,
  unfollowUser,
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

function normaliseSocketPayload(
  raw: Record<string, unknown>
): NotificationObject {
  return {
    id: raw.id as string,
    type: raw.type as NotificationObject["type"],
    actor: raw.actor as NotificationObject["actor"],
    referenceId: (raw.referenceId ?? null) as string | null,
    message: raw.message as string,
    isRead: false,
    readAt: null,
    createdAt: raw.createdAt as string,
    isFollowed: (raw.isFollowed as boolean) ?? false,
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [filter, setFilter] = useState<NotificationFilterType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchNotifications = useCallback(
    async (currentFilter: NotificationFilterType) => {
      if (!getAccessToken()) return;
      setLoading(true);
      try {
        const params = currentFilter === "all" ? {} : { type: currentFilter };
        const res = await getNotifications({ limit: 50, ...params });
        setNotifications(res.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
      } catch {
        /* ignore */
      }

      const freshToken = getAccessToken() ?? "";
      if (!freshToken) return;

      socket = io("https://tunify.duckdns.org/notifications", {
        query: { token: freshToken },
        reconnectionAttempts: 10,
        reconnectionDelay: 400,
      });

      socket.on("connect", () => console.log("socket connected ✅"));
      
      const handle = (raw: Record<string, unknown>) => {
        try {
          const notif = normaliseSocketPayload(raw);
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notif.id)) return prev;
            const activeFilter = filterRef2.current;
            if (activeFilter !== "all" && notif.type !== activeFilter)
              return prev;
            return [notif, ...prev];
          });
        } catch {
          /* ignore */
        }
      };

      const eventNames = [
        "notification",
        "track_liked",
        "track_commented",
        "track_reposted",
        "user_followed",
        "new_release",
        "new_message",
        "system",
        "subscription",
      ] as const;

      eventNames.forEach((event) => socket?.on(event, handle));
    };

    connect();
    return () => {
      socket?.disconnect();
    };
  }, []);

  async function handleFollowBack(
    actorId: string | undefined,
    notifId: string,
    currentIsFollowed: boolean
  ) {
    if (!actorId) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.actor?.id === actorId ? { ...n, isFollowed: !currentIsFollowed } : n
      )
    );

    try {
      if (currentIsFollowed) {
        await unfollowUser(actorId);
      } else {
        await followUser(actorId);
      }
      await markNotificationAsRead(notifId);
    } catch {
      setNotifications((prev) =>
        prev.map((n) =>
          n.actor?.id === actorId ? { ...n, isFollowed: currentIsFollowed } : n
        )
      );
    }
  }

  const recentFollowers = notifications.filter(
    (n) => n.type === "user_followed"
  );

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      // MASSIVE DELAY: Each item waits 1.5 seconds after the previous one starts.
      staggerChildren: 1.5, 
      delayChildren: 0.8,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 100,      // Starts way down
    scale: 0.5,  // Starts small
    rotateX: 45, // Starts tilted back (flashy!)
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      // 4 SECONDS: Extremely slow glide-in
      duration: 4, 
      // This cubic-bezier is "heavy" at the start and glides slowly to a stop
      ease: [0.16, 1, 0.3, 1], 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.5 } 
  }
};
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white"
      data-testid="notifications-page"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex gap-8">
        <div className="flex-1 min-w-0" data-testid="notifications-main">
          <div className="flex items-center justify-between mb-6" data-testid="notifications-header">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Notifications
            </h1>

            <div className="relative inline-block" ref={filterRef} data-testid="filter-dropdown-container">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-zinc-700 hover:border-zinc-500 rounded-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors"
              >
                <span className="hidden sm:inline">{currentFilterLabel}</span>
                <span className="sm:hidden">{filter === "all" ? "All" : currentFilterLabel}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-zinc-700 rounded-sm shadow-2xl z-50 overflow-hidden"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilter(opt.value);
                          setFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-zinc-800 ${
                          filter === opt.value ? "text-white" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-0" data-testid="notifications-list">
            {loading ? (
              <div className="text-zinc-500 text-sm py-8">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-zinc-500 text-sm py-8">No notifications yet.</div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      variants={itemVariants}
                      layout
                      exit="exit"
                    >
                      <NotificationRow
                        notif={notif}
                        onFollowBack={() =>
                          handleFollowBack(notif.actor?.id, notif.id, notif.isFollowed ?? false)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        <aside className="w-[260px] flex-shrink-0 pt-14 max-lg:hidden">
          {recentFollowers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-widest uppercase text-white">
                  Recent Followers
                </span>
                <Link to="/me/followers" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {recentFollowers.slice(0, 3).map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <SidebarFollower
                        notif={notif}
                        onFollowBack={() =>
                          handleFollowBack(notif.actor?.id, notif.id, notif.isFollowed ?? false)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-x-2 gap-y-1">
                {[
                  "Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint",
                  "Artist Resources", "Newsroom", "Charts", "Transparency Reports",
                ].map((item) => (
                  <Link key={item} to="#" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                    {item}
                  </Link>
                ))}
              </div>

              <div className="mt-3">
                <span className="text-[11px] text-zinc-500">Language: </span>
                <Link to="#" className="text-[11px] text-[#5090d3] hover:underline">
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
  onFollowBack,
}: {
  notif: NotificationObject;
  onFollowBack: () => void;
}) {
  const messageText = notif.type === "user_followed" ? "started following you" : notif.message;
  const isFollowed = notif.isFollowed ?? false;

  return (
    <div className="flex items-center justify-between py-3 sm:py-4 border-b border-zinc-800/50 group">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/${notif.actor?.id}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
        >
          {notif.actor?.avatarUrl ? (
            <img src={notif.actor.avatarUrl} alt={notif.actor.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600 text-xs font-bold text-white">
              {notif.actor?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-white">
            <Link to={`/${notif.actor?.id}`} className="font-bold hover:underline">
              {notif.actor?.username}
            </Link>{" "}
            <span className="font-normal text-zinc-300">{messageText}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{timeAgo(notif.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3 sm:ml-4 flex-shrink-0">
        {notif.type === "user_followed" && (
          <button
            onClick={onFollowBack}
            className={`px-4 py-2 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${
              notif.isFollowed
                ? "bg-zinc-800 text-zinc-500 cursor-default"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {isFollowed ? "Following" : "Follow back"}
          </button>
        )}
        <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

function SidebarFollower({
  notif,
  onFollowBack,
}: {
  notif: NotificationObject;
  onFollowBack: () => void;
}) {
  const isFollowed = notif.isFollowed ?? false;

  return (
    <div className="flex items-center gap-3">
      <Link
        to={`/${notif.actor?.id}`}
        className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden"
      >
        {notif.actor?.avatarUrl ? (
          <img src={notif.actor.avatarUrl} alt={notif.actor.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-600 text-xs font-bold text-white">
            {notif.actor?.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/${notif.actor?.id}`} className="text-sm font-bold text-white hover:underline block truncate">
          {notif.actor?.username}
        </Link>
      </div>

      <button
        onClick={onFollowBack}
        className={`px-4 py-2 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${
          notif.isFollowed
            ? "bg-zinc-800 text-zinc-500 cursor-default"
            : "bg-white text-black hover:bg-zinc-200"
        }`}
      >
        {isFollowed ? "Following" : "Follow back"}
      </button>
    </div>
  );
}
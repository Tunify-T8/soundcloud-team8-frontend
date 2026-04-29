import UserInfoBarTab from "./UsetInfoBarTab";
import EditInfo from "./EditInfo";
import { FaUser, FaPen, FaEnvelope } from "react-icons/fa";
import { MdPodcasts, MdMoreHoriz } from "react-icons/md";
import { FiSlash, FiInfo } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { Upload, BarChart2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { followingService } from "../../../following/followingService";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";

function isBlockedUserMatch(entry: unknown, userId?: string): boolean {
  if (!userId || !entry || typeof entry !== "object") return false;
  const candidate = entry as {
    id?: string;
    userId?: string;
    blockedUserId?: string;
    username?: string;
    user?: {
      id?: string;
      username?: string;
    };
  };
  return [
    candidate.id,
    candidate.userId,
    candidate.blockedUserId,
    candidate.username,
    candidate.user?.id,
    candidate.user?.username,
  ]
    .filter(Boolean)
    .some((value) => String(value) === String(userId));
}

function extractBlockedUsers(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const maybePayload = payload as {
    data?: unknown;
    blockedUsers?: unknown;
    users?: unknown;
    items?: unknown;
  };

  if (Array.isArray(maybePayload.data)) return maybePayload.data;
  if (Array.isArray(maybePayload.blockedUsers)) return maybePayload.blockedUsers;
  if (Array.isArray(maybePayload.users)) return maybePayload.users;
  if (Array.isArray(maybePayload.items)) return maybePayload.items;
  return [];
}

function ShareOverlay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");
  const [shortenLink, setShortenLink] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-white/40 px-4 pt-28"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[121] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close share overlay"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="w-full max-w-[540px] rounded-[3px] border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-7 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "share"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "message"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Message
          </button>
        </div>

        {activeTab === "share" ? (
          <>
            <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
              <input
                readOnly
                value={url}
                className="w-full bg-transparent text-[14px] font-semibold text-zinc-100 outline-none sm:text-[15px]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-zinc-100 sm:text-[15px]">
              <input
                type="checkbox"
                checked={shortenLink}
                onChange={(e) => setShortenLink(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-500 bg-transparent"
              />
              Shorten link
            </label>
          </>
        ) : (
          <div className="py-6 text-[24px] text-zinc-400">
            Messaging share is coming soon.
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserInfoBar({
  displayName,
  avatarUrl,
  country,
  city,
  bio,
  role,
  visibility,
  socialAccounts,
  isMe,
  onProfileUpdated,
  userId,
  followersCount,
  onFollowersChange,
}: {
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  bio?: string;
  role?: "ARTIST" | "LISTENER";
  visibility?: "PUBLIC" | "PRIVATE";
  socialAccounts?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
    spotify?: string;
    tiktok?: string;
    soundcloud?: string;
  };
  isMe?: boolean;
  onProfileUpdated?: () => void;
  userId?: string;
  followersCount?: number;
  onFollowersChange?: (count: number) => void;
}) {
  const tabs = [
    { label: "All", path: "." },
    { label: "Popular tracks", path: "popular-tracks" },
    { label: "Tracks", path: "tracks" },
    { label: "Albums", path: "albums" },
    { label: "Playlists", path: "playlists" },
    { label: "Reposts", path: "reposts" },
  ];

  const [modal, setModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isMe || !userId) return;

    followingService
      .getFollowStatus(userId)
      .then((status) => {
        setIsFollowing(status.isFollowing);
      })
      .catch(() => {
        setIsFollowing(false);
      });
  }, [isMe, userId]);

  useEffect(() => {
    if (isMe || !userId) return;
    let mounted = true;
    followingService
      .getBlockedUsers(1, 200)
      .then((res) => {
        if (!mounted) return;
        const blockedList = extractBlockedUsers(res);
        setIsBlocked(blockedList.some((entry) => isBlockedUserMatch(entry, userId)));
      })
      .catch(() => {})
      .finally(() => {});

    return () => {
      mounted = false;
    };
  }, [isMe, userId]);

  const handleFollowToggle = async () => {
    if (!userId || followLoading) return;

    const previousFollowersCount = followersCount ?? 0;
    const newFollowersCount = isFollowing 
      ? Math.max(0, previousFollowersCount - 1)
      : previousFollowersCount + 1;

    // Step 1: Update UI immediately (optimistic update)
    setIsFollowing(!isFollowing);
    onFollowersChange?.(newFollowersCount);

    setFollowLoading(true);
    try {
      // Step 2: Sync with backend
      if (isFollowing) {
        await followingService.unfollowUser(userId);
      } else {
        await followingService.followUser(userId);
      }

      notifySocialGraphUpdated();
    } catch {
      // Step 3: If API call fails, revert the changes
      setIsFollowing(isFollowing);
      onFollowersChange?.(previousFollowersCount);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!userId || blockLoading) return;

    setBlockLoading(true);
    try {
      if (isBlocked) {
        await followingService.unblockUser(userId);
        setIsBlocked(false);
      } else {
        await followingService.blockUser(userId);
        setIsBlocked(true);
      }

      notifySocialGraphUpdated();
      onProfileUpdated?.();
      setShowMoreActions(false);
    } catch (err) {
      // swallow: UI will refresh on next profile fetch
    } finally {
      setBlockLoading(false);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative mt-8 flex w-10/12 flex-col gap-3 sm:mt-5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="hide-scrollbar flex w-full flex-row gap-3 overflow-x-auto whitespace-nowrap pr-1 cursor-pointer sm:gap-4 lg:w-auto lg:flex-1">
          {tabs.map(({ label, path }) => (
            <NavLink key={label} to={path} end={path === "."}>
              {({ isActive }) => (
                <UserInfoBarTab label={label} isActive={isActive} />
              )}
            </NavLink>
          ))}
        </div>
        <div className="mt-1 flex w-full flex-wrap items-center justify-start lg:ml-auto lg:mt-0 lg:w-auto lg:flex-nowrap lg:justify-end">
          {!isMe && (
            <button
              type="button"
              title="Station"
              className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <MdPodcasts />
              <span>Station</span>
            </button>
          )}
          {!isMe && (
            <button
              type="button"
              title={isFollowing ? "Following" : "Follow"}
              onClick={handleFollowToggle}
              disabled={followLoading || !userId}
              className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-1 text-[12px] font-bold text-black hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <FaUser />
              <span>{isFollowing ? "Following" : "Follow"}</span>
            </button>
          )}
          {isMe && (
            <button
              type="button"
              title="Your Insights"
              onClick={() => navigate("/me/insights/overview")}
              className="mr-[12px] inline-flex items-center justify-center gap-1.5 rounded-sm bg-white px-2 py-1 text-[12px] font-bold text-black hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <BarChart2 size={14} />
              <span>Your Insights</span>
            </button>
          )}
          {isMe && (
            <button
              type="button"
              title="Station"
              className="mr-[12px] inline-flex items-center justify-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <MdPodcasts />
              <span>Station</span>
            </button>
          )}
          <button
            type="button"
            title="Share"
            onClick={() => setShowShareOverlay(true)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${isMe ? "mr-[12px]" : ""}`}
          >
            <Upload size={14} />
            <span>Share</span>
          </button>
          {!isMe && (
            <div className="relative group">
              <button
                type="button"
                title="Messages"
                className="inline-flex items-center justify-center rounded-sm bg-zinc-800 px-2 py-1.5 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:px-3 sm:py-2.25 sm:text-sm"
              >
                <FaEnvelope />
              </button>
            </div>
          )}
          <div className="relative">
            {!isMe && (
              <button
                type="button"
                title="More"
                onClick={() => setShowMoreActions((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold cursor-pointer sm:gap-2 sm:px-3 sm:py-[6.9px] sm:text-sm ${
                  showMoreActions
                    ? "text-orange-500 hover:text-orange-400"
                    : "text-white hover:text-zinc-500"
                }`}
              >
                <MdMoreHoriz size={19} />
              </button>
            )}
            {showMoreActions && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex w-max flex-col rounded-sm border border-zinc-800 bg-zinc-950 shadow-lg z-10">
                <button
                  type="button"
                  title={isBlocked ? "Unblock" : "Block"}
                  onClick={handleBlock}
                  disabled={blockLoading || !userId}
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiSlash />
                  {blockLoading
                    ? isBlocked
                      ? "Unblocking..."
                      : "Blocking..."
                    : `${isBlocked ? "Unblock" : "Block"} ${displayName ?? "user"}`}
                </button>
                <button
                  type="button"
                  title="Report"
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiInfo />
                  Report {displayName}
                </button>
              </div>
            )}
          </div>
          {isMe && (
            <button
              type="button"
              title="Edit"
              onClick={toggleModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <FaPen />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
      {modal && (
        <EditInfo
          onClick={toggleModal}
          onSaved={onProfileUpdated}
          displayName={displayName}
          avatarUrl={avatarUrl}
          country={country}
          city={city}
          bio={bio}
          role={role}
          visibility={visibility}
          socialAccounts={socialAccounts}
        />
      )}
      {showShareOverlay && <ShareOverlay onClose={() => setShowShareOverlay(false)} />}
    </div>
  );
}

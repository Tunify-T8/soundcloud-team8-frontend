import UserInfoBarTab from "./UsetInfoBarTab";
import EditInfo from "./EditInfo";
import BlockUserModal from "./BlockUserModal";
import { FaUser, FaPen, FaEnvelope } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";
import { FiSlash, FiInfo } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Upload, BarChart2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { followingService } from "../../../following/followingService";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";
import { AdminIDDisplay } from "@/features/admin/components/AdminIDDisplay";
import { conversationService } from "@/features/conversation/conversationService";
import ReportModal from "@/features/reports/components/ReportModal";


function ShareOverlay({
  onClose,
  shareUrl,
}: {
  onClose: () => void;
  shareUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");
  const [shortenLink, setShortenLink] = useState(false);

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
                value={shareUrl}
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
  username,
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
  isUpdating, // Added from ProfilePage
  setIsUpdating, // Added from ProfilePage
}: {
  displayName?: string;
  username?: string;
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
  isUpdating?: boolean;
  setIsUpdating?: (updating: boolean) => void;
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [removeCommentsOnBlock, setRemoveCommentsOnBlock] = useState(false);
  const [reportSpamOnBlock, setReportSpamOnBlock] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isMe || !userId) return;

    let cancelled = false;

    followingService
      .getFollowStatus(userId)
      .then((status) => {
        if (cancelled) return;
        setIsFollowing(status.isFollowing);
        setIsBlocked(status.isBlocked ?? false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsFollowing(false);
        setIsBlocked(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isMe, userId]);

  const handleFollowToggle = async () => {
    if (!userId || isUpdating) return;

    const previousFollowersCount = followersCount ?? 0;
    const newFollowersCount = isFollowing
      ? Math.max(0, previousFollowersCount - 1)
      : previousFollowersCount + 1;

    // Step 1: Update UI immediately (optimistic)
    setIsFollowing(!isFollowing);
    onFollowersChange?.(newFollowersCount);
    
    // Start global loading state
    setIsUpdating?.(true);

    try {
      if (isFollowing) {
        await followingService.unfollowUser(userId);
      } else {
        await followingService.followUser(userId);
      }
      notifySocialGraphUpdated();
    } catch {
      // Step 3: Revert on error
      setIsFollowing(isFollowing);
      onFollowersChange?.(previousFollowersCount);
    } finally {
      // Step 4: End global loading state
      setIsUpdating?.(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!userId || blockLoading) return;

    setBlockLoading(true);
    setBlockError(null);
    try {
      const conversationId = await conversationService.createOrGetConversation(userId);
      await conversationService.blockUser(
        conversationId,
        removeCommentsOnBlock,
        reportSpamOnBlock,
      );
      setIsBlocked(true);
      notifySocialGraphUpdated();
      onProfileUpdated?.();
      setShowBlockModal(false);
      setRemoveCommentsOnBlock(false);
      setReportSpamOnBlock(false);
    } catch {
      setBlockError("Failed to block user. Please try again.");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleBlockAction = async () => {
    if (!userId || blockLoading) return;

    if (isBlocked) {
      setBlockLoading(true);
      try {
        await conversationService.unblockUser(userId);
        setIsBlocked(false);
        notifySocialGraphUpdated();
        onProfileUpdated?.();
        setShowMoreActions(false);
      } finally {
        setBlockLoading(false);
      }
      return;
    }

    setBlockError(null);
    setShowMoreActions(false);
    setShowBlockModal(true);
  };

  const handleMessage = async () => {
  if (!userId || messageLoading) return;
  setMessageLoading(true);
  try {
    const conversationId = await conversationService.createOrGetConversation(userId);
    navigate(`/messages/${conversationId}`);
  } catch {
    // silently fail
  } finally {
    setMessageLoading(false);
  }
};
  const toggleModal = () => {
    setModal(!modal);
  };

  const menuTargetName = username?.trim() || displayName?.trim() || "user";
  const sharePathTarget = userId?.trim() || username?.trim() || "";
  const tabState = {
    ...(location.state as Record<string, unknown> | null),
    userId: userId ?? (location.state as { userId?: string } | null)?.userId,
  };
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/${encodeURIComponent(sharePathTarget || "me")}`;

  return (
    <div data-testid="profile-user-info-bar" className="w-full">
      <div className="relative mt-8 flex w-full flex-col gap-3 sm:mt-5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div
          data-testid="profile-user-info-tabs"
          className="hide-scrollbar flex w-full flex-row gap-3 overflow-x-auto whitespace-nowrap pr-1 cursor-pointer sm:gap-4 lg:min-w-0 lg:flex-1 lg:pr-4"
        >
          {tabs.map(({ label, path }) => (
            <NavLink key={label} to={path} end={path === "."} state={tabState}>
              {({ isActive }) => (
                <UserInfoBarTab label={label} isActive={isActive} />
              )}
            </NavLink>
          ))}
        </div>
        <div className="hide-scrollbar mt-1 flex w-full items-center justify-start gap-2 overflow-x-auto pb-1 pr-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0 sm:gap-2.5 lg:mt-0 lg:w-auto lg:flex-none lg:flex-nowrap lg:justify-end">
          {!isMe && (
            <button
              data-testid="profile-follow-btn"
              type="button"
              title={isFollowing ? "Following" : "Follow"}
              onClick={handleFollowToggle}
              disabled={isUpdating || !userId}
              // Graying out logic: bg-zinc-700 and text-zinc-500 when updating, otherwise standard white/black
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 text-[12px] font-bold transition-colors sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${
                isUpdating 
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" 
                  : "bg-white text-black hover:text-zinc-600 cursor-pointer"
              }`}
            >
              <FaUser className={isUpdating ? "opacity-50" : ""} />
              <span>{isUpdating ? "Waiting..." : (isFollowing ? "Following" : "Follow")}</span>
            </button>
          )}
          {isMe && (
            <button
              data-testid="profile-insights-btn"
              type="button"
              title="Your Insights"
              onClick={() => navigate("/me/insights/overview")}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm bg-white px-2 py-1 text-[12px] font-bold text-black hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <BarChart2 size={14} />
              <span>Your Insights</span>
            </button>
          )}
          <button
            type="button"
            title="Share"
            onClick={() => setShowShareOverlay(true)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            <Upload size={14} />
            <span>Share</span>
          </button>
          {userId && (
            <AdminIDDisplay
              id={userId}
              label="Profile ID"
              variant="badge"
              className="ml-3"
            />
          )}
          {!isMe && (
            <div className="relative group">
              <button
  data-testid="profile-messages-btn"
  type="button"
  title="Messages"
  onClick={handleMessage}
  disabled={messageLoading || !userId}
  className="inline-flex shrink-0 items-center justify-center rounded-sm bg-zinc-800 px-2 py-1.5 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:px-3 sm:py-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
>
  {messageLoading ? (
    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
  ) : (
    <FaEnvelope />
  )}
</button>
            </div>
          )}
          <div className="relative">
            {!isMe && (
              <button
                data-testid="profile-more-actions-btn"
                type="button"
                title="More"
                onClick={() => setShowMoreActions((prev) => !prev)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold cursor-pointer sm:gap-2 sm:px-3 sm:py-[6.9px] sm:text-sm ${
                  showMoreActions
                    ? "text-orange-500 hover:text-orange-400"
                    : "text-white hover:text-zinc-500"
                }`}
              >
                <MdMoreHoriz size={19} />
              </button>
            )}
            {showMoreActions && (
              <div className="absolute left-0 top-full z-10 mt-2 flex w-max min-w-[12rem] flex-col rounded-sm border border-zinc-800 bg-zinc-950 shadow-lg sm:left-1/2 sm:-translate-x-1/2">
                <button
                  data-testid="profile-block-btn"
                  type="button"
                  title={isBlocked ? "Unblock" : "Block"}
                  onClick={() => {
                    void handleBlockAction();
                  }}
                  disabled={blockLoading || !userId}
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiSlash />
                  {blockLoading
                    ? isBlocked
                      ? "Unblocking..."
                      : "Blocking..."
                    : isBlocked
                    ? `Unblock ${menuTargetName}`
                    : `Block ${menuTargetName}`}
                </button>
                <button
                  data-testid="profile-report-btn"
                  type="button"
                  title="Report"
                  onClick={() => {
                    setShowMoreActions(false);
                    setShowReportModal(true);
                  }}
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiInfo />
                  Report {menuTargetName}
                </button>
              </div>
            )}
          </div>
          {isMe && (
            <button
              data-testid="profile-edit-btn"
              type="button"
              title="Edit"
              onClick={toggleModal}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm bg-zinc-800 px-2 py-1 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
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
          username={username}
          avatarUrl={avatarUrl}
          country={country}
          city={city}
          bio={bio}
          role={role}
          visibility={visibility}
          socialAccounts={socialAccounts}
        />
      )}
      {showShareOverlay && (
        <ShareOverlay
          onClose={() => setShowShareOverlay(false)}
          shareUrl={shareUrl}
        />
      )}
      {showBlockModal && (
        <BlockUserModal
          targetName={menuTargetName}
          removeComments={removeCommentsOnBlock}
          reportSpam={reportSpamOnBlock}
          blockError={blockError}
          isBlocking={blockLoading}
          onToggleRemoveComments={() => setRemoveCommentsOnBlock((current) => !current)}
          onToggleReportSpam={() => setReportSpamOnBlock((current) => !current)}
          onCancel={() => {
            if (blockLoading) return;
            setShowBlockModal(false);
            setBlockError(null);
          }}
          onConfirm={() => {
            void handleConfirmBlock();
          }}
        />
      )}
      {showReportModal && userId && (
        <ReportModal
          entityType="USER"
          entityId={userId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

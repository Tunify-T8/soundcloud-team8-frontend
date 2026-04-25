import UserInfoBarTab from "./UsetInfoBarTab";
import EditInfo from "./EditInfo";
import {
  FaUser,
  FaPen,
  FaEnvelope,
  FaTwitter,
  FaFacebookF,
  FaTumblr,
  FaPinterestP,
} from "react-icons/fa";
import { MdPodcasts, MdMoreHoriz } from "react-icons/md";
import { FiSlash, FiInfo } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { Upload, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { followingService } from "../../../following/followingService";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";

function ShareOverlay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");
  const [shortenLink, setShortenLink] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-[3px] border border-zinc-800 bg-[#090909] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-7 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`pb-2 text-[34px] font-bold tracking-tight ${
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
            className={`pb-2 text-[34px] font-bold tracking-tight ${
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
            <div className="mb-4 flex items-center gap-4">
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1da1f2] text-white">
                <FaTwitter size={20} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877f2] text-white">
                <FaFacebookF size={20} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#334c6b] text-white">
                <FaTumblr size={20} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e60023] text-white">
                <FaPinterestP size={20} />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2a2a2a] text-zinc-300">
                <FaEnvelope size={18} />
              </button>
            </div>

            <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
              <input
                readOnly
                value={url}
                className="w-full bg-transparent text-[24px] font-semibold text-zinc-100 outline-none"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-[26px] font-semibold text-zinc-100">
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

  const handleFollowToggle = async () => {
    if (!userId || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followingService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followingService.followUser(userId);
        setIsFollowing(true);
      }

      notifySocialGraphUpdated();
      onProfileUpdated?.();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!userId || blockLoading) return;

    setBlockLoading(true);
    try {
      await followingService.blockUser(userId);
      notifySocialGraphUpdated();
      onProfileUpdated?.();
      setShowMoreActions(false);
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
                  title="Block"
                  onClick={handleBlock}
                  disabled={blockLoading || !userId}
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiSlash />
                  {blockLoading ? "Blocking..." : `Block ${displayName}`}
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

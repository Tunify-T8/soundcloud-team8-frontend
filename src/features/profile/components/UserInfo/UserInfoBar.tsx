import UserInfoBarTab from "./UsetInfoBarTab";
import EditInfo from "./EditInfo";
import { FaUser, FaPen, FaEnvelope } from "react-icons/fa";
import { MdPodcasts, MdMoreHoriz } from "react-icons/md";
import { FiSlash, FiInfo } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { profileService } from "../../profileService";
import { notifySocialGraphUpdated } from "../../socialGraphEvents";

export default function UserInfoBar({
  displayName,
  avatarUrl,
  country,
  city,
  bio,
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
  socialAccounts?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
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
    ...(isMe
      ? [
          { label: "Followers", path: "followers" },
          { label: "Following", path: "following" },
          { label: "Suggested", path: "suggested-users" },
          { label: "Blocked", path: "blocked-users" },
        ]
      : []),
  ];

  const [modal, setModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    if (isMe || !userId) return;

    profileService
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
        await profileService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await profileService.followUser(userId);
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
      await profileService.blockUser(userId);
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
      <div className="relative w-10/12 mt-5 flex items-center justify-between">
        <div className="flex flex-row gap-6 cursor-pointer">
          {tabs.map(({ label, path }) => (
            <NavLink key={label} to={path} end={path === "."}>
              {({ isActive }) => (
                <UserInfoBarTab label={label} isActive={isActive} />
              )}
            </NavLink>
          ))}
        </div>
        <div className={`flex items-center ${isMe ? "gap-2" : "gap-4"}`}>
          {!isMe && (
            <button
              type="button"
              title="Station"
              className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
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
              className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-1.5 text-sm font-bold text-black hover:text-zinc-500 cursor-pointer"
            >
              <FaUser />
              <span>{isFollowing ? "Following" : "Follow"}</span>
            </button>
          )}
          <button
            type="button"
            title="Share"
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
          >
            <Upload size={14} />
            <span>Share</span>
          </button>
          {!isMe && (
            <div className="relative group">
              <button
                type="button"
                title="Messages"
                className="inline-flex items-center justify-center rounded-sm bg-zinc-800 px-3 py-2.25 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
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
                className={`inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-[6.9px] text-sm font-bold cursor-pointer ${
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
              className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
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
          socialAccounts={socialAccounts}
        />
      )}
    </div>
  );
}

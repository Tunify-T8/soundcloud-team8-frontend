import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaGlobe,
  FaUser,
  FaGooglePlay,
  FaApple,
  FaSpotify,
  FaSoundcloud,
  FaTiktok,
} from "react-icons/fa";
import { SiSoundcloud } from "react-icons/si";
import { FiInfo } from "react-icons/fi";
import { Ticket, Heart, Play, Repeat2, MessageSquare } from "lucide-react";
import type { FollowingUser } from "../../../../shared/types/User";
import { followingService } from "../../../following/followingService";
import avatarFallback from "@/assets/avatar.png";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import { useMe } from "@/features/profile/context/useMe";
import { feedService } from "@/features/feed/feedservice";
import type { LikedTrack } from "@/features/feed/type";

export default function ProfileSideBar({
  profileId,
  followers,
  following,
  tracks,
  bio,
  socialAccounts,
  followerUsers,
  followingUsers,
  onUnfollowUser,
}: {
  profileId?: string; // the viewed profile's id or username
  followers?: number | string;
  following?: number;
  tracks?: number;
  bio?: string;
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
  followerUsers?: FollowingUser[];
  followingUsers?: FollowingUser[];
  onUnfollowUser?: () => void;
}) {
  const [localFollowerUsers, setLocalFollowerUsers] = useState<FollowingUser[]>(
    followerUsers ?? [],
  );
  const [localFollowingUsers, setLocalFollowingUsers] = useState<
    FollowingUser[]
  >(followingUsers ?? []);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);
  const [likesLoading, setLikesLoading] = useState(true);
  const { me } = useMe();

  useEffect(() => {
    setLocalFollowerUsers(followerUsers ?? []);
  }, [followerUsers]);

  useEffect(() => {
    setLocalFollowingUsers(followingUsers ?? []);
  }, [followingUsers]);

  useEffect(() => {
    let isMounted = true;

    const loadLikes = async () => {
      setLikesLoading(true);
      try {
        const likesResponse =
          profileId && me?.id && profileId !== me.id
            ? await feedService.getUserLikesPage(profileId, 1, 6)
            : await feedService.getMyLikesPage(1, 6);

        let totalCount = likesResponse.items.length;
        if (likesResponse.hasMore) {
          const nextPage =
            profileId && me?.id && profileId !== me.id
              ? await feedService.getUserLikesPage(profileId, 2, 6)
              : await feedService.getMyLikesPage(2, 6);
          totalCount += nextPage.items.length;
        }

        if (isMounted) {
          setLikedTracks(likesResponse.items);
          setLikedTracksCount(totalCount);
        }
      } catch {
        if (isMounted) {
          setLikedTracks([]);
          setLikedTracksCount(0);
        }
      } finally {
        if (isMounted) {
          setLikesLoading(false);
        }
      }
    };

    void loadLikes();
    return () => {
      isMounted = false;
    };
  }, [profileId, me?.id]);

  useEffect(() => {
    let mounted = true;

    async function loadFollowStates() {
      const users = followingUsers ?? [];

      if (!me?.id || users.length === 0) {
        if (mounted) setFollowStates({});
        return;
      }

      const statusEntries = await Promise.all(
        users.map(async (user) => {
          if (user.id === me.id) {
            return [user.id, false] as const;
          }

          try {
            const status = await followingService.getFollowStatus(user.id);
            return [user.id, status.isFollowing] as const;
          } catch {
            return [user.id, false] as const;
          }
        }),
      );

      if (mounted) {
        setFollowStates(Object.fromEntries(statusEntries));
      }
    }

    void loadFollowStates();
    return () => {
      mounted = false;
    };
  }, [followingUsers, me?.id]);

  const visibleFollowerUsers = localFollowerUsers.slice(0, 3);
  const visibleFollowingUsers = localFollowingUsers.slice(0, 3);
  const followingCount = localFollowingUsers.length;
  const followersCountLabel = Number(followers ?? 0);
  const hasSocialAccounts = Boolean(
    socialAccounts?.facebook ||
    socialAccounts?.instagram ||
    socialAccounts?.twitter ||
    socialAccounts?.website ||
    socialAccounts?.youtube ||
    socialAccounts?.spotify ||
    socialAccounts?.tiktok ||
    socialAccounts?.soundcloud,
  );

  // ✅ Use the viewed profile's id/username for links, fall back to me if not provided
  const userPath = profileId
    ? `/${profileId}`
    : me?.username
      ? `/${me.username}`
      : "/me";

  const userInfo = [
    { label: "Followers", path: `${userPath}/followers`, value: followers },
    { label: "Following", path: `${userPath}/following`, value: following },
    { label: "Tracks", path: `${userPath}/tracks`, value: tracks },
  ];

  return (
    <div className="w-full max-w-none rounded-md px-0 py-3 shadow-sm lg:w-full lg:max-w-[22rem] lg:px-0">
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {userInfo.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-start"
          >
            <span className="text-xs font-semibold text-zinc-400 sm:text-sm">
              {item.label}
            </span>
            <span className="mt-2 text-2xl font-bold leading-none text-white hover:text-zinc-500 sm:text-3xl">
              {item.value ?? 0}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <span className="text-[13px] text-white font-medium">{bio}</span>
      </div>
      <div>
        {hasSocialAccounts && (
          <div className="mt-6 flex flex-col gap-2">
            {socialAccounts?.facebook && (
              <a
                href={socialAccounts?.facebook}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaFacebook size={16} />
                Facebook
              </a>
            )}
            {socialAccounts?.instagram && (
              <a
                href={socialAccounts?.instagram}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaInstagram size={16} />
                Instagram
              </a>
            )}
            {socialAccounts?.twitter && (
              <a
                href={socialAccounts?.twitter}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaTwitter size={16} />
                Twitter
              </a>
            )}
            {socialAccounts?.website && (
              <a
                href={socialAccounts?.website}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaGlobe size={16} />
                Website
              </a>
            )}
            {socialAccounts?.youtube && (
              <a
                href={socialAccounts?.youtube}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaYoutube size={16} />
                YouTube
              </a>
            )}
            {socialAccounts?.spotify && (
              <a
                href={socialAccounts?.spotify}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaSpotify size={16} />
                Spotify
              </a>
            )}
            {socialAccounts?.tiktok && (
              <a
                href={socialAccounts?.tiktok}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaTiktok size={16} />
                TikTok
              </a>
            )}
            {socialAccounts?.soundcloud && (
              <a
                href={socialAccounts?.soundcloud}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaSoundcloud size={16} />
                SoundCloud
              </a>
            )}
          </div>
        )}
      </div>
      <div className="mt-6">
        <div className="flex items-center gap-2 border-b border-zinc-300 pb-2">
          <Ticket size={16} className="text-zinc-300" />
          <span className="text-[12px] font-bold uppercase text-white">
            On Tour
          </span>
          <div className="relative group">
            <FiInfo size={14} className="cursor-pointer text-zinc-400" />
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-72 -translate-x-1/2 rounded-sm bg-zinc-200 px-4 py-3 text-[13px] leading-6 text-zinc-900 shadow-lg group-hover:block">
              Add your upcoming events to SoundCloud, and fans will be able to
              view them here.
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-white sm:text-[12px]">
          With an Artist Pro account, you can create ticketed live events on
          SoundCloud, and list existing events.
        </p>
        <ArtistProUpgradeButton className="mt-4 flex w-full items-center justify-center rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-zinc-900 transition-colors hover:bg-zinc-100 sm:py-3 sm:text-[14px]">
          Upgrade to Artist Pro
        </ArtistProUpgradeButton>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold uppercase leading-none tracking-wide text-white">
            {likedTracksCount > 0 ? `${likedTracksCount} LIKES` : "LIKES"}
          </span>
          <Link
            to={`${userPath}/likes`}
            className="text-[13px] text-zinc-500 hover:text-zinc-300"
          >
            View all
          </Link>
        </div>

        {likesLoading ? (
          <div className="mt-3 text-xs text-zinc-400">Loading...</div>
        ) : likedTracks.length === 0 ? (
          <div className="mt-3 text-xs text-zinc-400">No liked tracks yet.</div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {likedTracks.map((track) => (
              <LikedTrackRow key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
      {visibleFollowerUsers.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Link
              to={`${userPath}/followers`}
              className="text-[12px] font-extrabold uppercase leading-none tracking-wide text-white hover:text-zinc-300"
            >
              {followersCountLabel} FOLLOWERS
            </Link>
            <Link
              to={`${userPath}/followers`}
              className="text-[13px] text-zinc-500 hover:text-zinc-300"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 flex items-center">
            {visibleFollowerUsers.map((followingUser, index) => (
              <Link
                key={followingUser.id}
                to={`/${followingUser.id}`}
                className={`relative block h-12 w-12 overflow-hidden rounded-full border border-zinc-900 bg-zinc-800 ${
                  index > 0 ? "-ml-2" : ""
                }`}
                title={followingUser.displayName ?? followingUser.username}
              >
                <img
                  src={followingUser.avatarUrl || avatarFallback}
                  alt={followingUser.username}
                  className="h-full w-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
      {visibleFollowingUsers.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Link
              to={`${userPath}/following`}
              className="text-[12px] font-bold text-white uppercase leading-none hover:text-zinc-500"
            >
              {followingCount} Following
            </Link>
            <Link
              to={`${userPath}/following`}
              className="text-[13px] text-zinc-500 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {visibleFollowingUsers.map((followingUser) => {
              const followingDisplayName =
                followingUser.displayName ?? followingUser.username;
              const followingFollowersCount =
                followingUser.followersCount ?? "0";
              const followingRouteId =
                followingUser.username || followingUser.id;

              return (
                <div
                  key={followingUser.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <Link to={`/${followingUser.id}`} className="shrink-0">
                      <img
                        src={followingUser.avatarUrl || avatarFallback}
                        alt={followingUser.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-col">
                      <Link
                        to={`/${followingUser.id}`}
                        className="truncate text-[14px] font-bold leading-none text-white uppercase hover:text-zinc-500"
                      >
                        {followingDisplayName}
                      </Link>
                      <Link
                        to={`/${followingRouteId}/followers`}
                        className="mt-2 inline-flex items-center gap-1 text-[13px] text-zinc-400 hover:text-zinc-600"
                      >
                        <FaUser size={12} />
                        {followingFollowersCount}
                      </Link>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const userId = followingUser.id;
                      const wasFollowing = followStates[userId] ?? false;
                      setPendingFollowId(userId);
                      setFollowStates((prev) => ({
                        ...prev,
                        [userId]: !wasFollowing,
                      }));
                      try {
                        if (wasFollowing) {
                          await followingService.unfollowUser(userId);
                          onUnfollowUser?.();
                        } else {
                          await followingService.followUser(userId);
                        }
                      } catch {
                        setFollowStates((prev) => ({
                          ...prev,
                          [userId]: wasFollowing,
                        }));
                      } finally {
                        setPendingFollowId((current) =>
                          current === userId ? null : current,
                        );
                      }
                    }}
                    disabled={pendingFollowId === followingUser.id}
                    className="shrink-0 rounded-md bg-zinc-800 px-3 py-2 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
                  >
                    {(followStates[followingUser.id] ?? true)
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6">
        <span className="text-xs font-bold tracking-wide text-white">
          GO MOBILE
        </span>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center gap-2 rounded-md border border-zinc-500 bg-black px-2 text-white transition hover:border-zinc-300 sm:px-3"
          >
            <FaApple size={24} />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[9px] font-medium text-zinc-300">
                Download on the
              </span>
              <span className="text-[17px] font-semibold leading-3.5">
                App Store
              </span>
            </div>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.soundcloud.android&hl=us"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center gap-2 rounded-md border border-zinc-500 bg-black px-2 text-white transition hover:border-zinc-300 sm:px-3"
          >
            <FaGooglePlay size={24} />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[9px] font-medium text-zinc-300">
                GET IT ON
              </span>
              <span className="text-[17px] font-semibold leading-3.5">
                Google Play
              </span>
            </div>
          </a>
        </div>
      </div>
      <div className="mt-6 text-zinc-400">
        <div className="text-[14px]">
          <a href="#" className="hover:text-zinc-300">
            Legal
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Privacy
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Cookie Policy
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Cookie Manager
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Imprint
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Artist Resources
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Newsroom
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Charts
          </a>
          <span> · </span>
          <a href="#" className="hover:text-zinc-300">
            Transparency Reports
          </a>
        </div>
        <div className="mt-7 text-[13px] leading-none">
          <span className="font-semibold text-white">Language:</span>{" "}
          <a href="#" className="text-blue-400 hover:text-blue-300">
            English (US)
          </a>
        </div>
      </div>
    </div>
  );
}

function LikedTrackRow({ track }: { track: LikedTrack }) {
  return (
    <Link to={`/tracks/${track.id}`} className="flex items-center gap-2">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-[hsl(0,0%,15%)]">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <SiSoundcloud size={16} className="text-gray-600" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight text-white">
          {track.title}
        </p>
        <p className="truncate text-[11px] text-gray-400">{track.artist}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-0.5">
            <Play size={8} fill="currentColor" />
            {track.playsCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart size={8} />
            {track.likesCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <Repeat2 size={8} />
            {track.repostsCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare size={8} />
            {track.commentsCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

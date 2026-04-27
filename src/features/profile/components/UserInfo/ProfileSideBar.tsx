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
import { FiInfo } from "react-icons/fi";
import { Ticket } from "lucide-react";
import type { FollowingUser } from "../../../../shared/types/User";
import { followingService } from "../../../following/followingService";
import avatarFallback from '@/assets/avatar.png';
import CheckoutModal from "@/features/premium/components/CheckoutModal";
import { useMe } from "@/features/profile/context/useMe";

export default function ProfileSideBar({
  profileId,
  followers,
  following,
  tracks,
  bio,
  socialAccounts,
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
  followingUsers?: FollowingUser[];
  onUnfollowUser?: () => void;
}) {
  const [localFollowingUsers, setLocalFollowingUsers] = useState<FollowingUser[]>(
    followingUsers ?? [],
  );
  const [pendingUnfollowId, setPendingUnfollowId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { me } = useMe();

  useEffect(() => {
    setLocalFollowingUsers(followingUsers ?? []);
  }, [followingUsers]);

  const visibleFollowingUsers = localFollowingUsers.slice(0, 3);
  const followingCount = localFollowingUsers.length;
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
  const userPath = profileId ? `/${profileId}` : me?.username ? `/${me.username}` : "/me";

  const userInfo = [
    { label: "Followers", path: `${userPath}/followers`, value: followers },
    { label: "Following", path: `${userPath}/following`, value: following },
    { label: "Tracks", path: `${userPath}/tracks`, value: tracks },
  ];

  return (
    <div className="w-full max-w-none rounded-md px-0 py-3 shadow-sm lg:w-88 lg:px-5">
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
        <button
          className="mt-4 flex w-full items-center justify-center rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-zinc-900 transition-colors hover:bg-zinc-100 sm:py-3 sm:text-[14px]"
          onClick={() => {
            setCheckoutOpen(true);
          }}
        >
          Upgrade to Artist Pro
        </button>
      </div>
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

              return (
                <div
                  key={followingUser.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <img
                      src={followingUser.avatarUrl || avatarFallback}
                      alt={followingUser.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex min-w-0 flex-col">
                      <Link
                        to={`/${followingUser.id}`}
                        className="truncate text-[14px] font-bold leading-none text-white uppercase hover:text-zinc-500"
                      >
                        {followingDisplayName}
                      </Link>
                      <Link
                        to={`/${followingUser.id}/followers`}
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
                      setPendingUnfollowId(followingUser.id);
                      try {
                        await followingService.unfollowUser(followingUser.id);
                        setLocalFollowingUsers((prev) =>
                          prev.filter((user) => user.id !== followingUser.id),
                        );
                        onUnfollowUser?.();
                      } finally {
                        setPendingUnfollowId((current) =>
                          current === followingUser.id ? null : current,
                        );
                      }
                    }}
                    disabled={pendingUnfollowId === followingUser.id}
                      className="shrink-0 rounded-md bg-zinc-800 px-3 py-2 text-[12px] font-bold text-white hover:text-zinc-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
                    >
                    {pendingUnfollowId === followingUser.id
                      ? "Unfollowing..."
                      : "Following"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>
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
      {checkoutOpen && <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
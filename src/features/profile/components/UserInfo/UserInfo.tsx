import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export default function UserInfo({
  followers,
  following,
  tracks,
  bio,
  socialAccounts,
}: {
  followers?: number;
  following?: number;
  tracks?: number;
  bio?: string;
  socialAccounts?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}) {
  const userInfo = [
    { label: "Followers", path: "followers", value: followers },
    { label: "Following", path: "following", value: following },
    { label: "Tracks", path: "tracks", value: tracks },
  ];

  return (
    <div className="w-88 rounded-md px-5 py-4 shadow-sm">
      <div className="grid grid-cols-3 gap-6">
        {userInfo.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-start"
          >
            <span className="text-sm font-semibold text-zinc-400">
              {item.label}
            </span>
            <span className="text-3xl mt-2 font-bold leading-none text-white hover:text-zinc-500">
              {item.value ?? 0}
            </span>
          </Link>
        ))}
      </div>
      <div className=" mt-5">
        <span className="text-[13px] text-white font-medium">{bio}</span>
      </div>
      <div>
        {socialAccounts && (
          <div className="mt-6 flex flex-col gap-2">
            {socialAccounts.facebook && (
              <a
                href={socialAccounts.facebook}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaFacebook size={16} />
                Facebook
              </a>
            )}
            {socialAccounts.instagram && (
              <a
                href={socialAccounts.instagram}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaInstagram size={16} />
                Instagram
              </a>
            )}
            {socialAccounts.twitter && (
              <a
                href={socialAccounts.twitter}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaTwitter size={16} />
                Twitter
              </a>
            )}
            {socialAccounts.youtube && (
              <a
                href={socialAccounts.youtube}
                className="flex items-center gap-2 text-[14px] text-zinc-400 hover:text-zinc-600 font-bold"
              >
                <FaYoutube size={16} />
                YouTube
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaMusic, FaGooglePlay, FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { FiRefreshCcw } from "react-icons/fi";
import { TbWorld } from "react-icons/tb";
import { MdOutlineAutoFixHigh } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
export default function SideBar() {
  const [open, setOpen] = useState(true);

  // Artists state
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch artists from mock-server
  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl =
        window.location.hostname === "localhost" ? "http://localhost:3001" : "";
      const res = await axios.get(`${baseUrl}/artists`);
      setSuggestedUsers(res.data.artists || []);
    } catch (err) {
      setError("Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return (
    <header className=" flex flex-col justify-end mt-2">
      <div className="ml-auto flex flex-col w-1xl mr-25 ">
        <div className="w-full">
          {/* HEADER */}
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between
        cursor-pointer text-xs text-zinc-400
        font-semibold tracking-wide mb-3"
          >
            <span>ARTIST TOOLS</span>

            <IoChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>

          {/* DEFAULT TOOLS */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Tool icon={<HiOutlineSpeakerphone size={20} />} label="Amplify" />
            <Tool icon={<FiRefreshCcw size={20} />} label="Replace" />
            <Tool icon={<TbWorld size={20} />} label="Distribute" />
            <Tool icon={<MdOutlineAutoFixHigh size={20} />} label="Master" />
          </div>

          {/* DROPDOWN TOOLS */}
          {open && (
            <div className="grid grid-cols-4 gap-3">
              <Tool
                icon={<HiOutlineSpeakerphone size={20} />}
                label="Promote"
              />
              <Tool icon={<FiRefreshCcw size={20} />} label="Insights" />
              <Tool icon={<TbWorld size={20} />} label="Monetize" />
              <Tool
                icon={<MdOutlineAutoFixHigh size={20} />}
                label="Pro Tools"
              />
            </div>
          )}
        </div>

        {/* ARTISTS YOU SHOULD FOLLOW */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase">
              ARTISTS YOU SHOULD FOLLOW
            </span>
            <button className="text-xs text-gray-400 hover:underline">
              Refresh list
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-gray-400 text-xs">Loading...</div>
            ) : error ? (
              <div className="text-red-400 text-xs">{error}</div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-gray-400 text-xs">No suggestions found.</div>
            ) : (
              suggestedUsers.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between"
                >
                  <Link
                    to={`/profile/${artist.name}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-11 h-11 rounded-full object-cover bg-gradient-to-br from-gray-700 to-gray-900"
                    />
                    <div>
                      <div className="font-bold text-white text-[15px] leading-tight hover:text-zinc-500">
                        {artist.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1 hover:text-zinc-600">
                          <FaUser size={12} />
                          {artist.followers}
                        </span>
                        <span className="flex items-center gap-1 hover:text-zinc-600">
                          <FaMusic size={12} />
                          {artist.tracks}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button className="bg-white text-black font-semibold rounded px-5 py-1.5 text-sm hover:bg-gray-100 transition">
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <span className="text-xs font-bold tracking-wide text-white">
            GO MOBILE
          </span>
          <div className="mt-3 flex gap-2">
            <a
              href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-37 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white hover:border-zinc-300 transition"
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
              className="flex h-11 w-38 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white hover:border-zinc-300 transition"
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
    </header>
  );
}
type ToolProps = {
  icon: React.ReactNode;
  label: string;
};

function Tool({ icon, label }: ToolProps) {
  return (
    <div
      className="
      relative
      flex flex-col items-center justify-center
      w-[70px] h-[70px]
      bg-zinc-950
      border border-zinc-800
      rounded-lg
      hover:bg-zinc-900
      hover:border-zinc-700
      cursor-pointer
      transition
      "
    >
      {/* purple add badge */}
      <IoAddCircle
        size={14}
        className="absolute top-1 right-1 text-purple-500"
      />

      <div className="text-zinc-300">{icon}</div>

      <span className="text-[11px] mt-1 text-zinc-400">{label}</span>
    </div>
  );
}

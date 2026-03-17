import UserInfoBarTab from "./UsetInfoBarTab";
import EditInfo from "./EditInfo";
import { FaUser, FaPen, FaEnvelope } from "react-icons/fa";
import { MdPodcasts, MdMoreHoriz } from "react-icons/md";
import { FiSlash, FiInfo } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function UserInfoBar({
  displayName,
  avatarUrl,
  country,
  city,
  bio,
  socialAccounts,
  isEditable,
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
    youtube?: string;
  };
  isEditable?: boolean;
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
        <div className={`flex items-center ${isEditable ? "gap-2" : "gap-4"}`}>
          {!isEditable && (
            <button
              type="button"
              title="Station"
              className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
            >
              <MdPodcasts />
              <span>Station</span>
            </button>
          )}
          {!isEditable && (
            <button
              type="button"
              title="Follow"
              className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-1.5 text-sm font-bold text-black hover:text-zinc-500 cursor-pointer"
            >
              <FaUser />
              <span>Follow</span>
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
          {!isEditable && (
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
            {!isEditable && (
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
                  className="inline-flex items-center gap-2 w-auto whitespace-nowrap text-left text-white font-bold text-[14px] px-3 py-2 hover:text-zinc-500 transition-colors cursor-pointer"
                >
                  <FiSlash />
                  Block {displayName}
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
          {isEditable && (
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

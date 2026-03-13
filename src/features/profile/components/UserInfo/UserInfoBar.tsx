import Tab from "./Tab";
import EditInfo from "./EditInfo";
import { NavLink } from "react-router-dom";
import { PenLine, Upload } from "lucide-react";
import { useState } from "react";

export default function UserInfoBar({
  displayName,
  country,
  city,
  bio
}: {
  displayName?: string;
  country?: string;
  city?: string;
  bio?: string;
}) {
  const tabs = [
    { label: "All", path: "/username" },
    { label: "Popular tracks", path: "/username/popular-tracks" },
    { label: "Tracks", path: "/username/tracks" },
    { label: "Albums", path: "/username/albums" },
    { label: "Playlists", path: "/username/playlists" },
    { label: "Reposts", path: "/username/reposts" },
  ];

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };
  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative w-10/12 mt-5 flex items-center justify-between">
        <div className="flex flex-row gap-6 cursor-pointer">
          {tabs.map(({ label, path }) => (
            <NavLink to={path} end={path === "/username"}>
              {({ isActive }) => <Tab label={label} isActive={isActive} />}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer">
            <Upload size={14} />
            <span>Share</span>
          </button>
          <button
            onClick={toggleModal}
            className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
          >
            <PenLine size={14} />
            <span>Edit</span>
          </button>
        </div>
      </div>
      {modal && <EditInfo onClick={toggleModal} displayName={displayName} country={country} city={city} bio={bio} />}
    </div>
  );
}

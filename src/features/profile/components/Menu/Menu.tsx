import Tab from "./Tab";
import { NavLink } from "react-router-dom";

export default function Menu() {
  const tabs = [
    { label: "All", path: "/username" },
    { label: "Popular tracks", path: "/username/popular-tracks" },
    { label: "Tracks", path: "/username/tracks" },
    { label: "Albums", path: "/username/albums" },
    { label: "Playlists", path: "/username/playlists" },
    { label: "Reposts", path: "/username/reposts" },
  ];

  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative w-10/12 mt-5 flex flex-row gap-6">
        {tabs.map(({ label, path }) => (
          <NavLink to={path} end={path === "/username"}>
            {({ isActive }) => <Tab label={label} isActive={isActive} />}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

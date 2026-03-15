import Avatar from "../Header/Avatar";
import { useEffect, useState } from "react";

export default function EditInfo({
  onClick,
  displayName,
  avatarUrl,
  country,
  city,
  bio,
}: {
  onClick: () => void;
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  bio?: string;
}) {
  const initialDisplayName = displayName ?? "";
  const initialCountry = country ?? "";
  const initialCity = city ?? "";
  const initialBio = bio ?? "";

  const [displayNameState, setDisplayNameState] = useState(initialDisplayName);
  const [countryState, setCountryState] = useState(initialCountry);
  const [cityState, setCityState] = useState(initialCity);
  const [bioState, setBioState] = useState(initialBio);

  const hasChanges =
    displayNameState !== initialDisplayName ||
    countryState !== initialCountry ||
    cityState !== initialCity ||
    bioState !== initialBio;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/40">
      <div className="mx-auto my-6 w-[95%] max-w-3xl rounded-md bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-6">Edit your Profile</h2>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300 overflow-hidden">
            <Avatar avatarUrl={avatarUrl} displayName={displayName} />
          </div>

          <div>
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Display name
              </label>
              <input
                value={displayNameState}
                onChange={(event) => setDisplayNameState(event.target.value)}
                className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                placeholder="Enter display name"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  City
                </label>
                <input
                  value={cityState}
                  onChange={(event) => setCityState(event.target.value)}
                  className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Country
                </label>
                <input
                  value={countryState}
                  onChange={(event) => setCountryState(event.target.value)}
                  className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-white">
                Bio
              </label>
              <textarea
                value={bioState}
                onChange={(event) => setBioState(event.target.value)}
                className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                placeholder="Tell the world a little bit about yourself. The shorter the better."
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClick}
                className="inline-flex items-center gap-2 rounded-sm bg-zinc-700 px-3 py-1.5 text-sm font-bold text-white hover:text-zinc-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onClick}
                disabled={!hasChanges}
                className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-bold text-zinc-900 ${
                  hasChanges
                    ? "bg-white hover:text-zinc-400 cursor-pointer"
                    : "bg-zinc-500 "
                }`}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Avatar from "../Header/Avatar";
import { useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";

export default function EditInfo({
  onClick,
  displayName,
  avatarUrl,
  country,
  city,
  bio,
  socialAccounts,
}: {
  onClick: () => void;
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
}) {
  const initialDisplayName = displayName ?? "";
  const initialCountry = country ?? "";
  const initialCity = city ?? "";
  const initialBio = bio ?? "";
  const initialFacebook = socialAccounts?.facebook ?? "";
  const initialInstagram = socialAccounts?.instagram ?? "";
  const initialTwitter = socialAccounts?.twitter ?? "";
  const initialYoutube = socialAccounts?.youtube ?? "";

  const [displayNameState, setDisplayNameState] = useState(initialDisplayName);
  const [countryState, setCountryState] = useState(initialCountry);
  const [cityState, setCityState] = useState(initialCity);
  const [bioState, setBioState] = useState(initialBio);
  const [showLinkInputs, setShowLinkInputs] = useState(false);
  const [facebookState, setFacebookState] = useState(initialFacebook);
  const [instagramState, setInstagramState] = useState(initialInstagram);
  const [twitterState, setTwitterState] = useState(initialTwitter);
  const [youtubeState, setYoutubeState] = useState(initialYoutube);

  const hasChanges =
    displayNameState !== initialDisplayName ||
    countryState !== initialCountry ||
    cityState !== initialCity ||
    bioState !== initialBio ||
    facebookState !== initialFacebook ||
    instagramState !== initialInstagram ||
    twitterState !== initialTwitter ||
    youtubeState !== initialYoutube;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/40">
      <div className="mx-auto my-6 flex max-h-[90vh] w-[95%] max-w-3xl flex-col overflow-y-auto rounded-md bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-6">Edit your Profile</h2>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="flex h-full flex-col">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300 overflow-hidden">
              <Avatar avatarUrl={avatarUrl} displayName={displayName} />
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Your links</span>
                <div className="relative group">
                  <FiInfo size={14} className="text-zinc-400 cursor-pointer" />
                  <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-80 rounded-sm bg-zinc-400 px-4 py-3 text-[14px] text-zinc-900 shadow-lg group-hover:block">
                    Add links to your website and social network profiles to
                    help your audience find you wherever you are.
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLinkInputs((prev) => !prev)}
                  className="rounded-sm bg-zinc-800 px-4 py-2 text-sm font-bold text-white hover:text-zinc-400 cursor-pointer"
                >
                  Add link
                </button>
              </div>

              {showLinkInputs && (
                <div className="mt-4 grid gap-3">
                  <input
                    value={facebookState}
                    onChange={(event) => setFacebookState(event.target.value)}
                    className="w-170 rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Facebook URL"
                  />
                  <input
                    value={instagramState}
                    onChange={(event) => setInstagramState(event.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Instagram URL"
                  />
                  <input
                    value={twitterState}
                    onChange={(event) => setTwitterState(event.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Twitter URL"
                  />
                  <input
                    value={youtubeState}
                    onChange={(event) => setYoutubeState(event.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="YouTube URL"
                  />
                </div>
              )}
            </div>
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
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-zinc-800 pt-4">
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
  );
}

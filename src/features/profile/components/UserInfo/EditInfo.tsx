import Avatar from "../Header/Avatar";
import { useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { profileService } from "../../profileService";

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
  const initialInstagram = socialAccounts?.instagram ?? "";
  const initialTwitter = socialAccounts?.twitter ?? "";

  const [displayNameState, setDisplayNameState] = useState(initialDisplayName);
  const [countryState, setCountryState] = useState(initialCountry);
  const [cityState, setCityState] = useState(initialCity);
  const [bioState, setBioState] = useState(initialBio);
  const [instagramState, setInstagramState] = useState(initialInstagram);
  const [twitterState, setTwitterState] = useState(initialTwitter);
  const [websiteState, setWebsiteState] = useState("");
  const [visibilityState, setVisibilityState] = useState<"PUBLIC" | "PRIVATE">(
    "PUBLIC",
  );
  const [userTypeState, setUserTypeState] = useState<"ARTIST" | "LISTENER">(
    "ARTIST",
  );
  const [showLinkInputs, setShowLinkInputs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasChanges =
    displayNameState !== initialDisplayName ||
    countryState !== initialCountry ||
    cityState !== initialCity ||
    bioState !== initialBio ||
    instagramState !== initialInstagram ||
    twitterState !== initialTwitter ||
    websiteState !== "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const location =
        [cityState, countryState].filter(Boolean).join(", ") || null;

      await profileService.updateMeProfile({
        username: displayNameState || undefined,
        bio: bioState || null,
        location,
        visibility: visibilityState,
        userType: userTypeState,
      });

      await profileService.updateMeSocialLinks({
        instagram: instagramState || null,
        twitter: twitterState || null,
        website: websiteState || null,
      });

      onClick();
    } catch (err: any) {
      console.error("Failed to save profile", err);
      setErrorMsg(
        err?.response?.data?.message ?? "Failed to save. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/40">
      <div className="mx-auto my-6 flex max-h-[90vh] w-[95%] max-w-3xl flex-col overflow-y-auto rounded-md bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-6">Edit your Profile</h2>

        {errorMsg && (
          <div className="mb-4 rounded-sm bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

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
                  {showLinkInputs ? "Hide links" : "Add link"}
                </button>
              </div>

              {showLinkInputs && (
                <div className="mt-4 grid gap-3">
                  <input
                    value={instagramState}
                    onChange={(e) => setInstagramState(e.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Instagram URL"
                  />
                  <input
                    value={twitterState}
                    onChange={(e) => setTwitterState(e.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Twitter URL"
                  />
                  <input
                    value={websiteState}
                    onChange={(e) => setWebsiteState(e.target.value)}
                    className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    placeholder="Website URL"
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
                onChange={(e) => setDisplayNameState(e.target.value)}
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
                  onChange={(e) => setCityState(e.target.value)}
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
                  onChange={(e) => setCountryState(e.target.value)}
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
                onChange={(e) => setBioState(e.target.value)}
                className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                placeholder="Tell the world a little bit about yourself."
                rows={3}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Account type
                </label>
                <select
                  value={userTypeState}
                  onChange={(e) =>
                    setUserTypeState(e.target.value as "ARTIST" | "LISTENER")
                  }
                  className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 cursor-pointer"
                >
                  <option value="ARTIST">Artist</option>
                  <option value="LISTENER">Listener</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Visibility
                </label>
                <select
                  value={visibilityState}
                  onChange={(e) =>
                    setVisibilityState(e.target.value as "PUBLIC" | "PRIVATE")
                  }
                  className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 cursor-pointer"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
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
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-bold text-zinc-900 ${
              hasChanges && !isSaving
                ? "bg-white hover:text-zinc-400 cursor-pointer"
                : "bg-zinc-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

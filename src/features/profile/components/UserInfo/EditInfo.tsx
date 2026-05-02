import Avatar from "../Header/Avatar";
import { useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { X } from "lucide-react";
import { profileService } from "../../profileService";
import type {
  SocialPlatform,
  UserSocialLink,
} from "../../../../shared/types/User";

const PLATFORM_OPTIONS: SocialPlatform[] = [
  "INSTAGRAM",
  "YOUTUBE",
  "SPOTIFY",
  "TIKTOK",
  "SOUNDCLOUD",
  "TWITTER",
];

function normalizeLinks(links: UserSocialLink[]): UserSocialLink[] {
  return links
    .map((link) => ({
      platform: link.platform,
      url: link.url.trim(),
    }))
    .filter((link) => link.url.length > 0);
}

export default function EditInfo({
  onClick,
  onSaved,
  displayName,
  username,
  avatarUrl,
  country,
  city,
  bio,
  role,
  visibility,
  socialAccounts,
}: {
  onClick: () => void;
  onSaved?: () => void;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  bio?: string;
  role?: "ARTIST" | "LISTENER";
  visibility?: "PUBLIC" | "PRIVATE";
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
}) {
  const initialDisplayName = displayName ?? "";
  const initialUsername = username ?? "";
  const initialCountry = country ?? "";
  const initialCity = city ?? "";
  const initialBio = bio ?? "";
  const initialRole = role ?? "ARTIST";
  const initialVisibility = visibility ?? "PUBLIC";
  const initialLinks: UserSocialLink[] = PLATFORM_OPTIONS.map((platform) => {
    let url = "";
    switch (platform) {
      case "INSTAGRAM":
        url = socialAccounts?.instagram ?? "";
        break;
      case "YOUTUBE":
        url = socialAccounts?.youtube ?? "";
        break;
      case "SPOTIFY":
        url = socialAccounts?.spotify ?? "";
        break;
      case "TIKTOK":
        url = socialAccounts?.tiktok ?? "";
        break;
      case "SOUNDCLOUD":
        url = socialAccounts?.soundcloud ?? "";
        break;
      case "TWITTER":
        url = socialAccounts?.twitter ?? "";
        break;
      default:
        url = "";
    }
    return { platform, url };
  }).filter((link) => link.url.trim().length > 0);
  const normalizedInitialLinks = normalizeLinks(initialLinks);

  const [displayNameState, setDisplayNameState] = useState(initialDisplayName);
  const [usernameState, setUsernameState] = useState(initialUsername);
  const [countryState, setCountryState] = useState(initialCountry);
  const [cityState, setCityState] = useState(initialCity);
  const [bioState, setBioState] = useState(initialBio);
  const [linksState, setLinksState] = useState<UserSocialLink[]>(initialLinks);
  const [visibilityState, setVisibilityState] = useState<"PUBLIC" | "PRIVATE">(
    initialVisibility,
  );
  const [roleState, setRoleState] = useState<"ARTIST" | "LISTENER">(
    initialRole,
  );
  const [showLinkInputs, setShowLinkInputs] = useState(initialLinks.length > 0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const normalizedCurrentLinks = normalizeLinks(linksState);
  const hasSocialLinksChanges =
    JSON.stringify(normalizedCurrentLinks) !==
    JSON.stringify(normalizedInitialLinks);

  const hasChanges =
    displayNameState !== initialDisplayName ||
    usernameState !== initialUsername ||
    countryState !== initialCountry ||
    cityState !== initialCity ||
    bioState !== initialBio ||
    roleState !== initialRole ||
    visibilityState !== initialVisibility ||
    hasSocialLinksChanges;

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
      const normalizedUsername = usernameState.trim();

      await profileService.updateMeProfile({
        displayName: displayNameState || undefined,
        username: normalizedUsername || undefined,
        bio: bioState || null,
        location,
        visibility: visibilityState,
        role: roleState,
      });

      if (hasSocialLinksChanges) {
        if (normalizedCurrentLinks.length === 0) {
          setErrorMsg("Please add at least one social link before saving.");
          setIsSaving(false);
          return;
        }

        await profileService.updateMeSocialLinks({
          links: normalizedCurrentLinks,
        });
      }

      onSaved?.();
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto hide-scrollbar bg-white/40"
      onClick={(e) => e.target === e.currentTarget && onClick()}
    >
      <button
        onClick={onClick}
        className="fixed right-6 top-6 z-[72] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close edit profile overlay"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto my-6 flex max-h-[90vh] w-[95%] max-w-3xl flex-col overflow-y-auto hide-scrollbar rounded-md bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-6">Edit your Profile</h2>

        {errorMsg && (
          <div className="mb-4 rounded-sm bg-red-900/40 border border-red-500/40 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300 overflow-visible">
              <Avatar
                avatarUrl={avatarUrl}
                displayName={displayName}
                isMe
                variant="edit"
              />
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

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-white">
                Username
              </label>
              <input
                value={usernameState}
                onChange={(e) => setUsernameState(e.target.value)}
                className="w-full rounded-sm border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                placeholder="Enter username"
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
                  value={roleState}
                  onChange={(e) =>
                    setRoleState(e.target.value as "ARTIST" | "LISTENER")
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

        {/* Links section — full width, below the grid */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Your links</span>
            <div className="relative group">
              <FiInfo size={14} className="text-zinc-400 cursor-pointer" />
              <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-80 rounded-sm bg-zinc-400 px-4 py-3 text-[14px] text-zinc-900 shadow-lg group-hover:block">
                Add links to your website and social network profiles to help
                your audience find you wherever you are.
              </div>
            </div>
          </div>

          {showLinkInputs && (
            <div className="mt-3 grid gap-2">
              {linksState.map((link, index) => (
                <div
                  key={`${link.platform}-${index}`}
                  className="flex items-center gap-2"
                >
                  <div className="flex-shrink-0 text-zinc-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>

                  <input
                    value={link.url}
                    onChange={(e) => {
                      const nextLinks = [...linksState];
                      nextLinks[index] = {
                        ...nextLinks[index],
                        url: e.target.value,
                      };
                      setLinksState(nextLinks);
                    }}
                    className="flex-1 min-w-0 rounded-sm bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                    placeholder="Web or email address"
                  />

                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const nextLinks = [...linksState];
                      nextLinks[index] = {
                        ...nextLinks[index],
                        platform: e.target.value as SocialPlatform,
                      };
                      setLinksState(nextLinks);
                    }}
                    className="w-36 flex-shrink-0 rounded-sm bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 cursor-pointer"
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform.charAt(0) + platform.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await profileService.removeMeSocialLink(link.platform);
                        setLinksState(
                          linksState.filter(
                            (_, rowIndex) => rowIndex !== index,
                          ),
                        );
                      } catch (err) {
                        console.error("Failed to remove social link", err);
                      }
                    }}
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-400/40 cursor-pointer transition-colors"
                    aria-label={`Remove link ${index + 1}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                disabled={linksState.length >= 6}
                onClick={() =>
                  setLinksState([
                    ...linksState,
                    { platform: "INSTAGRAM", url: "" },
                  ])
                }
                className={`mt-1 rounded-sm px-4 py-2 text-sm font-bold border transition-colors ${
                  linksState.length >= 6
                    ? "border-zinc-700 text-zinc-500 cursor-not-allowed"
                    : "border-zinc-600 text-white hover:border-zinc-400 cursor-pointer"
                }`}
              >
                Add link
              </button>
            </div>
          )}

          {!showLinkInputs && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  if (linksState.length === 0) {
                    setLinksState([{ platform: "INSTAGRAM", url: "" }]);
                  }
                  setShowLinkInputs(true);
                }}
                className="rounded-sm border border-zinc-600 px-4 py-2 text-sm font-bold text-white hover:border-zinc-400 cursor-pointer transition-colors"
              >
                Add link
              </button>
            </div>
          )}
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

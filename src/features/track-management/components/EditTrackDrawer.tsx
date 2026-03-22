import { useState, useRef } from "react";
import { X, Download, RefreshCw, ChevronDown } from "lucide-react";
import type { Track } from "../../../shared/types/Track";
import storefrontImg from "@/assets/storefront.png";
import { trackService } from "../trackService";
import type { UpdateTrackPayload } from "../trackService";
import type { Genre } from "@/shared/types/Genre";

interface EditTrackDrawerProps {
  track: Track;
  onClose: () => void;
}

function InfoIcon() {
  return (
    <svg className="ml-1 inline-block" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="#666" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      className={`relative cursor-pointer flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-[#169b45]" : "bg-[#333]"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${enabled ? "left-5" : "left-0.5"}`} />
    </div>
  );
}

function Accordion({
  icon,
  title,
  subtitle,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#2a2a2a]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left py-5"
      >
        <div className="flex items-center gap-4">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-sm text-[#666] mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#aaa] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}

export default function EditTrackDrawer({ track, onClose }: EditTrackDrawerProps) {
  const [activeTab, setActiveTab] = useState<"details" | "advanced" | "storefront">("details");

  const [artworkPreview, setArtworkPreview] = useState<string | null>(track.thumbnailUrl ?? null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(track.title);
  const [artists, setArtists] = useState(track.artist);
  const [genre, setGenre] = useState(track.genre);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("private");
  const [license, setLicense] = useState<"all" | "cc">("all");

  const [toggles, setToggles] = useState({
    downloads: false,
    offline: true,
    rss: true,
    embed: true,
    appPlayback: true,
    comments: true,
    showComments: true,
    insights: true,
  });

  type TogglesKey = keyof typeof toggles;
  const setToggle = (key: TogglesKey, val: boolean) =>
    setToggles((t) => ({ ...t, [key]: val }));

  const handleArtworkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_DIM = 400;
      const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setArtworkPreview(canvas.toDataURL("image/jpeg", 0.7));
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleSave = async () => {
  try {
    await trackService.updateTrack(track.id, {
      id: track.id,
      title,
      genre: track.genre,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      description,
      privacy,
      artwork: artworkPreview,
    });
    onClose();
  } catch (err) {
    console.error("Failed to update track:", err);
  }
};

  const inputClass =
    "w-full bg-[#181818] border border-[#333] text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#555] placeholder-[#555]";

  const TrackDetailsTab = (
    <div className="px-6 py-5 space-y-0 overflow-y-auto flex-1">
      <div className="mb-6">
        <input
          ref={artworkInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleArtworkSelect}
        />
        <div
          onClick={() => artworkInputRef.current?.click()}
          className="w-full aspect-square border border-dashed border-[#444] flex flex-col items-center justify-center text-[#888] hover:border-[#666] transition cursor-pointer max-w-[220px] mx-auto overflow-hidden relative group rounded"
        >
          {artworkPreview ? (
            <>
              <img src={artworkPreview} alt="Artwork" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                <p className="text-white text-xs font-semibold">Change artwork</p>
              </div>
            </>
          ) : (
            <>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              <p className="mt-2 text-sm text-[#999]">Add new artwork</p>
            </>
          )}
        </div>
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-bold text-white">Track title</label>
          <span className="text-white text-sm">*</span>
          <InfoIcon />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
        />
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <label className="text-sm font-bold text-white block mb-1">Track link</label>
        <input
          type="text"
          defaultValue="https://soundcloud.com/nadaserag/voice-memo-march-14-2"
          className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
        />
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-bold text-white">Main Artist(s)</label>
          <InfoIcon />
        </div>
        <input
          type="text"
          value={artists}
          onChange={(e) => setArtists(e.target.value)}
          className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
        />
        <p className="text-xs text-[#555] mt-1">Tip: Use commas to add multiple artist names.</p>
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <label className="text-sm font-bold text-white block mb-1">Genre</label>
        <div className="flex items-center">
          <input
            value={genre}
           // onChange={(e) => setGenre(e.target.value)}
            placeholder="Add or search for genre"
            className="w-full bg-transparent text-[#555] text-sm py-1 focus:outline-none placeholder-[#555]"
          />
          <ChevronDown className="w-4 h-4 text-[#777] flex-shrink-0" />
        </div>
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-bold text-white">Tags</label>
          <InfoIcon />
        </div>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add styles, moods, tempo."
          className="w-full bg-transparent text-[#555] text-sm py-1 focus:outline-none placeholder-[#555]"
        />
      </div>

      <div className="border-b border-[#2a2a2a] pb-3 mb-4">
        <label className="text-sm font-bold text-white block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Tracks with descriptions tend to get more plays and engagements."
          className="w-full bg-transparent text-[#555] text-sm py-1 resize-none focus:outline-none placeholder-[#555]"
        />
      </div>

      <div className="pb-4">
        <label className="text-sm font-bold text-white block mb-3">Track Privacy</label>
        <div className="flex gap-6 text-sm text-white">
          {(["Public", "Private"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="edit-privacy"
                checked={privacy === opt.toLowerCase()}
                onChange={() => setPrivacy(opt.toLowerCase() as typeof privacy)}
                className="accent-white w-4 h-4"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const AdvancedSettingsTab = (
    <div className="px-6 overflow-y-auto flex-1">
      <Accordion title="Advanced details" subtitle="Buy link, record label, release date, publisher...">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-white block mb-2">Buy link</label>
            <input placeholder="Add a link to let your fans purchase the track from another site." className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-2">Record label</label>
            <input placeholder="If your track is released under a specific record label, you can add that here." className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-1">Release date</label>
            <p className="text-sm text-[#666] mb-2">If your track has a specific release date, you can add that here.</p>
            <input type="date" className="w-48 bg-[#181818] border border-[#333] text-[#888] text-sm px-3 py-2 focus:outline-none focus:border-[#555]" />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-1">Publisher</label>
            <p className="text-sm text-[#666] mb-2">If you have a publisher, you can add that here.</p>
            <input className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-1">ISRC</label>
            <p className="text-sm text-[#666] mb-2">An ISRC is a unique identifier assigned to a track.</p>
            <input className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-1">Contains explicit content</label>
            <p className="text-sm text-[#666] mb-3">Please check this if your track contains explicit content.</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-white" />
              <span className="text-sm text-white">Explicit content</span>
              <span className="text-xs bg-[#333] text-white px-1.5 py-0.5 font-bold">E</span>
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-bold text-white">P line</label>
              <InfoIcon />
            </div>
            <p className="text-sm text-[#666] mb-2">P line notices identify the owner of rights in the original sound recording.</p>
            <input className={inputClass} />
          </div>
        </div>
      </Accordion>

      <Accordion
        icon={
          <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
            <rect width="36" height="22" rx="11" fill="#333" />
            <circle cx="11" cy="11" r="8" fill="white" />
          </svg>
        }
        title="Permissions"
        subtitle="Control the visibility of engagements on your track, direct downloads, and more."
      >
        <div>
          <p className="text-sm font-bold text-white mb-4">Access settings</p>
          {(
            [
              { key: "downloads" as const, label: "Enable direct downloads", desc: "Allow listeners to download the original audio file." },
              { key: "offline" as const, label: "Offline listening", desc: "Offline listening allows this track to be played on devices without an internet connection." },
              { key: "rss" as const, label: "Include in RSS feed", desc: 'Choose whether you want this track to show up in the "Feed" tab for easy discoverability.' },
              { key: "embed" as const, label: "Display embed code", desc: "Choose whether you want this track's embedded-player code to be displayed publicly." },
              { key: "appPlayback" as const, label: "Enable app playback", desc: "Choose whether you want this track to be playable outside of SoundCloud and its apps." },
            ]
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between py-4 border-b border-[#1e1e1e]">
              <div className="pr-8">
                <p className="text-sm text-white">{label}</p>
                <p className="text-sm text-[#666] mt-0.5">{desc}</p>
              </div>
              <Toggle enabled={toggles[key]} onChange={(v) => setToggle(key, v)} />
            </div>
          ))}

          <p className="text-sm font-bold text-white mt-6 mb-4">Engagement privacy</p>
          {(
            [
              { key: "comments" as const, label: "Allow people to comment on your track" },
              { key: "showComments" as const, label: "Show track comments to public" },
              { key: "insights" as const, label: "Show track insights to public" },
            ]
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-4 border-b border-[#1e1e1e]">
              <p className="text-sm text-white">{label}</p>
              <div className="flex items-center gap-2">
                <LockIcon />
                <Toggle enabled={toggles[key]} onChange={(v) => setToggle(key, v)} />
              </div>
            </div>
          ))}

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon />
              <p className="text-sm font-bold text-white">Geoblocking</p>
            </div>
            <p className="text-sm text-[#666] mb-4">Customize what countries your track will be available in.</p>
            <div className="space-y-3">
              {(["Worldwide", "Exclusive regions", "Blocked regions"] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="edit-geo" defaultChecked={opt === "Worldwide"} className="w-4 h-4 accent-white" />
                  <span className="text-sm text-[#888]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion
        icon={
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" />
            <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
            <path d="M19.07,4.93a10,10,0,0,1,0,14.14" />
          </svg>
        }
        title="Audio clip"
        subtitle="Pick the 20 second clip you'd like to use as your track preview. This will live on your feed and socials."
      >
        <div className="relative w-full h-20 bg-[#161616] border border-[#2a2a2a] flex items-center justify-center overflow-hidden rounded">
          <p className="relative z-10 text-xs font-semibold text-white text-center px-4">
            Can't set audio preview, because this track is shorter than preview time.
          </p>
        </div>
      </Accordion>

      <Accordion
        icon={
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <text x="12" y="16" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="bold" stroke="none">CC</text>
          </svg>
        }
        title="Licensing"
        subtitle="Enable Creative Commons licenses options."
      >
        <div className="space-y-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="edit-license" checked={license === "all"} onChange={() => setLicense("all")} className="mt-1 w-4 h-4 accent-white flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">All rights reserved</p>
              <p className="text-sm text-[#666] mt-1">By choosing All Rights Reserved, you ask that other creators not use your material.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="edit-license" checked={license === "cc"} onChange={() => setLicense("cc")} className="mt-1 w-4 h-4 accent-white flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Creative Commons</p>
              <p className="text-sm text-[#666] mt-1">With Creative Commons licenses, creators have the choice to give up certain exclusive rights normally associated with copyright, while retaining others.</p>
            </div>
          </label>
        </div>
      </Accordion>

      <div className="border-t border-[#2a2a2a] mb-4" />
    </div>
  );

  const ArtistStorefrontTab = (
    <div className="px-6 py-6 overflow-y-auto flex-1">
      <div className="border border-dashed border-[#333] rounded-lg p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={storefrontImg}
              alt="storefront"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base tracking-tighter">Showcase your products</p>
          <p className="text-[#888] text-sm mt-1">Link merch, event tickets, music and more to your track page</p>
        </div>
        <button className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#eee] transition flex-shrink-0">
          Get Artist Pro
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-[540px] bg-[#0e0e0e] z-50 flex flex-col shadow-2xl border-l border-[#1a1a1a]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-[#aaa] hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
            <span className="text-white font-bold text-base">Edit Track</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-sm text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] px-3 py-1.5 rounded-full transition">
              <Download className="w-3.5 h-3.5" />
              Download file
            </button>
            <button className="flex items-center gap-2 text-sm text-[#666] bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-full cursor-not-allowed opacity-60">
              <RefreshCw className="w-3.5 h-3.5" />
              Replace file
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#1a1a1a] px-6 flex-shrink-0">
          {(
            [
              { key: "details", label: "Track details" },
              { key: "advanced", label: "Advanced settings" },
              { key: "storefront", label: "Artist Storefront" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-sm py-3 mr-6 border-b-2 transition-colors ${
                activeTab === key
                  ? "border-white text-white font-semibold"
                  : "border-transparent text-[#666] hover:text-[#aaa]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" && TrackDetailsTab}
          {activeTab === "advanced" && AdvancedSettingsTab}
          {activeTab === "storefront" && ArtistStorefrontTab}
        </div>

        <div className="border-t border-[#1a1a1a] px-6 py-4 flex justify-end flex-shrink-0 bg-[#0e0e0e]">
          <button
            onClick={handleSave}
            className="bg-[#333] hover:bg-[#444] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition"
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  );
}
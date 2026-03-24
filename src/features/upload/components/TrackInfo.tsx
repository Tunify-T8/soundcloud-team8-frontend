import { useState, useRef, useEffect } from "react";
import axios from "axios";
import type { ToggleProps } from "../types";
import type { TogglesState } from "../types";
import { clearAudioSource } from "../../../store/AudioSourceSlice";
import UploadSuccessScreen from "./UploadSuccessScreen";
import { api } from "@/features/auth/services/api";
import { SiSoundcloud } from "react-icons/si";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../app/hooks";
import { profileService } from "@/features/profile/profileService";

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      className={`relative cursor-pointer flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-[#169b45]" : "bg-[#333]"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${enabled ? "left-5" : "left-0.5"}`} />
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="ml-1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="#aaa" strokeWidth="2"
      className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6,9 12,15 18,9" />
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

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = Math.floor(secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const inputClass =
  "w-full bg-[#181818] border border-[#333] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#555] placeholder-[#555]";

const GENRE_MAP: Record<string, string> = {
  "Hip-Hop":    "music_hiphop",
  "Pop":        "music_pop",
  "Rock":       "music_rock",
  "Electronic": "music_electronic",
  "Jazz":       "music_jazz",
  "Classical":  "music_classical",
  "R&B":        "music_rnb",
  "Country":    "music_country",
  "Metal":      "music_metal",
  "Folk":       "music_folk",
  "Reggae":     "music_reggae",
  "Blues":      "music_blues",
  "Soul":       "music_soul",
  "Latin":      "music_latin",
  "Dance":      "music_dance",
  "House":      "music_house",
  "Techno":     "music_techno",
};

const DEFAULT_GENRES = Object.keys(GENRE_MAP);

// ─── Genre Input Component ────────────────────────────────────────────────────

function GenreInput({ genreRef }: { genreRef: React.RefObject<HTMLInputElement | null> }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? DEFAULT_GENRES.filter((g) => g.toLowerCase().includes(query.toLowerCase()))
    : DEFAULT_GENRES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (genre: string) => {
    setSelected(genre);
    setQuery(genre);
    setOpen(false);
    if (genreRef.current) genreRef.current.value = genre;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected("");
    setOpen(true);
    if (genreRef.current) genreRef.current.value = val;
  };

  const handleClear = () => {
    setQuery("");
    setSelected("");
    setOpen(false);
    if (genreRef.current) genreRef.current.value = "";
  };

  return (
    <div ref={containerRef} className="relative">
      <input ref={genreRef} type="hidden" />
      <div className="flex items-center border-b border-[#2a2a2a] pb-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            placeholder="Add or search for genre"
            className="w-full bg-transparent text-white text-sm py-1 focus:outline-none placeholder-[#555] pr-8"
            aria-label="genre"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" className="flex-shrink-0 ml-2">
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-[#1a1a1a] border border-[#333] max-h-52 overflow-y-auto shadow-xl">
          {filtered.length > 0 ? (
            filtered.map((genre) => (
              <div
                key={genre}
                onMouseDown={() => handleSelect(genre)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition flex items-center justify-between
                  ${selected === genre ? "bg-[#169b45] text-white" : "text-[#ccc] hover:bg-[#252525] hover:text-white"}`}
              >
                {genre}
                {selected === genre && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
            ))
          ) : (
            <div
              onMouseDown={() => handleSelect(query)}
              className="px-4 py-2.5 text-sm text-[#aaa] hover:bg-[#252525] hover:text-white cursor-pointer transition"
            >
              Use "{query}" as custom genre
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type UserProfile = {
  id: string
  username: string
  email: string
  avatarUrl: string
  isCertified: boolean
}

export default function TrackInfoPage({ onBack }: { onBack?: () => void }) {
  const dispatch = useDispatch();
  const source = useAppSelector((s) => s.audioSource.source);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileReady, setFileReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trackSlug, setTrackSlug] = useState("");

  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const artworkBase64Ref = useRef<string | null>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [audioClipOpen, setAudioClipOpen] = useState(false);
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [license, setLicense] = useState<"all" | "cc">("all");
  const [toggles, setToggles] = useState<TogglesState>({
    downloads: false,
    offline: true,
    rss: true,
    embed: true,
    appPlayback: true,
    comments: true,
    showComments: true,
    insights: true,
  });

  const [geoMode, setGeoMode] = useState<"worldwide" | "exclusive" | "blocked">("worldwide");
  const [regions] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);

  const titleRef       = useRef<HTMLInputElement>(null);
  const genreRef       = useRef<HTMLInputElement>(null);
  const tagsRef        = useRef<HTMLInputElement>(null);
  const artistsRef     = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const privacyRef     = useRef<string>("public");

  // ── Fetch user profile ────────────────────────────────────────────────────
useEffect(() => {
  profileService.getMeProfile()
    .then((user) => setUserProfile({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl!,
      isCertified: user.isCertified,
    }))
    .catch((err) => console.error("Failed to fetch user profile:", err));
}, []);




  // ── Fetch audio blob using raw axios (NOT api) — blob: URLs are local ────
  useEffect(() => {
    if (!source?.url) return;
    let cancelled = false;

    const fetchBlob = async () => {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const blob = await axios.get(source.url, {
          responseType: "blob",
          onDownloadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        }).then(r => r.data);

        if (cancelled) return;
        audioBlobRef.current = blob;
        setUploadProgress(100);
        setFileReady(true);
      } catch (err) {
        console.error("Failed to fetch audio blob:", err);
        if (!cancelled) { audioBlobRef.current = null; setUploadProgress(100); setFileReady(true); }
      } finally {
        if (!cancelled) setIsUploading(false);
      }
    };

    fetchBlob();
    return () => { cancelled = true };
  }, [source?.url]);

  // ── Derived values ────────────────────────────────────────────────────────
  const fileName = source?.kind === "file"
    ? source.name
    : source?.kind === "recorded"
    ? "recording.wav"
    : "Unknown"

  const fileMeta = source
    ? source.kind === "file"
      ? `${fmtBytes(source.size)} · ${source.mimeType || "audio"}`
      : `${fmtBytes(source.size)} · ${fmtDuration(source.duration)} · WAV`
    : ""

  const defaultTitle = fileName.replace(/\.[^/.]+$/, "")

  const setToggle = (key: keyof TogglesState, val: boolean) =>
    setToggles((t) => ({ ...t, [key]: val }));

  const accessSettings: { key: keyof TogglesState; label: string; desc: string }[] = [
    { key: "downloads", label: "Enable direct downloads", desc: "Allow listeners to download the original audio file." },
    { key: "offline", label: "Offline listening", desc: "Offline listening allows this track to be played on devices without an internet connection." },
    { key: "rss", label: "Include in RSS feed", desc: 'Choose whether you want this track to show up in the "Feed" tab for easy discoverability.' },
    { key: "embed", label: "Display embed code", desc: "Choose whether you want this track's embedded-player code to be displayed publicly." },
    { key: "appPlayback", label: "Enable app playback", desc: "Choose whether you want this track to be playable outside of SoundCloud and its apps." },
  ];

  const engagementSettings: { key: keyof TogglesState; label: string }[] = [
    { key: "comments", label: "Allow people to comment on your track" },
    { key: "showComments", label: "Show track comments to public" },
    { key: "insights", label: "Show track insights to public" },
  ];

  const waveformBars = Array.from({ length: 120 }, (_, i) =>
    10 + Math.abs(Math.sin(i * 0.4) * 28 + Math.sin(i * 0.13) * 18)
  );

  const handleArtworkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_DIM = 400;
      const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      setArtworkPreview(compressed);
      artworkBase64Ref.current = compressed;
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleUpload = async () => {
    if (!fileReady || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const rawGenre = genreRef.current?.value ?? "";

      const { data: track } = await api.post("/tracks", {
        title:               titleRef.current?.value || "Untitled",
        tags:                tagsRef.current?.value ? [tagsRef.current.value] : [],
        description:         descriptionRef.current?.value || "",
        privacy:             privacyRef.current,
        availability:        { type: geoMode, regions },
        genre:               GENRE_MAP[rawGenre] ?? rawGenre,
        scheduledReleaseDate: null,
        artists:             artistsRef.current?.value
                               ? artistsRef.current.value.split(",").map(a => a.trim())
                               : [],
        contentWarning,
      });

      const { id } = track;
      console.log("Track created:", track);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (audioBlobRef.current) {
        const mimeType = audioBlobRef.current.type || "audio/wav";
        const ext = mimeType.split("/")[1] ?? "wav";
        const audioFileName = source?.kind === "file" ? (source.name ?? `audio.${ext}`) : `recording.${ext}`;
        const audioForm = new FormData();
        audioForm.append("file", audioBlobRef.current, audioFileName);
        await api.post(`/tracks/${id}/audio`, audioForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (artworkBase64Ref.current) {
        const artworkBlob = await fetch(artworkBase64Ref.current).then(r => r.blob());
        const artworkForm = new FormData();
        artworkForm.append("artwork", artworkBlob, "artwork.jpg");
        await api.patch(`/tracks/${id}`, artworkForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setUploadDone(true);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadDone(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (uploadDone) return <UploadSuccessScreen />;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a1a]">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <SiSoundcloud size={32} color="white" />
          <span className="font-semibold text-base">Track info</span>
        </a>

        <div className="flex items-center gap-5">
          {isUploading && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-sm text-[#aaa]">
                  <span className="max-w-[200px] truncate">{fileName}</span>
                  <span className="text-white font-semibold">Uploading {uploadProgress}%</span>
                </div>
                <div className="w-48 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#169b45] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {!isUploading && uploadProgress === 100 && (
            <div className="flex items-center gap-3 text-sm text-[#aaa]">
              <button className="text-[#aaa] hover:text-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
              </button>
              <span className="max-w-[200px] truncate">{fileName}</span>
              <button className="text-white text-sm font-semibold hover:text-[#aaa] transition">Replace track</button>
            </div>
          )}

          {!isUploading && uploadProgress < 100 && (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-sm text-[#aaa]">
                {source?.kind === "recorded" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                  </svg>
                )}
                <span className="max-w-[220px] truncate">{fileName}</span>
                {fileMeta && <span className="text-[#555] text-xs">{fileMeta}</span>}
              </div>
              <button className="text-white text-sm font-semibold hover:text-[#aaa] transition">Replace track</button>
            </div>
          )}

          <button
            onClick={() => onBack ? onBack() : dispatch(clearAudioSource())}
            className="text-[#aaa] hover:text-white transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-10 py-8 pb-28">
        <div className="grid grid-cols-2 gap-20 mb-8">

          {/* LEFT */}
          <div>
            {source?.url && (
              <div className="mb-4">
                <p className="text-xs text-[#555] mb-2 uppercase tracking-wider">Preview</p>
                <audio controls src={source.url} className="w-full max-w-[380px] h-10" style={{ colorScheme: "dark" }} />
              </div>
            )}
            <input ref={artworkInputRef} type="file" accept="image/*" className="hidden" onChange={handleArtworkSelect} />
            <div
              onClick={() => artworkInputRef.current?.click()}
              className="w-full aspect-square border border-dashed border-[#444] flex flex-col items-center justify-center text-[#888] hover:border-[#666] transition cursor-pointer max-w-[380px] overflow-hidden relative group"
            >
              {artworkPreview ? (
                <>
                  <img src={artworkPreview} alt="Artwork" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p className="text-white text-sm font-semibold">Change artwork</p>
                  </div>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                  <p className="mt-3 text-sm text-[#999]">Add new artwork</p>
                  <p className="text-xs text-[#555] mt-1">Click to upload an image</p>
                </>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div>

            {/* Track Title */}
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm font-bold text-white">Track title</label>
                <span className="text-white text-sm">*</span>
                <InfoIcon />
              </div>
              <input
                type="text"
                ref={titleRef}
                defaultValue={defaultTitle}
                onChange={(e) => setTrackSlug(slugify(e.target.value))}
                className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
              />
            </div>

            {/* Track Link — auto-generated from title + user profile */}
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <label className="text-sm font-bold text-white block mb-1">Track link</label>
              {userProfile ? (
                <div className="flex items-center gap-1 text-sm py-1">
                  <span className="text-[#555] select-none">
                    https://tunify.duckdns.org/{userProfile.username}-{userProfile.id}/
                  </span>
                  <input
                    type="text"
                    value={trackSlug || slugify(defaultTitle)}
                    onChange={(e) => setTrackSlug(e.target.value)}
                    className="bg-transparent text-white focus:outline-none flex-1 min-w-0"
                  />
                </div>
              ) : (
                <div className="text-[#555] text-sm py-1 animate-pulse">Loading...</div>
              )}
            </div>

            {/* Main Artist — auto-filled from /users/me */}
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm font-bold text-white">Main Artist(s)</label>
                <InfoIcon />
              </div>
              <input
                type="text"
                ref={artistsRef}
                defaultValue={userProfile?.username ?? ""}
                key={userProfile?.username}
                placeholder={userProfile ? "" : "Loading..."}
                className="w-full bg-transparent text-white text-sm py-1 focus:outline-none placeholder-[#555]"
              />
              <p className="text-xs text-[#555] mt-1">Tip: Use commas to add multiple artist names.</p>
            </div>

            {/* Genre */}
            <div>
              <label className="text-sm font-bold text-white block mb-1">Genre</label>
              <GenreInput genreRef={genreRef} />
            </div>

            {/* Tags */}
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm font-bold text-white">Tags</label>
                <InfoIcon />
              </div>
              <input
                ref={tagsRef}
                placeholder="Add styles, moods, tempo."
                className="w-full bg-transparent text-[#555] text-sm py-1 focus:outline-none placeholder-[#555]"
              />
            </div>

            {/* Description */}
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <label className="text-sm font-bold text-white block mb-1">Description</label>
              <textarea
                ref={descriptionRef}
                rows={3}
                placeholder="Tracks with descriptions tend to get more plays and engagements."
                className="w-full bg-transparent text-[#555] text-sm py-1 resize-none focus:outline-none placeholder-[#555]"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="text-sm font-bold text-white block mb-3">Track Privacy</label>
              <div className="flex gap-6 text-sm text-white">
                {(["Public", "Private", "Schedule"] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      defaultChecked={opt === "Public"}
                      onChange={() => { privacyRef.current = opt.toLowerCase() }}
                      className="accent-white w-4 h-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Details */}
        <div className="border-t border-[#2a2a2a]">
          <button onClick={() => setAdvancedOpen(!advancedOpen)} className="flex items-center justify-between w-full text-left py-5">
            <div>
              <p className="text-sm font-bold text-white">Advanced details</p>
              <p className="text-sm text-[#666] mt-0.5">Buy link, record label, release date, publisher...</p>
            </div>
            <ChevronDown open={advancedOpen} />
          </button>
          {advancedOpen && (
            <div className="pb-8 space-y-6">
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
                <input type="date" className="w-48 bg-[#181818] border border-[#333] text-[#888] text-sm px-4 py-2.5 focus:outline-none focus:border-[#555]" />
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
                  <input type="checkbox" className="w-4 h-4 accent-white" onChange={e => setContentWarning(e.target.checked)} />
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
          )}
        </div>

        {/* Permissions */}
        <div className="border-t border-[#2a2a2a]">
          <button onClick={() => setPermissionsOpen(!permissionsOpen)} className="flex items-center justify-between w-full text-left py-5">
            <div className="flex items-center gap-4">
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <rect width="36" height="22" rx="11" fill="#333" />
                <circle cx="11" cy="11" r="8" fill="white" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white">Permissions</p>
                <p className="text-sm text-[#666] mt-0.5">Control the visibility of engagements on your track, direct downloads, and more.</p>
              </div>
            </div>
            <ChevronDown open={permissionsOpen} />
          </button>
          {permissionsOpen && (
            <div className="pb-8">
              <p className="text-sm font-bold text-white mb-4">Access settings</p>
              <div>
                {accessSettings.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between py-4 border-b border-[#1e1e1e]">
                    <div className="pr-8">
                      <p className="text-sm text-white">{label}</p>
                      <p className="text-sm text-[#666] mt-0.5">{desc}</p>
                    </div>
                    <Toggle enabled={toggles[key]} onChange={(v) => setToggle(key, v)} />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-white mt-6 mb-4">Engagement privacy</p>
              <div>
                {engagementSettings.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-[#1e1e1e]">
                    <p className="text-sm text-white">{label}</p>
                    <div className="flex items-center gap-2">
                      <LockIcon />
                      <Toggle enabled={toggles[key]} onChange={(v) => setToggle(key, v)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-1">
                  <LockIcon />
                  <p className="text-sm font-bold text-white">Geoblocking</p>
                </div>
                <p className="text-sm text-[#666] mb-4">Customize what countries your track will be available in.</p>
                <div className="space-y-3">
                  {(["Worldwide", "Exclusive regions", "Blocked regions"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="geo"
                        defaultChecked={opt === "Worldwide"}
                        className="w-4 h-4 accent-white"
                        onChange={() => setGeoMode(opt === "Worldwide" ? "worldwide" : opt === "Exclusive regions" ? "exclusive" : "blocked")}
                      />
                      <span className="text-sm text-[#888]">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Clip */}
        <div className="border-t border-[#2a2a2a]">
          <button onClick={() => setAudioClipOpen(!audioClipOpen)} className="flex items-center justify-between w-full text-left py-5">
            <div className="flex items-center gap-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" />
                <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
                <path d="M19.07,4.93a10,10,0,0,1,0,14.14" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white">Audio clip</p>
                <p className="text-sm text-[#666] mt-0.5">Pick the 20 second clip you'd like to use as your track preview.</p>
              </div>
            </div>
            <ChevronDown open={audioClipOpen} />
          </button>
          {audioClipOpen && (
            <div className="pb-8">
              <div className="relative w-full h-24 bg-[#161616] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center px-4 gap-px opacity-40">
                  {waveformBars.map((h, i) => (
                    <div key={i} className="flex-shrink-0 bg-[#aaa] rounded-sm" style={{ width: 3, height: h }} />
                  ))}
                </div>
                <p className="relative z-10 text-sm font-semibold text-white text-center px-4">
                  Can't set audio preview, because this track is shorter than preview time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Licensing */}
        <div className="border-t border-[#2a2a2a]">
          <button onClick={() => setLicensingOpen(!licensingOpen)} className="flex items-center justify-between w-full text-left py-5">
            <div className="flex items-center gap-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.5 9.5 C9.5 7.5 14.5 7.5 14.5 10 C14.5 12.5 9.5 12 9.5 14.5 C9.5 16.5 14.5 16.5 14.5 14.5" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white">Licensing</p>
                <p className="text-sm text-[#666] mt-0.5">Enable Creative Commons licenses options.</p>
              </div>
            </div>
            <ChevronDown open={licensingOpen} />
          </button>
          {licensingOpen && (
            <div className="pb-8 space-y-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="license" checked={license === "all"} onChange={() => setLicense("all")} className="mt-1 w-4 h-4 accent-white flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">All rights reserved</p>
                  <p className="text-sm text-[#666] mt-1">By choosing All Rights Reserved, you ask that other creators not use your material.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="license" checked={license === "cc"} onChange={() => setLicense("cc")} className="mt-1 w-4 h-4 accent-white flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Creative Commons</p>
                  <p className="text-sm text-[#666] mt-1">With Creative Commons licenses, creators have the choice to give up certain exclusive rights normally associated with copyright, while retaining others.</p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-[#2a2a2a]" />
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1a1a1a] bg-[#0e0e0e] px-10 py-3 flex items-center">
        <p className="text-xs text-[#555] flex-1 text-center">
          By uploading, you confirm that your sounds comply with our{" "}
          <span className="underline cursor-pointer hover:text-[#888] transition">Terms of Use</span>{" "}
          and you don't infringe anyone else's rights.
        </p>
        <button
          onClick={handleUpload}
          disabled={!fileReady || isSubmitting}
          className="bg-[#169b45] hover:bg-[#1db954] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-semibold text-sm transition flex items-center gap-2"
        >
          {(!fileReady || isSubmitting) && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {!fileReady ? "Uploading…" : isSubmitting ? "Saving…" : "Upload"}
        </button>
      </div>
    </div>
  );
}
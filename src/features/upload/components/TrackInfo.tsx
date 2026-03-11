import { useState } from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

interface TogglesState {
  downloads: boolean;
  offline: boolean;
  rss: boolean;
  embed: boolean;
  appPlayback: boolean;
  comments: boolean;
  showComments: boolean;
  insights: boolean;
}

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

const inputClass =
  "w-full bg-[#181818] border border-[#333] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#555] placeholder-[#555]";

export default function TrackInfoPage() {
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [permissionsOpen, setPermissionsOpen] = useState<boolean>(false);
  const [audioClipOpen, setAudioClipOpen] = useState<boolean>(false);
  const [licensingOpen, setLicensingOpen] = useState<boolean>(false);
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

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <svg width="34" height="16" viewBox="0 0 34 16" fill="white">
            <ellipse cx="2" cy="12" rx="2" ry="4" />
            <ellipse cx="7" cy="10" rx="2" ry="6" />
            <ellipse cx="12" cy="8" rx="2" ry="8" />
            <ellipse cx="17" cy="6" rx="2" ry="10" />
            <ellipse cx="22" cy="8" rx="2" ry="8" />
            <ellipse cx="27" cy="10" rx="2" ry="6" />
            <ellipse cx="32" cy="12" rx="2" ry="4" />
          </svg>
          <span className="font-semibold text-base">Track info</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm text-[#aaa]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
            </svg>
            <span>file_example_WAV_1MG.wav</span>
          </div>
          <button className="text-white text-sm font-semibold hover:text-[#aaa] transition">
            Replace track
          </button>
          <button className="text-[#aaa] hover:text-white transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-10 py-8 pb-28">

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-20 mb-8">

          {/* LEFT: Artwork */}
          <div>
            <div className="w-full aspect-square border border-dashed border-[#444] flex flex-col items-center justify-center text-[#888] hover:border-[#666] transition cursor-pointer max-w-[380px]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              <p className="mt-3 text-sm text-[#999]">Add new artwork</p>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div>
            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm font-bold text-white">Track title</label>
                <span className="text-white text-sm">*</span>
                <InfoIcon />
              </div>
              <input
                type="text"
                defaultValue="file_example_WAV_1MG"
                className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
              />
            </div>

            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <label className="text-sm font-bold text-white block mb-1">Track link</label>
              <input
                type="text"
                defaultValue="https://soundcloud.com/amgad-mohamed-376620236/"
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
                defaultValue="amgad mohamed"
                className="w-full bg-transparent text-white text-sm py-1 focus:outline-none"
              />
              <p className="text-xs text-[#555] mt-1">Tip: Use commas to add multiple artist names.</p>
            </div>

            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <label className="text-sm font-bold text-white block mb-1">Genre</label>
              <div className="flex items-center">
                <input
                  placeholder="Add or search for genre"
                  className="w-full bg-transparent text-[#555] text-sm py-1 focus:outline-none placeholder-[#555]"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>
            </div>

            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm font-bold text-white">Tags</label>
                <InfoIcon />
              </div>
              <input
                placeholder="Add styles, moods, tempo."
                className="w-full bg-transparent text-[#555] text-sm py-1 focus:outline-none placeholder-[#555]"
              />
            </div>

            <div className="border-b border-[#2a2a2a] pb-3 mb-4">
              <label className="text-sm font-bold text-white block mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Tracks with descriptions tend to get more plays and engagements."
                className="w-full bg-transparent text-[#555] text-sm py-1 resize-none focus:outline-none placeholder-[#555]"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-white block mb-3">Track Privacy</label>
              <div className="flex gap-6 text-sm text-white">
                {(["Public", "Private", "Schedule"] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      defaultChecked={opt === "Public"}
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
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center justify-between w-full text-left py-5"
          >
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
                <input
                  placeholder="Add a link to let your fans purchase the track from another site."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white block mb-2">Record label</label>
                <input
                  placeholder="If your track is released under a specific record label, you can add that here."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white block mb-1">Release date</label>
                <p className="text-sm text-[#666] mb-2">
                  If your track has a specific release date, you can add that here.
                </p>
                <input
                  type="date"
                  className="w-48 bg-[#181818] border border-[#333] text-[#888] text-sm px-4 py-2.5 focus:outline-none focus:border-[#555]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white block mb-1">Publisher</label>
                <p className="text-sm text-[#666] mb-2">
                  If you have a publisher, you can add that here. A music publisher is a person or organization
                  that helps songwriters promote and monetize their songs and ensure that they are properly
                  compensated when their songs are used.
                </p>
                <input className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-bold text-white block mb-1">ISRC</label>
                <p className="text-sm text-[#666] mb-2">
                  An ISRC (International Standard Recording Code) is a unique identifier that is assigned to a
                  track. Use the same ISRC for a given track wherever you distribute it. If you work with a
                  record label or distributor, ask them if they already have ISRCs for your tracks.
                </p>
                <input className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-bold text-white block mb-1">Contains explicit content</label>
                <p className="text-sm text-[#666] mb-3">
                  Please check this if your track contains explicit content. The badge will be displayed next
                  to your track title.
                </p>
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
                <p className="text-sm text-[#666] mb-2">
                  P line notice identify the owner of the rights in the original sound recording (the masters)
                  at the time that the CD/carrier/file is manufactured.
                </p>
                <input className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="border-t border-[#2a2a2a]">
          <button
            onClick={() => setPermissionsOpen(!permissionsOpen)}
            className="flex items-center justify-between w-full text-left py-5"
          >
            <div className="flex items-center gap-4">
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <rect width="36" height="22" rx="11" fill="#333" />
                <circle cx="11" cy="11" r="8" fill="white" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white">Permissions</p>
                <p className="text-sm text-[#666] mt-0.5">
                  Control the visibility of engagements on your track, direct downloads, and more.
                </p>
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
                <p className="text-sm text-[#666] mb-4">
                  Customize what countries your track will be available in.
                </p>
                <div className="space-y-3">
                  {(["Worldwide", "Exclusive regions", "Blocked regions"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="geo"
                        defaultChecked={opt === "Worldwide"}
                        className="w-4 h-4 accent-white"
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
          <button
            onClick={() => setAudioClipOpen(!audioClipOpen)}
            className="flex items-center justify-between w-full text-left py-5"
          >
            <div className="flex items-center gap-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" />
                <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
                <path d="M19.07,4.93a10,10,0,0,1,0,14.14" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white">Audio clip</p>
                <p className="text-sm text-[#666] mt-0.5">
                  Pick the 20 second clip you'd like to use as your track preview. This will live on your feed and socials.
                </p>
              </div>
            </div>
            <ChevronDown open={audioClipOpen} />
          </button>

          {audioClipOpen && (
            <div className="pb-8">
              <div className="relative w-full h-24 bg-[#161616] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center px-4 gap-px opacity-40">
                  {waveformBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 bg-[#aaa] rounded-sm"
                      style={{ width: 3, height: h }}
                    />
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
          <button
            onClick={() => setLicensingOpen(!licensingOpen)}
            className="flex items-center justify-between w-full text-left py-5"
          >
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
                <input
                  type="radio"
                  name="license"
                  checked={license === "all"}
                  onChange={() => setLicense("all")}
                  className="mt-1 w-4 h-4 accent-white flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-white">All rights reserved</p>
                  <p className="text-sm text-[#666] mt-1">
                    By choosing All Rights Reserved, you ask that other creators not use your material.
                    Copyright is automatically granted to you when you begin creating your work.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="license"
                  checked={license === "cc"}
                  onChange={() => setLicense("cc")}
                  className="mt-1 w-4 h-4 accent-white flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-white">Creative Commons</p>
                  <p className="text-sm text-[#666] mt-1">
                    With Creative Commons licenses, creators have the choice to give up certain exclusive
                    rights normally associated with copyright, while retaining others. There are six different
                    licenses that provide users with different levels of freedom.
                  </p>
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
        <button className="bg-[#169b45] hover:bg-[#1db954] text-white px-8 py-2.5 rounded-full font-semibold text-sm transition">
          Upload
        </button>
      </div>
    </div>
  );
}
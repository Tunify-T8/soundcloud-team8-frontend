import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { SiSoundcloud } from "react-icons/si";
import { useAppSelector } from "../../../app/hooks";
import { setAudioSource } from "../../../store/AudioSourceSlice";
import { api } from "@/features/auth/services/api";
import ArtistModal from "@/features/premium/components/ArtistModal";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import UploadQuotaBanner from "../components/UploadQuotaBanner";
import Recorder from "../components/Recorder";
import TrackInfoPage from "../components/TrackInfo";
import uploadImg from "@/assets/upload.png";

type UploadQuota = {
  tier: string;
  uploadMinutesLimit: number | null;
  uploadMinutesUsed: number;
  uploadMinutesRemaining: number | null;
  canReplaceFiles: boolean;
  canScheduleRelease: boolean;
  canAccessAdvancedTab: boolean;
};

function UploadLimitScreen({
  quota,
}: {
  quota: UploadQuota;
}) {
  const used = quota.uploadMinutesUsed;
  const limit = quota.uploadMinutesLimit ?? 180;

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <Link to="/">
            <SiSoundcloud size={36} color="white" />
          </Link>
          <span className="text-[15px] font-semibold">Upload</span>
        </div>
        <Link to="/artists">
          <button className="text-[#888] hover:text-white transition">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Link>
      </header>

      <div className="bg-[hsl(0,0%,11%)] border-b border-[hsl(0,0%,18%)] flex items-center justify-between px-8 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
          </svg>
          <span className="text-white text-sm font-medium tracking-tighter">100% of uploads used</span>
          <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
            <div className="h-full bg-[#e74c3c] rounded-full" style={{ width: "100%" }} />
          </div>
          <span className="text-white text-sm font-semibold">
            {used} of {limit} minutes
          </span>
        </div>
        <ArtistProUpgradeButton
          className="bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[hsl(0,0%,20%)] transition-colors border border-[#333]"
        >
          Get unlimited uploads
        </ArtistProUpgradeButton>
      </div>

      <main className="flex-1 flex px-8 py-12 max-w-[1100px] mx-auto w-full gap-16 items-start">
        <div className="flex-1 pt-4">
          <h1 className="text-[28px] font-bold mb-3">You've reached your upload limit.</h1>
          <p className="text-[#aaa] text-[15px] mb-8">
            Unlock unlimited uploads, monetization, distribution, and much more with Artist Pro
          </p>
          <ArtistProUpgradeButton
            className="bg-white text-black font-bold px-6 py-3 rounded-full text-[14px] hover:bg-[#eee] transition"
          >
            Unlock with Artist Pro
          </ArtistProUpgradeButton>

          <div className="mt-12">
            <p className="text-xs text-[#666] font-semibold tracking-widest uppercase mb-6">
              Artist Pro Membership Highlights
            </p>
            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ),
                  title: "Unlimited track uploads",
                  desc: "Artist Pro subscribers can upload as many private and public tracks as they want.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ),
                  title: "Unlimited Distribution",
                  desc: "Upload as much music as you want and share it with your community and collaborators.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  ),
                  title: "Replace Track",
                  desc: "Replace the audio file on your tracks anytime.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  ),
                  title: "Amplify",
                  desc: "Get up to 100 or more plays per upload.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  ),
                  title: "Advanced Fan Insights",
                  desc: "Find fans, build connections and get insights to plan promotions, releases and tours.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ),
                  title: "Spotlight Tracks",
                  desc: "Pin tracks to the top of your SoundCloud profile to feature them and drive listens.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="text-white mt-0.5 flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-xs text-[#777] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[320px] flex-shrink-0 flex items-center justify-center pt-4">
          <div className="w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 200 260" width="220" height="280" fill="none">
              <ellipse cx="100" cy="30" rx="70" ry="18" fill="#e74c3c" opacity="0.9" />
              <ellipse cx="100" cy="230" rx="70" ry="18" fill="#e74c3c" opacity="0.9" />
              <path d="M30 30 Q100 130 170 30" fill="#c0392b" opacity="0.85" />
              <path d="M30 230 Q100 130 170 230" fill="#c0392b" opacity="0.85" />
              <rect x="28" y="18" width="144" height="12" rx="6" fill="#e74c3c" />
              <rect x="28" y="230" width="144" height="12" rx="6" fill="#e74c3c" />
              {[95, 100, 105, 98, 102].map((cx, i) => (
                <circle key={i} cx={cx} cy={140 + i * 8} r="3" fill="#e67e22" opacity="0.7" />
              ))}
              <circle cx="100" cy="128" r="5" fill="#e74c3c" />
            </svg>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1e1e1e] py-6 flex justify-center flex-wrap gap-2 text-[12px] text-[#666]">
        {["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint", "About us", "Copyright", "Feedback"].map(
          (item, i) => (
            <span key={i} className="flex items-center">
              <a className="hover:text-[#aaa] px-1 cursor-pointer">{item}</a>
              {i < 7 && <span>-</span>}
            </span>
          ),
        )}
      </footer>
    </div>
  );
}

export default function SoundCloudUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showArtistModal, setShowArtistModal] = useState(false);

  const [quota, setQuota] = useState<UploadQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  const dispatch = useDispatch();
  const readyToNavigate = useAppSelector((s) => s.audioSource.readyToNavigate);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const { data } = await api.get<UploadQuota>("/users/me/upload");
        setQuota(data);
        if (
          data.uploadMinutesLimit !== null &&
          data.uploadMinutesUsed >= data.uploadMinutesLimit
        ) {
          setLimitReached(true);
        }
        } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setQuotaBlocked(true);
          setQuota({
            tier: "free",
            uploadMinutesLimit: 180,
            uploadMinutesUsed: 180,
            uploadMinutesRemaining: 0,
            canReplaceFiles: false,
            canScheduleRelease: false,
            canAccessAdvancedTab: false,
          });
          setLimitReached(false);
        } else {
          console.error("Failed to fetch upload quota:", err);
        }
      } finally {
        setQuotaLoading(false);
      }
    };
    fetchQuota();
  }, []);

  const isUnlimited = quota?.uploadMinutesLimit === null;
  const minutesLimit = quota?.uploadMinutesLimit ?? 0;
  const minutesUsed = quota?.uploadMinutesUsed ?? 0;
  const percentUsed =
    isUnlimited || minutesLimit === 0
      ? 0
      : Math.min(100, Math.round((minutesUsed / minutesLimit) * 100));
  const isOverLimit = !isUnlimited && percentUsed >= 100;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (quotaBlocked) {
        setLimitReached(true);
        return;
      }
      if (limitReached) return;
      const file = e.dataTransfer.files[0];
      if (!file) return;
      dispatch(
        setAudioSource({
          kind: "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          mimeType: file.type,
        }),
      );
    },
    [dispatch, limitReached],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (quotaBlocked) {
        setLimitReached(true);
        return;
      }
      if (limitReached) return;
      const file = e.target.files?.[0];
      if (!file) return;
      dispatch(
        setAudioSource({
          kind: "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          mimeType: file.type,
        }),
      );
    },
    [dispatch, limitReached],
  );

  if (limitReached && quota) {
    return (
      <>
        <UploadLimitScreen quota={quota} />
      </>
    );
  }

  if (readyToNavigate) {
    return <TrackInfoPage />;
  }

  return (
    <div
      className="min-h-screen bg-[#111111] text-white flex flex-col font-sans"
      data-testid="upload-page"
    >
      <header
        className="flex items-center justify-between px-8 py-4 border-b border-[#222]"
        data-testid="upload-header"
      >
        <div className="flex items-center gap-3 hover:opacity-80 transition">
          <Link to="/">
            <SiSoundcloud size={36} color="white" />
          </Link>
          <span className="text-[15px] font-semibold">Upload</span>
        </div>
        <Link to="/artists">
          <button className="text-[#888] hover:text-white transition" data-testid="upload-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Link>
      </header>

      <main className="flex-1 flex justify-center px-6 py-10">
        <div className="w-full max-w-[1100px]">
          <div data-testid="upload-quota-bar">
            <UploadQuotaBanner
              quota={quota}
              loading={quotaLoading}
              onOpenDetails={() => setShowArtistModal(true)}
              forceOverLimit={quotaBlocked}
              statusMessage={
                quotaBlocked ? "You've reached your upload limit for your plan" : undefined
              }
            />
          </div>

          <h1 className="text-[26px] font-semibold mb-2 mt-8">Upload your audio files.</h1>
          <p className="text-[13px] text-[#888] mb-8">
            For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.
            <a className="underline ml-1 hover:text-white cursor-pointer">Learn more</a>
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !limitReached && fileInputRef.current?.click()}
            data-testid="upload-dropzone"
            className={`w-full rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all mb-6 py-20 border-2 border-dashed ${
              isDragging ? "border-[#ff5500] bg-[#ff5500]/5" : "border-[#3a3a3a] hover:border-[#555]"
            }`}
            style={{
              background: isDragging ? undefined : "linear-gradient(180deg, #161616 0%, #111111 100%)",
              boxShadow: "0 15px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              data-testid="upload-file-input"
              accept="audio/*"
              multiple
              onChange={handleFileSelect}
            />

            <img src={uploadImg} alt="Upload" className="w-16 h-16 mb-4 opacity-90" />

            <p className="mt-6 text-[15px] font-semibold text-white">
              Drag and drop audio files to get started.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!limitReached) fileInputRef.current?.click();
              }}
              className="mt-4 bg-white text-black rounded-full px-6 py-2 text-[13px] font-semibold hover:bg-[#eee] transition"
              data-testid="choose-files-btn"
            >
              Choose files
            </button>
          </div>

          <Recorder micOpen={micOpen} setMicOpen={setMicOpen} />

          <footer
            className="border-t border-[#1e1e1e] py-6 flex justify-center flex-wrap gap-2 text-[12px] text-[#666]"
            data-testid="upload-footer"
          >
            {["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint", "About us", "Copyright", "Feedback"].map(
              (item, i) => (
                <span key={i} className="flex items-center">
                  <a className="hover:text-[#aaa] px-1 cursor-pointer">{item}</a>
                  {i < 7 && <span>-</span>}
                </span>
              ),
            )}
          </footer>
        </div>
      </main>
      {showArtistModal ? <ArtistModal onClose={() => setShowArtistModal(false)} /> : null}
    </div>
  );
}

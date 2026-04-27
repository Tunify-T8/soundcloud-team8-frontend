import { useState, useRef, useCallback, useEffect } from "react";
import Recorder from "../components/Recorder";
import TrackInfoPage from "../components/TrackInfo";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../app/hooks";
import { setAudioSource } from "../../../store/AudioSourceSlice";
import CheckoutModal from "@/features/premium/components/CheckoutModal";
import ArtistModal from "@/features/premium/components/ArtistModal";
import UploadLimitScreen from "../components/UploadLimitScreen";
import { api } from "@/features/auth/services/api";
import uploadImg from "@/assets/upload.png";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";

type UploadQuota = {
  tier: string;
  uploadMinutesLimit: number | null;
  uploadMinutesUsed: number;
  uploadMinutesRemaining: number | null;
  canReplaceFiles: boolean;
  canScheduleRelease: boolean;
  canAccessAdvancedTab: boolean;
};

export default function SoundCloudUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showArtistModal, setShowArtistModal] = useState(false);

  const [quota, setQuota] = useState<UploadQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

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
        console.error("Failed to fetch upload quota:", err);
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
        })
      );
    },
    [dispatch, limitReached]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
        })
      );
    },
    [dispatch, limitReached]
  );

  if (readyToNavigate) return <TrackInfoPage />;

  return (
    <div
      className="min-h-screen bg-[#111111] text-white flex flex-col font-sans"
      data-testid="upload-page"
    >
     <header className="flex items-center py-3 px-4">
      <Link to="/discover" className="flex items-center">
      <SiSoundcloud className="w-8 h-8 text-white mr-2" />
      </Link>
      <h3 className="text-lg font-semibold text-white">
        Upload
      </h3>
    </header>

      {/* QUOTA BAR — always visible at top */}
      <div
        className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] 
             flex items-center justify-center gap-6 px-6 py-3 rounded-lg"
        data-testid="upload-quota-bar"
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setShowArtistModal(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isOverLimit ? "#e74c3c" : "hsl(0,0%,60%)"}
            strokeWidth="2"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>

          {quotaLoading ? (
            <span className="text-[#555] text-sm animate-pulse">Loading…</span>
          ) : isUnlimited ? (
            <>
              <span className="text-white text-sm font-medium tracking-tighter">
                Unlimited uploads
              </span>
              <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(142,69%,36%)] rounded-full" style={{ width: "0%" }} />
              </div>
              <span className="text-white text-sm font-semibold">∞ minutes</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-3">
                {percentUsed}% of uploads used                                     
              </span>
              <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentUsed}%`,
                    backgroundColor: isOverLimit ? "#e74c3c" : "hsl(142,69%,36%)",
                  }}
                />
              </div>
              <span className="text-white text-sm font-semibold">
                {minutesUsed} of {minutesLimit} minutes
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setCheckoutOpen(true)}
          className="bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[#222] transition-colors border border-[#333]"
          data-testid="get-unlimited-btn"
        >
          Get unlimited uploads
        </button>
      </div>

      {/* MAIN CONTENT — limit screen or normal upload UI */}
      {limitReached && quota ? (
        <UploadLimitScreen quota={quota} />
      ) : (
        <main className="flex-1 flex justify-center px-6 py-6">
          <div className="w-full max-w-[1100px]">
            <h1 className="text-[26px] font-semibold mb-2 mt-4">
              Upload your audio files.
            </h1>
            <p className="text-[13px] text-[#888] mb-8">
              For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.
              <a className="underline ml-1 hover:text-white cursor-pointer">Learn more</a>
            </p>

            {/* DROPZONE */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !limitReached && fileInputRef.current?.click()}
              data-testid="upload-dropzone"
              className={`
                w-full rounded-xl flex flex-col items-center justify-center
                cursor-pointer transition-all mb-6 py-20 border-2 border-dashed
                ${isDragging ? "border-[#ff5500] bg-[#ff5500]/5" : "border-[#3a3a3a] hover:border-[#555]"}
              `}
              style={{
                background: isDragging
                  ? undefined
                  : "linear-gradient(180deg, #161616 0%, #111111 100%)",
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
                )
              )}
            </footer>
          </div>
        </main>
      )}

      {checkoutOpen && (
        <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />
      )}
      {showArtistModal && (
        <ArtistModal onClose={() => setShowArtistModal(false)} />
      )}
    </div>
  );
}
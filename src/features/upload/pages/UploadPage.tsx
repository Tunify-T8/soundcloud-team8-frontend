import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { SiSoundcloud } from "react-icons/si";
import { useAppSelector } from "../../../app/hooks";
import { setAudioSource } from "../../../store/AudioSourceSlice";
import { api } from "@/features/auth/services/api";
import ArtistModal from "@/features/premium/components/ArtistModal";
import UploadQuotaBanner, { type UploadQuota } from "../components/UploadQuotaBanner";
import UploadLimitScreen from "../components/UploadLimitScreen";
import Recorder from "../components/Recorder";
import TrackInfoPage from "../components/TrackInfo";
import uploadImg from "@/assets/upload.png";

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
            onClick={() => {
              if (quotaBlocked) {
                setLimitReached(true);
                return;
              }
              if (!limitReached) fileInputRef.current?.click();
            }}
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
                if (quotaBlocked) {
                  setLimitReached(true);
                  return;
                }
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

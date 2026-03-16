import { useState, useRef, useCallback } from "react";
import Recorder from "../components/Recorder";
import TrackInfoPage from "../components/TrackInfo";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/hooks"; // Add this import
import { setAudioSource } from "../../../store/AudioSourceSlice";
import { SiSoundcloud } from "react-icons/si";


export default function SoundCloudUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const readyToNavigate = useAppSelector((s) => s.audioSource.readyToNavigate);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    dispatch(setAudioSource({
      kind: "file",
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }));
  }, [dispatch]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(setAudioSource({
      kind: "file",
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }));
  }, [dispatch]);

  // Just use readyToNavigate directly - no useEffect needed!
  if (readyToNavigate) {
    return <TrackInfoPage />;
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">

      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#222]">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <SiSoundcloud size={36} color="white" />
          <span className="text-[15px] font-semibold">Upload</span>
        </a>
        <button className="text-[#888] hover:text-white transition">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex justify-center px-6 py-10">
        <div className="w-full max-w-[1100px]">

          {/* PROGRESS */}
          <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg px-6 py-4 flex items-center gap-4 mb-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.6)]">
            <span className="text-[13px] text-[#aaa] whitespace-nowrap">0% of uploads used</span>
            <div className="flex-1 h-[6px] bg-[#2c2c2c] rounded-full overflow-hidden">
              <div className="h-full w-0 bg-[#ff5500]" />
            </div>
            <span className="text-[13px] text-[#aaa] whitespace-nowrap">0 of 120 minutes</span>
            <button className="ml-auto border border-[#444] text-[13px] px-4 py-1.5 rounded-full hover:bg-[#2a2a2a] transition">
              Get unlimited uploads
            </button>
          </div>

          {/* TITLE */}
          <h1 className="text-[26px] font-semibold mb-2">Upload your audio files.</h1>
          <p className="text-[13px] text-[#888] mb-8">
            For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.
            <a className="underline ml-1 hover:text-white cursor-pointer">Learn more</a>
          </p>

          {/* DROPZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border border-dashed rounded-lg w-full
              flex flex-col items-center justify-center
              cursor-pointer transition-all mb-6 py-20
              shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_15px_40px_rgba(0,0,0,0.7)]
              ${isDragging ? "border-[#ff5500] bg-[#ff5500]/5" : "border-[#333] hover:border-[#444]"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="audio/*"
              multiple
              onChange={handleFileSelect}
            />
            <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="39" fill="#1e1e1e"/>
              <path
                d="M54 46C57 45 59 42.2 59 39c0-4-3.3-7.3-7.3-7.3-.5 0-1 .1-1.4.2C49 27.5 45.3 25 41 25c-5.5 0-10 4.3-10 9.6v.4C27.7 36 25 39 25 42.5c0 4 3.3 7.5 7.5 7.5H53"
                stroke="#888" strokeWidth="2"
              />
              <path d="M40 56V42" stroke="#ff5500" strokeWidth="3"/>
              <path d="M34 48l6-6 6 6" stroke="#ff5500" strokeWidth="3"/>
            </svg>
            <p className="mt-6 text-[15px] font-semibold">Drag and drop audio files to get started.</p>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-4 bg-white text-black rounded-full px-6 py-2 text-[13px] font-semibold hover:bg-[#eee]"
            >
              Choose files
            </button>
          </div>

          <Recorder micOpen={micOpen} setMicOpen={setMicOpen} />

          {/* FOOTER */}
          <footer className="border-t border-[#1e1e1e] py-6 flex justify-center flex-wrap gap-2 text-[12px] text-[#666]">
            {["Legal","Privacy","Cookie Policy","Cookie Manager","Imprint","About us","Copyright","Feedback"].map((item, i) => (
              <span key={i} className="flex items-center">
                <a className="hover:text-[#aaa] px-1 cursor-pointer">{item}</a>
                {i < 7 && <span>-</span>}
              </span>
            ))}
          </footer>
        </div>
      </main>
    </div>
  );
}
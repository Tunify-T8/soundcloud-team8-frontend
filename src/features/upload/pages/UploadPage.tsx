import { useState, useRef, useCallback } from "react";
import Recorder from "../components/Recorder";
import TrackInfoPage from "../components/TrackInfo";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../app/hooks"; 
import { setAudioSource } from "../../../store/AudioSourceSlice";
import { SiSoundcloud } from "react-icons/si";
import CheckoutModal from "@/features/premium/components/CheckoutModal";
import { Upload } from "lucide-react";
import ArtistModal from "@/features/premium/components/ArtistModal";


export default function SoundCloudUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showArtistModal, setShowArtistModal] = useState(false);

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
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans" data-testid="upload-page">

      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#222]" data-testid="upload-header">
        <div className="flex items-center gap-3 hover:opacity-80 transition">
          <a href="/">
          <SiSoundcloud size={36} color="white" />
          </a>
          <span className="text-[15px] font-semibold">Upload</span>
       </div>
        
        <a href="/artists">
        <button className="text-[#888] hover:text-white transition" data-testid="upload-close-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        </a>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex justify-center px-6 py-10">
        <div className="w-full max-w-[1100px]">

          <div className="bg-[hsl(0,0%,11%)] border-b border-[hsl(0,0%,18%)] flex items-center justify-between px-8 py-3 shrink-0" data-testid="upload-quota-bar">
               <div className="flex items-center gap-3"
                onClick={() => setShowArtistModal(true)}
               >
                 <Upload className="w-4 h-4 text-[hsl(0,0%,60%)]" />
                 <span className="text-white text-sm font-medium tracking-tighter">0% of uploads used</span>
                 <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
                   <div className="h-full bg-[hsl(0,0%,50%)] rounded-full" style={{ width: "0%" }} />
                 </div>
                 <span className="text-[hsl(0,100%,99%)] text-sm font-semibold">0 of 10 minutes</span>
               </div>
               <button 
               onClick={() => setCheckoutOpen(true)}
               className="bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[hsl(0,0%,20%)] transition-colors" data-testid="get-unlimited-btn">
                 Get unlimited uploads
               </button>
         
               {checkoutOpen && <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />}
                 
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
            data-testid="upload-dropzone"
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
              data-testid="upload-file-input"
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
              data-testid="choose-files-btn"
            >
              Choose files
            </button>
          </div>

          <Recorder micOpen={micOpen} setMicOpen={setMicOpen} />

          {/* FOOTER */}
          <footer className="border-t border-[#1e1e1e] py-6 flex justify-center flex-wrap gap-2 text-[12px] text-[#666]" data-testid="upload-footer">
            {["Legal","Privacy","Cookie Policy","Cookie Manager","Imprint","About us","Copyright","Feedback"].map((item, i) => (
              <span key={i} className="flex items-center">
                <a className="hover:text-[#aaa] px-1 cursor-pointer">{item}</a>
                {i < 7 && <span>-</span>}
              </span>
            ))}
          </footer>
        </div>
      </main>
       {checkoutOpen && <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />}
      {showArtistModal && <ArtistModal onClose={() => setShowArtistModal(false)} />}
    </div>
  );
}
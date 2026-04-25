import { SiSoundcloud } from "react-icons/si";

export default function UploadSuccessScreen() {
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans" data-testid="upload-success-page">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#222]" data-testid="success-header">
        <a href="/" className="hover:opacity-80 transition">
          <SiSoundcloud size={36} color="white" />
        </a>
        <button className="text-[#888] hover:text-white transition" data-testid="success-close-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center px-16 py-16 max-w-[800px]" data-testid="success-main">

        <div className="flex items-start gap-10 mb-20">
          {/* Icon chain */}
          <div className="flex flex-col items-center flex-shrink-0" data-testid="success-icon-chain">
            <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-[#111]">
              <SiSoundcloud size={32} color="white" />
            </div>
            <div className="w-px h-12 border-l-2 border-dashed border-[#444] my-1" />
            {/* Spotify */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#444] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="10" fill="black" stroke="none"/>
                <path d="M16.5 10.5c-2.5-1.5-6.5-1.5-8.5-.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M15.5 13c-2-1-5.5-1.2-7.5-.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                <path d="M14.5 15.5c-1.7-.8-4.5-1-6-.3" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div className="w-px h-12 border-l-2 border-dashed border-[#444] my-1" />
            {/* Apple Music */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#444] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="black"/>
                <path d="M17 8.5V15a2 2 0 0 1-1 1.73 2 2 0 1 1-2-3.46V9.5l-5 1V17a2 2 0 0 1-1 1.73 2 2 0 1 1-2-3.46V8l8-2v2.5z" fill="white"/>
              </svg>
            </div>
            <div className="w-px h-12 border-l-2 border-dashed border-[#444] my-1" />
            {/* YouTube */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#444] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="black"/>
                <path d="M20 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C14.8 5 12 5 12 5s-2.8 0-5.2.1c-.4.1-1.2.1-2 .9C4.2 6.6 4 8 4 8S3.8 9.6 3.8 11.2v1.5C3.8 14.3 4 16 4 16s.2 1.4.8 2c.8.8 1.8.8 2.2.9C8.4 19 12 19 12 19s2.8 0 5.2-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C20.2 9.6 20 8 20 8z" fill="red"/>
                <polygon points="10,8.5 10,15.5 16,12" fill="white"/>
              </svg>
            </div>
            <div className="w-px h-12 border-l-2 border-dashed border-[#444] my-1" />
            {/* Instagram */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#444] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="black"/>
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Text content */}
          <div className="pt-2">
            <h1 className="text-[36px] font-bold text-white mb-3" data-testid="success-heading">Saved to SoundCloud.</h1>
            <p className="text-[15px] text-[#aaa] mb-6">Congratulations! Your tracks are now on SoundCloud.</p>
            <button className="border border-white text-white px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-white hover:text-black transition" data-testid="view-track-btn">
              View track
            </button>

            <div className="mt-16">
              <h2 className="text-[28px] font-bold text-white mb-3" data-testid="distribute-heading">Distribute to more streaming services?</h2>
              <p className="text-[14px] text-[#aaa] mb-6">
                Easily send your SoundCloud tracks to Spotify, Apple Music, TikTok, Instagram and more with a Artist Pro subscription.{" "}
                <a className="underline cursor-pointer hover:text-white">Learn more.</a>
              </p>
              <button className="border border-white text-white px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-white hover:text-black transition" data-testid="unlock-artist-pro-btn">
                Unlock with Artist Pro
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] py-4 flex justify-center flex-wrap gap-2 text-[12px] text-[#666]" data-testid="success-footer">
        {["Legal","Privacy","Cookie Policy","Cookie Manager","Imprint","About us","Copyright","Feedback"].map((item, i) => (
          <span key={i} className="flex items-center">
            <a className="hover:text-[#aaa] px-1 cursor-pointer">{item}</a>
            {i < 7 && <span>-</span>}
          </span>
        ))}
      </footer>
    </div>
  );
}
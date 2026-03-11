import type { recorder } from "../types"


export default function Recorder({setMicOpen , micOpen}:recorder){
    return(
     <main>   
                 {/* RECORD SECTION */}
             
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_15px_40px_rgba(0,0,0,0.7)]">

            <button
              className="w-full flex items-center justify-between px-8 py-5 hover:bg-[#202020]"
              onClick={() => setMicOpen(!micOpen)}
            >

              <div className="flex items-center gap-5">

                {/* ORIGINAL MIC ICON (UNCHANGED) */}
                <div className="flex items-center gap-1.5 text-[#ccc]">

                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>

                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>

                </div>

                <div className="text-left">
                  <p className="text-[15px] font-semibold">
                    Or record with a microphone
                  </p>

                  <p className="text-[13px] text-[#888] mt-1">
                    Upload recorded voice memos, updates, news, or intros to new releases.
                  </p>
                </div>

              </div>

            </button>


            {micOpen && (
              <div className="px-8 py-6 border-t border-[#2a2a2a] bg-[#181818] flex flex-col items-center text-center gap-3">

                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2L1 21h22L12 2z"/>
                </svg>

                <p className="text-[14px] font-semibold text-amber-400">
                  No microphone found
                </p>

                <p className="text-[13px] text-[#888]">
                  Please allow microphone access in your web browser settings.
                </p>

              </div>
            )}

          </div>
      </main>
    )
    
}
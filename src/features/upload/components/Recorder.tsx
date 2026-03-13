import { useRef, useState, useEffect } from "react"

type RecorderProps = {
  setMicOpen: (open: boolean) => void
  micOpen: boolean
}

type PermissionState = "idle" | "granted" | "denied" | "requesting"

export default function Recorder({ setMicOpen, micOpen }: RecorderProps) {
  const [permission, setPermission] = useState<PermissionState>("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaStream = useRef<MediaStream | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0")
    const sec = (s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
  }

  // Called when the dropdown chevron is clicked
  const handleDropdownClick = async () => {
    // If already open and granted, just toggle closed
    if (micOpen && permission === "granted") {
      setMicOpen(false)
      return
    }

    // If we already have permission, just toggle
    if (permission === "granted") {
      setMicOpen(!micOpen)
      return
    }

    // Otherwise request permission
    setPermission("requesting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.current = stream
      setPermission("granted")
      setMicOpen(true)
    } catch {
      setPermission("denied")
      setMicOpen(true) // open panel to show denial message
    }
  }

  const startRecording = () => {
    if (!mediaStream.current) return
    chunksRef.current = []
    setAudioChunks([])
    setAudioBlob(null)
    setSeconds(0)

    const recorder = new MediaRecorder(mediaStream.current)
    mediaRecorder.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      setAudioBlob(blob)
      setAudioChunks(chunksRef.current)
    }

    recorder.start(100)
    setIsRecording(true)
    setIsPaused(false)
    startTimer()
  }

  const pauseRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.pause()
      setIsPaused(true)
      stopTimer()
    }
  }

  const resumeRecording = () => {
    if (mediaRecorder.current?.state === "paused") {
      mediaRecorder.current.resume()
      setIsPaused(false)
      startTimer()
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop()
    }
    setIsRecording(false)
    setIsPaused(false)
    stopTimer()
  }

  const discardRecording = () => {
    stopRecording()
    setSeconds(0)
    setAudioBlob(null)
    chunksRef.current = []
  }

  const undoRecording = () => {
    // Reset to start-fresh state
    discardRecording()
  }

  const confirmRecording = () => {
    if (!audioBlob) return
    // Here you would upload or pass the blob up
    // e.g. props.onRecordingComplete(audioBlob)
    console.log("Recording confirmed, blob size:", audioBlob.size)
    alert("Recording saved! (hook up onRecordingComplete prop to handle the blob)")
  }

  return (
    <main>
      {/* RECORD SECTION */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_15px_40px_rgba(0,0,0,0.7)]">

        {/* Header button */}
        <button
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-[#202020] transition-colors"
          onClick={handleDropdownClick}
        >
          <div className="flex items-center gap-5">
            {/* Mic icon + chevron */}
            <div className="flex items-center gap-1.5 text-[#ccc]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3"
                style={{ transform: micOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            <div className="text-left">
              <p className="text-[15px] font-semibold text-white">
                Or record with a microphone
              </p>
              <p className="text-[13px] text-[#888] mt-1">
                Upload recorded voice memos, updates, news, or intros to new releases.
              </p>
            </div>
          </div>

          {/* Requesting spinner */}
          {permission === "requesting" && (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
        </button>

        {/* Expanded panel */}
        {micOpen && (
          <div className="border-t border-[#2a2a2a] bg-[#181818]">

            {/* DENIED STATE */}
            {(permission === "denied" || permission === "idle") && (
              <div className="px-8 py-6 flex flex-col items-center text-center gap-3">
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

            {/* GRANTED STATE — recorder UI matching SoundCloud screenshot */}
            {permission === "granted" && (
              <div className="flex flex-col">
                
                {/* Waveform / audio preview area */}
                <div className="px-8 pt-4 pb-2 min-h-[48px] flex items-center justify-center">
                  {isRecording ? (
                    <div className="flex items-end gap-[3px] h-8">
                      {/* Animated waveform bars */}
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-[#f50]"
                          style={{
                            animation: isPaused
                              ? "none"
                              : `waveBar ${0.6 + (i % 5) * 0.15}s ease-in-out ${(i * 0.05) % 0.6}s infinite alternate`,
                            height: isPaused ? "4px" : `${6 + (i % 7) * 4}px`,
                            opacity: 0.7 + (i % 3) * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  ) : audioBlob ? (
                    /* Show audio player after recording stops */
                    <audio
                      controls
                      src={URL.createObjectURL(audioBlob)}
                      className="w-full h-8 opacity-80"
                      style={{ filter: "invert(1) hue-rotate(180deg)" }}
                    />
                  ) : (
                    <div className="w-full h-[1px] bg-[#2a2a2a]" />
                  )}
                </div>

                {/* Controls row — matches screenshot layout exactly */}
                <div className="flex items-center justify-between px-8 py-4">
                  
                  {/* Left: confirm / undo / redo / discard */}
                  <div className="flex items-center gap-4">
                    {/* Confirm (checkmark) */}
                    <button
                      onClick={confirmRecording}
                      disabled={!audioBlob}
                      className="text-[#888] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Save recording"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>

                    {/* Undo */}
                    <button
                      onClick={undoRecording}
                      disabled={!isRecording && !audioBlob}
                      className="text-[#888] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Undo / restart"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 .49-3.91"/>
                      </svg>
                    </button>

                    {/* Redo (placeholder — no-op unless you track history) */}
                    <button
                      disabled
                      className="text-[#888] opacity-20 cursor-not-allowed"
                      title="Redo"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-.49-3.91"/>
                      </svg>
                    </button>

                    {/* Delete / discard */}
                    <button
                      onClick={discardRecording}
                      disabled={!isRecording && !audioBlob}
                      className="text-[#888] hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Discard recording"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>

                  {/* Center: Start / Pause / Resume / Stop recording button */}
                  <div className="flex items-center gap-3">
                    {!isRecording && !audioBlob && (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white text-[14px] font-semibold transition-colors"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#f50] animate-pulse" />
                        Start recording
                      </button>
                    )}

                    {isRecording && !isPaused && (
                      <>
                        <button
                          onClick={pauseRecording}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white text-[14px] font-semibold transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                          </svg>
                          Pause
                        </button>
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#f50] hover:bg-[#e04a00] text-white text-[14px] font-semibold transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16"/>
                          </svg>
                          Stop
                        </button>
                      </>
                    )}

                    {isRecording && isPaused && (
                      <>
                        <button
                          onClick={resumeRecording}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white text-[14px] font-semibold transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21"/>
                          </svg>
                          Resume
                        </button>
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#f50] hover:bg-[#e04a00] text-white text-[14px] font-semibold transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16"/>
                          </svg>
                          Stop
                        </button>
                      </>
                    )}

                    {audioBlob && !isRecording && (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white text-[14px] font-semibold transition-colors"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#f50]" />
                        Record again
                      </button>
                    )}
                  </div>

                  {/* Right: timer */}
                  <div className="text-[14px] text-[#888] font-mono tabular-nums w-12 text-right">
                    {formatTime(seconds)}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waveform animation keyframes */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </main>
  )
}

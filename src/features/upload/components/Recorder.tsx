import { useRef, useState, useEffect } from "react"
import type { RecorderProps } from "../types"
import type { PermissionState } from "../types"
import { useDispatch } from "react-redux"
import { setAudioSource } from "../../../store/AudioSourceSlice"

const MAX_SECONDS = 15

export default function Recorder({ setMicOpen, micOpen }: RecorderProps) {
  const dispatch = useDispatch()
  const [permission, setPermission] = useState<PermissionState>("idle")
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "stopped">("idle")
  const [elapsed, setElapsed] = useState(0)
  const segmentStartRef = useRef<number>(0)
  const accumulatedRef  = useRef<number>(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const [finalized, setFinalized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackCurrent, setPlaybackCurrent] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)

  const [isSplicing, setIsSplicing] = useState(false)
  const [undoMs, setUndoMs] = useState(0)
  const [redoBudget, setRedoBudget] = useState(0)

  const mediaStream   = useRef<MediaStream | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef     = useRef<Blob[]>([])
  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef   = useRef<string | null>(null)
  const rafRef              = useRef<number | null>(null)
  const playbackDurationRef = useRef<number>(0)

  // Splice context — set when user undoes then resumes
  const spliceOriginalRef = useRef<Blob | null>(null)
  const spliceTrimSecRef  = useRef<number>(0)
  const hasSpliceRef      = useRef<boolean>(false)

  // Always-current committed blob (ref = never stale unlike React state)
  const latestBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    return () => {
      clearTimerOnly()
      mediaStream.current?.getTracks().forEach(t => t.stop())
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (recordingState === "recording" && elapsed >= MAX_SECONDS * 1000) stopRecording()
  }, [elapsed, recordingState])

  useEffect(() => {
    if (!finalized) return
    const totalSecs = elapsed / 1000
    playbackDurationRef.current = totalSecs
    setPlaybackDuration(totalSecs)
    setPlaybackCurrent(prev => {
      const clamped = Math.min(prev, totalSecs)
      if (audioRef.current) audioRef.current.currentTime = clamped
      return clamped
    })
  }, [elapsed, finalized])

  // ─── timer helpers ───────────────────────────────────────────────────────────

  const clearTimerOnly = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startTimer = () => {
    segmentStartRef.current = performance.now()
    timerRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (performance.now() - segmentStartRef.current))
    }, 50)
  }

  const freezeTimer = () => {
    if (!timerRef.current) return
    accumulatedRef.current = accumulatedRef.current + (performance.now() - segmentStartRef.current)
    clearTimerOnly()
    setElapsed(accumulatedRef.current)
  }

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00"
    const m   = Math.floor(s / 60).toString().padStart(2, "0")
    const sec = Math.floor(s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
  }

  // ─── THE KEY FIX: stop recorder and wait for ALL chunks to flush ─────────────
  // MediaRecorder buffers data async — onstop fires AFTER the final ondataavailable.
  // Never read chunksRef before this resolves or you'll get incomplete/empty audio.
  const stopRecorderAndGetBlob = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const mr = mediaRecorder.current
      if (!mr || mr.state === "inactive") {
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }))
        return
      }
      mr.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }))
      }
      mr.stop()
    })
  }

  // ─── recording actions ──────────────────────────────────────────────────────

  const startRecording = () => {
    if (!mediaStream.current) return
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.onstop = null
      mediaRecorder.current.stop()
    }
    chunksRef.current = []
    accumulatedRef.current = 0
    setElapsed(0)
    setAudioBlob(null)
    latestBlobRef.current = null
    setFinalized(false)
    setIsPlaying(false)
    resetPlayback()
    audioRef.current = null
    setUndoMs(0)
    setRedoBudget(0)
    hasSpliceRef.current = false
    spliceOriginalRef.current = null

    const recorder = new MediaRecorder(mediaStream.current)
    mediaRecorder.current = recorder
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      latestBlobRef.current = blob
      setAudioBlob(blob)
    }
    recorder.start(100)
    setRecordingState("recording")
    startTimer()
  }

  const pauseRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.pause()
      setRecordingState("paused")
      freezeTimer()
    }
  }

  // On undo+resume: stop current recorder, AWAIT full flush, save as splice
  // original, then start a fresh recorder from the trim point onward.
  const resumeRecording = async () => {
    if (!mediaRecorder.current || !mediaStream.current) return

    if (undoMs > 0) {
      const trimPoint = accumulatedRef.current / 1000

      // Wait for all buffered audio data before building the splice original
      const flushedBlob = await stopRecorderAndGetBlob()
      const originalForSplice = flushedBlob.size > 0 ? flushedBlob : latestBlobRef.current

      chunksRef.current = []
      setUndoMs(0)
      setRedoBudget(0)

      spliceOriginalRef.current = originalForSplice
      spliceTrimSecRef.current  = trimPoint
      hasSpliceRef.current      = true

      const recorder = new MediaRecorder(mediaStream.current)
      mediaRecorder.current = recorder
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => { /* finalize() handles merging */ }
      recorder.start(100)
      setRecordingState("recording")
      startTimer()
    } else if (mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume()
      setRecordingState("recording")
      startTimer()
    } else if (mediaRecorder.current.state === "inactive") {
      // Coming back from finalized view — recorder was stopped during finalize.
      // Splice new audio onto the committed blob from that point onward.
      const trimPoint = accumulatedRef.current / 1000
      const originalForSplice = latestBlobRef.current
      if (!originalForSplice) return

      chunksRef.current = []
      spliceOriginalRef.current = originalForSplice
      spliceTrimSecRef.current  = trimPoint
      hasSpliceRef.current      = true

      const recorder = new MediaRecorder(mediaStream.current)
      mediaRecorder.current = recorder
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => { /* finalize() handles merging */ }
      recorder.start(100)
      setRecordingState("recording")
      startTimer()
    }
  }

  const stopRecording = () => {
    freezeTimer()
    // Keep default onstop so latestBlobRef stays current
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop()
    }
    setRecordingState("stopped")
  }

  const handleMainButton = () => {
    if      (recordingState === "idle")      startRecording()
    else if (recordingState === "recording") pauseRecording()
    else if (recordingState === "paused")    resumeRecording()
    else if (recordingState === "stopped")   startRecording()
  }

  const handleTrash = () => {
    clearTimerOnly()
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.onstop = null
      mediaRecorder.current.stop()
    }
    chunksRef.current = []
    accumulatedRef.current = 0
    setElapsed(0)
    setAudioBlob(null)
    latestBlobRef.current = null
    setFinalized(false)
    setIsPlaying(false)
    resetPlayback()
    setUndoMs(0)
    setRedoBudget(0)
    hasSpliceRef.current = false
    spliceOriginalRef.current = null
    audioRef.current = null
    setRecordingState("idle")
  }

  // ─── WAV encoder ─────────────────────────────────────────────────────────────

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels
    const sr          = buffer.sampleRate
    const length      = buffer.length * numChannels * 2
    const ab          = new ArrayBuffer(44 + length)
    const view        = new DataView(ab)
    const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)) }
    ws(0, "RIFF"); view.setUint32(4, 36 + length, true); ws(8, "WAVE")
    ws(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true); view.setUint32(24, sr, true)
    view.setUint32(28, sr * numChannels * 2, true); view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true); ws(36, "data"); view.setUint32(40, length, true)
    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); offset += 2
      }
    }
    return new Blob([ab], { type: "audio/wav" })
  }

  // ─── checkmark / finalize ───────────────────────────────────────────────────

  const handleCheck = async () => {
    // ── Back from finalized view ──
    if (finalized) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      setFinalized(false)
      setIsPlaying(false)
      setPlaybackCurrent(0)
      // Return to paused so the user can still resume recording if time remains
      setRecordingState("paused")
      return
    }

    // Freeze timer before anything async so elapsed is stable
    if (timerRef.current) freezeTimer()

    // Show spinner and await full chunk flush
    setIsSplicing(true)
    const tailBlob = await stopRecorderAndGetBlob()
    setRecordingState("stopped")

    const totalSecs = accumulatedRef.current / 1000

    const finalize = (blob: Blob, durationSecs: number) => {
      if (!blob || blob.size === 0) {
        console.error("finalize: empty blob, aborting")
        setIsSplicing(false)
        return
      }
      latestBlobRef.current = blob
      setAudioBlob(blob)
      setFinalized(true)
      setIsPlaying(false)
      setPlaybackCurrent(0)
      playbackDurationRef.current = durationSecs
      setPlaybackDuration(durationSecs)
      // Always tear down old audio element and build fresh from the correct blob
      audioRef.current = null
      loadAudio(blob)
      setIsSplicing(false)
      hasSpliceRef.current = false
      spliceOriginalRef.current = null
    }

    // ── Splice path: merge trimmed original + new tail ──
    if (hasSpliceRef.current && spliceOriginalRef.current && tailBlob.size > 0) {
      const origBlob = spliceOriginalRef.current
      const trimSec  = spliceTrimSecRef.current
      ;(async () => {
        try {
          const ctx = new AudioContext()
          const [origBuf, newBuf] = await Promise.all([
            origBlob.arrayBuffer().then(ab => ctx.decodeAudioData(ab)),
            tailBlob.arrayBuffer().then(ab => ctx.decodeAudioData(ab)),
          ])
          const sr           = origBuf.sampleRate
          const trimSamples  = Math.floor(trimSec * sr)
          const totalSamples = trimSamples + newBuf.length
          const channels     = origBuf.numberOfChannels
          const combined     = ctx.createBuffer(channels, totalSamples, sr)
          for (let c = 0; c < channels; c++) {
            combined.getChannelData(c).set(origBuf.getChannelData(c).subarray(0, trimSamples), 0)
            combined.getChannelData(c).set(newBuf.getChannelData(c), trimSamples)
          }
          const offCtx = new OfflineAudioContext(channels, totalSamples, sr)
          const src = offCtx.createBufferSource()
          src.buffer = combined; src.connect(offCtx.destination); src.start()
          const rendered = await offCtx.startRendering()
          const actualDuration = rendered.length / rendered.sampleRate
          accumulatedRef.current = actualDuration * 1000
          setElapsed(actualDuration * 1000)
          finalize(audioBufferToWav(rendered), actualDuration)
          ctx.close()
        } catch (e) {
          console.error("Splice failed:", e)
          // Degrade gracefully: just play the new tail
          finalize(tailBlob, totalSecs)
        }
      })()
      return
    }

    // ── No splice: use tail if non-empty, else fall back to committed blob ──
    const blob = tailBlob.size > 0 ? tailBlob : latestBlobRef.current
    if (blob && blob.size > 0) {
      finalize(blob, totalSecs)
    } else {
      setIsSplicing(false)
    }
  }

  // ─── playback ───────────────────────────────────────────────────────────────

  const resetPlayback = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    setPlaybackCurrent(0)
    setPlaybackDuration(0)
    playbackDurationRef.current = 0
  }

  const loadAudio = (blob: Blob) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.onended = null
      audioRef.current.load()
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = URL.createObjectURL(blob)
    const audio = new Audio(audioUrlRef.current)
    audio.preload = "auto"
    audioRef.current = audio
    audio.onended = () => {
      setIsPlaying(false)
      setPlaybackCurrent(0)
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }

  const tickRaf = () => {
    const audio = audioRef.current
    if (!audio) return
    const t = audio.currentTime
    const limit = playbackDurationRef.current
    if (limit > 0 && t >= limit) {
      audio.pause(); audio.currentTime = 0
      setPlaybackCurrent(0); setIsPlaying(false)
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }
    setPlaybackCurrent(t)
    if (!audio.paused && !audio.ended) rafRef.current = requestAnimationFrame(tickRaf)
  }

  const handlePlay = () => {
    if (!audioRef.current) {
      const blob = latestBlobRef.current ?? audioBlob
      if (blob) loadAudio(blob)
    }
    const audio = audioRef.current
    if (!audio) return
    if (playbackDurationRef.current === 0 && playbackDuration > 0) {
      playbackDurationRef.current = playbackDuration
    }
    if (isPlaying) {
      audio.pause(); setIsPlaying(false)
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    } else {
      audio.play(); setIsPlaying(true)
      rafRef.current = requestAnimationFrame(tickRaf)
    }
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    setPlaybackCurrent(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  // ─── undo / redo ────────────────────────────────────────────────────────────

  const SEEK_MS = 3000

  const seekAudioTo = (seconds: number) => {
    if (!audioRef.current) return
    const clamped = Math.max(0, Math.min(seconds, audioRef.current.duration || seconds))
    audioRef.current.currentTime = clamped
    setPlaybackCurrent(clamped)
  }

  const handleUndo = () => {
    const rewindBy = Math.min(SEEK_MS, accumulatedRef.current)
    if (rewindBy <= 0) return
    const newElapsed = accumulatedRef.current - rewindBy
    accumulatedRef.current = newElapsed
    setElapsed(newElapsed)
    setUndoMs(prev => prev + rewindBy)
    setRedoBudget(prev => prev + rewindBy)
    if (finalized) seekAudioTo(newElapsed / 1000)
  }

  const handleRedo = () => {
    const forwardBy = Math.min(SEEK_MS, redoBudget)
    if (forwardBy <= 0) return
    const newElapsed = accumulatedRef.current + forwardBy
    accumulatedRef.current = newElapsed
    setElapsed(newElapsed)
    setRedoBudget(prev => prev - forwardBy)
    setUndoMs(prev => Math.max(0, prev - forwardBy))
    if (finalized) seekAudioTo(newElapsed / 1000)
  }

  // ─── derived ─────────────────────────────────────────────────────────────────

  const showUndoRedo = recordingState === "recording" || recordingState === "paused"
  const canUndo      = showUndoRedo && elapsed > 0
  const canRedo      = showUndoRedo && redoBudget > 0
  const seconds      = elapsed / 1000
  const progressPct  = Math.min((elapsed / (MAX_SECONDS * 1000)) * 100, 100)
  const scrubPct     = playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackCurrent / playbackDuration) * 100)) : 0

  const mainButtonLabel = () => {
    if (recordingState === "idle") return (
      <><span className="w-3 h-3 rounded-full bg-[#f50] animate-pulse" /><span>Start recording</span></>
    )
    if (recordingState === "recording") return (
      <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span>Pause</span></>
    )
    if (recordingState === "paused") return (
      <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg><span>Resume</span></>
    )
    return <><span className="w-3 h-3 rounded-full bg-[#f50]" /><span>Record again</span></>
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <main>
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_15px_40px_rgba(0,0,0,0.7)]">

        <button
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-[#202020] transition-colors"
          onClick={async () => {
            if (micOpen && permission === "granted") { setMicOpen(false); return }
            if (permission === "granted") { setMicOpen(!micOpen); return }
            setPermission("requesting")
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
              mediaStream.current = stream
              setPermission("granted")
              setMicOpen(true)
            } catch {
              setPermission("denied")
              setMicOpen(true)
            }
          }}
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-[#ccc]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                className={`transition-transform duration-200 ${micOpen ? "rotate-180" : "rotate-0"}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[15px] font-semibold text-white">Or record with a microphone</p>
              <p className="text-[13px] text-[#888] mt-1">Upload recorded voice memos, updates, news, or intros to new releases.</p>
            </div>
          </div>
          {permission === "requesting" && (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
        </button>

        {micOpen && (
          <div className="border-t border-[#2a2a2a] bg-[#181818]">

            {(permission === "denied" || permission === "idle") && (
              <div className="px-8 py-6 flex flex-col items-center text-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2L1 21h22L12 2z"/></svg>
                <p className="text-[14px] font-semibold text-amber-400">No microphone found</p>
                <p className="text-[13px] text-[#888]">Please allow microphone access in your web browser settings.</p>
              </div>
            )}

            {permission === "granted" && (
              <div className="flex flex-col">

                {(recordingState === "recording" || recordingState === "paused") && !finalized && (
                  <div className="px-8 pt-4 pb-1">
                    <div className="relative w-full h-0.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-[#f50] rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-[11px] text-[#555] mt-1 text-right">{Math.max(0, MAX_SECONDS - Math.floor(seconds))}s left</p>
                  </div>
                )}

                {recordingState !== "recording" && recordingState !== "paused" && !finalized && (
                  <div className="pt-4" />
                )}

                {/* ── FINALIZED VIEW ── */}
                {finalized && (
                  <div className="px-8 pt-5 pb-4 flex flex-col gap-3">
                    <div className="relative w-full h-4 flex items-center">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-[#2a2a2a]" />
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 rounded-full bg-[#f50] pointer-events-none" style={{ width: `${scrubPct}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none -translate-x-1/2" style={{ left: `${scrubPct}%` }} />
                      <input type="range" min={0} max={playbackDuration > 0 ? playbackDuration : 1} step={0.01}
                        value={playbackCurrent} onChange={handleScrub}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#555] font-mono tabular-nums">
                      <span>{fmt(playbackCurrent)}</span>
                      <span>{fmt(playbackDuration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={handleCheck} className="text-[#888] hover:text-white transition-colors" title="Back">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                        </button>
                        <button onClick={handlePlay} className="text-[#888] hover:text-white transition-colors" title={isPlaying ? "Pause" : "Play"}>
                          {isPlaying
                            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                          }
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const blob = latestBlobRef.current ?? audioBlob
                          if (!blob) return
                          // Create a fresh object URL — the slice will revoke the old one
                          const url = URL.createObjectURL(blob)
                          dispatch(setAudioSource({
                            kind: "recorded",
                            url,
                            duration: playbackDuration,
                            size: blob.size,
                          }))
                        }}
                        className="px-6 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white text-[14px] font-semibold transition-colors"
                      >Upload</button>
                    </div>
                  </div>
                )}

                {/* ── RECORDING / PAUSED / IDLE / STOPPED VIEW ── */}
                {!finalized && (
                  <div className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-4">
                      {(recordingState === "paused" || (recordingState === "stopped" && (latestBlobRef.current || audioBlob))) && (
                        <button onClick={handleCheck} disabled={isSplicing} className="text-[#888] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title={isSplicing ? "Processing…" : "Finalize"}>
                          {isSplicing
                            ? <div className="w-[18px] h-[18px] border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                        </button>
                      )}
                      {showUndoRedo && (
                        <button onClick={handleUndo} disabled={!canUndo} className="text-[#888] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Undo 3s">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.91"/>
                          </svg>
                        </button>
                      )}
                      {showUndoRedo && (
                        <button onClick={handleRedo} disabled={!canRedo} className="text-[#888] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Redo 3s">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.91"/>
                          </svg>
                        </button>
                      )}
                      {(recordingState !== "idle" || latestBlobRef.current || audioBlob) && (
                        <button onClick={handleTrash} className="text-[#888] hover:text-red-400 transition-colors" title="Delete">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleMainButton}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-white text-[14px] font-semibold transition-colors ${
                        recordingState === "recording" ? "bg-[#f50] hover:bg-[#e04a00]" : "bg-[#2a2a2a] hover:bg-[#333]"
                      }`}
                    >
                      {mainButtonLabel()}
                    </button>

                    <div className="text-[14px] text-[#888] font-mono tabular-nums w-12 text-right">
                      {fmt(seconds)}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
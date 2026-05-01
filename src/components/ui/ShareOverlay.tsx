import { useState } from "react";
import { X } from "lucide-react";

export default function ShareOverlay({
  onClose,
  shareUrl,
}: {
  onClose: () => void;
  shareUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<"share" | "message">("share");
  const [shortenLink, setShortenLink] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-white/40 px-4 pt-28"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[121] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label="Close share overlay"
        type="button"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="w-full max-w-[540px] rounded-[3px] border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-7 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "share"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "message"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Message
          </button>
        </div>

        {activeTab === "share" ? (
          <>
            <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
              <input
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-[14px] font-semibold text-zinc-100 outline-none sm:text-[15px]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-zinc-100 sm:text-[15px]">
              <input
                type="checkbox"
                checked={shortenLink}
                onChange={(e) => setShortenLink(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-500 bg-transparent"
              />
              Shorten link
            </label>
          </>
        ) : (
          <div className="py-6 text-[24px] text-zinc-400">
            Messaging share is coming soon.
          </div>
        )}
      </div>
    </div>
  );
}

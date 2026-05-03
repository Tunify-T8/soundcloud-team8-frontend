import { useEffect } from "react";

export default function BlockUserModal({
  targetName,
  removeComments,
  reportSpam,
  blockError,
  isBlocking,
  onToggleRemoveComments,
  onToggleReportSpam,
  onCancel,
  onConfirm,
}: {
  targetName: string;
  removeComments: boolean;
  reportSpam: boolean;
  blockError?: string | null;
  isBlocking: boolean;
  onToggleRemoveComments: () => void;
  onToggleReportSpam: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[640px] rounded-[4px] border border-zinc-800 bg-[#111] p-8 text-white shadow-2xl">
        <h2 className="text-[22px] font-bold tracking-tight">Block {targetName}</h2>
        <p className="mt-6 text-[15px] font-semibold">
          Blocking means that {targetName} will no longer be able to
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-8 text-[15px] leading-7 text-zinc-200">
          <li>follow you,</li>
          <li>like your tracks,</li>
          <li>repost your tracks,</li>
          <li>send you messages,</li>
          <li>share tracks with you,</li>
          <li>post new comments on your tracks, or</li>
          <li>send you new stream or email notifications.</li>
        </ul>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 text-[15px] font-semibold text-white">
            <input
              type="checkbox"
              checked={removeComments}
              onChange={onToggleRemoveComments}
              className="mt-1 h-5 w-5 rounded border-zinc-600 bg-transparent"
            />
            <span>
              Also permanently remove this user&apos;s comments, reposts and likes of your tracks and playlists
            </span>
          </label>

          <label className="flex items-start gap-3 text-[15px] font-semibold text-white">
            <input
              type="checkbox"
              checked={reportSpam}
              onChange={onToggleReportSpam}
              className="mt-1 h-5 w-5 rounded border-zinc-600 bg-transparent"
            />
            <span>Also report {targetName} for spam</span>
          </label>
        </div>

        {blockError ? (
          <p className="mt-5 text-sm text-red-400">{blockError}</p>
        ) : null}

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBlocking}
            className="rounded-[4px] bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBlocking}
            className="rounded-[4px] bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {isBlocking ? `Blocking ${targetName}...` : `Block ${targetName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

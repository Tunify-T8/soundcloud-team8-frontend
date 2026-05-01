import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import SongCard from "@/components/ui/SongCard";
import { Genre } from "@/shared/types/Genre";
import downloadImg from "@/assets/download.png";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import {
  deleteAllDownloads,
  deleteDownload,
  DOWNLOAD_LIBRARY_CHANGED_EVENT,
  getDownloadedTracks,
  revokeDownloadedTrackUrls,
  type DownloadLibraryChangedDetail,
  type DownloadedTrackRecord,
} from "../downloadStorage";

const OfflineIcon = () => (
  <img
    src={downloadImg}
    alt="Offline"
    className="rounded-full"
  />
);

function UpsellPage() {
  return (
    <div className="flex flex-col items-center px-6 pb-6 pt-10 select-none">
      <div className="relative mb-6">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #f90 0%, #ff6200 100%)",
            boxShadow: "0 0 60px 20px rgba(255,102,0,0.25)",
          }}
        >
          <OfflineIcon />
        </div>
        <div
          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black"
          style={{ background: "#f90" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white">
        Listen offline, anytime
      </h2>
      <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-zinc-400">
        Download your favorite tracks and play them without an internet connection.
        Available exclusively on <span className="font-semibold text-[#f90]">Artist Pro</span>.
      </p>

      <div className="mb-10 flex w-full max-w-xs flex-col gap-3">
        {[
          { text: "- Download unlimited tracks" },
          { text: "- Play without internet" },
          { text: "- Your downloads, always available" },
        ].map(({ text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-sm text-zinc-300">{text}</span>
          </div>
        ))}
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        Free for 7 days · then <span className="text-zinc-300">EGP 74.99/month</span>
      </p>

      <ArtistProUpgradeButton
        className="rounded-full px-8 py-3 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #f90 0%, #ff6200 100%)",
          boxShadow: "0 4px 24px rgba(255,102,0,0.35)",
        }}
      >
        Upgrade to Artist Pro
      </ArtistProUpgradeButton>
    </div>
  );
}

function DeleteAllDownloadsModal({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#111111] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">Delete all downloads?</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Are you sure you want to delete all your downloads? this action can not be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Yes, Delete All"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadsList({ userId }: { userId: string }) {
  const [tracks, setTracks] = useState<DownloadedTrackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [deleteAllPending, setDeleteAllPending] = useState(false);
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTracks = async () => {
      const nextTracks = await getDownloadedTracks(userId);
      if (!mounted) {
        revokeDownloadedTrackUrls(nextTracks);
        return;
      }

      setTracks((prev) => {
        revokeDownloadedTrackUrls(prev);
        return nextTracks;
      });
      setLoading(false);
    };

    void loadTracks();

    const handleDownloadLibraryChanged = (event: Event) => {
      const detail = (event as CustomEvent<DownloadLibraryChangedDetail>).detail;
      if (!detail || detail.userId !== userId) return;
      void loadTracks();
    };

    window.addEventListener(DOWNLOAD_LIBRARY_CHANGED_EVENT, handleDownloadLibraryChanged);

    return () => {
      mounted = false;
      window.removeEventListener(DOWNLOAD_LIBRARY_CHANGED_EVENT, handleDownloadLibraryChanged);
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      revokeDownloadedTrackUrls(tracks);
    };
  }, [tracks]);

  const handleDeleteTrack = async (trackId: string) => {
    setDeletingTrackId(trackId);
    try {
      await deleteDownload(userId, trackId);
      setTracks((prev) => {
        const target = prev.find((track) => track.meta.id === trackId);
        if (target) {
          revokeDownloadedTrackUrls([target]);
        }
        return prev.filter((track) => track.meta.id !== trackId);
      });
    } finally {
      setDeletingTrackId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllPending(true);
    try {
      await deleteAllDownloads(userId);
      setTracks((prev) => {
        revokeDownloadedTrackUrls(prev);
        return [];
      });
      setDeleteAllModalOpen(false);
    } finally {
      setDeleteAllPending(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 flex flex-col gap-4" data-testid="downloads-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[130px] animate-pulse rounded-sm bg-[#282828]" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <p data-testid="downloads-empty-msg" className="py-20 text-center text-lg font-bold text-white">
        You have not downloaded any tracks yet
      </p>
    );
  }

  return (
    <div data-testid="downloads-list">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">
          Downloaded tracks
          <span className="ml-2 text-sm font-normal text-zinc-500">({tracks.length})</span>
        </h2>
        <button
          type="button"
          onClick={() => setDeleteAllModalOpen(true)}
          className="rounded-full border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          Delete All Downloads
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {tracks.map((track) => (
          <div key={track.meta.id} className="rounded-sm border border-zinc-800 bg-[#111] p-3">
            <SongCard
              trackId={track.meta.id}
              title={track.meta.title}
              artistName={track.meta.artist}
              coverUrl={track.artworkBlobUrl ?? track.meta.coverUrl}
              genre={Genre.POP}
              offlineSrc={track.blobUrl}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void handleDeleteTrack(track.meta.id)}
                disabled={deletingTrackId === track.meta.id}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingTrackId === track.meta.id ? "Deleting..." : "Delete Download"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteAllModalOpen ? (
        <DeleteAllDownloadsModal
          pending={deleteAllPending}
          onCancel={() => setDeleteAllModalOpen(false)}
          onConfirm={() => void handleDeleteAll()}
        />
      ) : null}
    </div>
  );
}

export default function DownloadsTab() {
  const { isArtistPro } = useSubscription();
  const { me } = useMe();

  return (
    <div data-testid="downloads-tab">
      {isArtistPro ? (
        <DownloadsList userId={me?.id ?? ""} />
      ) : (
        <UpsellPage />
      )}
    </div>
  );
}

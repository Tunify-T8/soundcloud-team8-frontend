import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import SongCard from "@/components/ui/SongCard";
import { Genre } from "@/shared/types/Genre";
import downloadImg from "@/assets/download.png";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";

const OfflineIcon = () => (
  <img
    src={downloadImg}
    alt="Offline"
    className="rounded-full"
  />
);

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = "sc_downloads";
const STORE   = "tracks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

interface DownloadedEntry {
  meta: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
  };
  audio: Blob;
  artwork?: Blob | null;
}

async function getDownloadedTracks(
  userId: string,
): Promise<Array<DownloadedEntry & { blobUrl: string; artworkBlobUrl?: string }>> {
  const db    = await openDB();
  const tx    = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);

  const allKeys: string[] = await new Promise((res, rej) => {
    const req = store.getAllKeys();
    req.onsuccess = () => res(req.result as string[]);
    req.onerror   = () => rej(req.error);
  });

  const userKeys = allKeys.filter((k) => k.startsWith(`user_${userId}_`));
  const results: Array<DownloadedEntry & { blobUrl: string; artworkBlobUrl?: string }> = [];

  for (const key of userKeys) {
    const val: DownloadedEntry = await new Promise((res, rej) => {
      const req = store.get(key);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
    if (val?.meta && val?.audio) {
      results.push({
        ...val,
        blobUrl: URL.createObjectURL(val.audio),
        artworkBlobUrl: val.artwork ? URL.createObjectURL(val.artwork) : undefined,
      });
    }
  }

  return results;
}

// ─── Upsell page ─────────────────────────────────────────────────────────────

function UpsellPage() {
  return (
    <div className="flex flex-col items-center pt-10 pb-6 px-6 select-none">
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #f90 0%, #ff6200 100%)",
            boxShadow: "0 0 60px 20px rgba(255,102,0,0.25)",
          }}
        >
          <OfflineIcon />
        </div>
        <div
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-black"
          style={{ background: "#f90" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      <h2 className="text-white font-bold text-2xl mb-2 tracking-tight text-center">
        Listen offline, anytime
      </h2>
      <p className="text-zinc-400 text-sm text-center max-w-xs mb-8 leading-relaxed">
        Download your favorite tracks and play them without an internet connection.
        Available exclusively on <span className="text-[#f90] font-semibold">Artist Pro</span>.
      </p>

      <div className="flex flex-col gap-3 mb-10 w-full max-w-xs">
        {[
          { text: "- Download unlimited tracks" },
          { text: "- Play without internet" },
          { text: "- Your downloads, always available" },
        ].map(({ text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-zinc-300 text-sm">{text}</span>
          </div>
        ))}
      </div>

      <p className="text-zinc-500 text-xs mb-4">
        Free for 7 days · then <span className="text-zinc-300">EGP 74.99/month</span>
      </p>

      <ArtistProUpgradeButton
        className="px-8 py-3 rounded-full font-bold text-sm text-black transition-all hover:scale-105 active:scale-95"
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

// ─── Downloads list ───────────────────────────────────────────────────────────

function DownloadsList({ userId }: { userId: string }) {
  const [tracks, setTracks]   = useState<Array<DownloadedEntry & { blobUrl: string; artworkBlobUrl?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDownloadedTracks(userId)
      .then(setTracks)
      .finally(() => setLoading(false));

    return () => {
      setTracks((prev) => {
        prev.forEach((t) => {
          URL.revokeObjectURL(t.blobUrl);
          if (t.artworkBlobUrl) URL.revokeObjectURL(t.artworkBlobUrl);
        });
        return [];
      });
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 mt-4" data-testid="downloads-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[130px] rounded-sm bg-[#282828] animate-pulse" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <p data-testid="downloads-empty-msg" className="text-white font-bold text-lg text-center py-20">
        You have not downloaded any tracks yet
      </p>
    );
  }

  return (
    <div data-testid="downloads-list">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-base">
          Downloaded tracks
          <span className="ml-2 text-zinc-500 font-normal text-sm">({tracks.length})</span>
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {tracks.map((track) => (
          <SongCard
            key={track.meta.id}
            trackId={track.meta.id}
            title={track.meta.title}
            artistName={track.meta.artist}
            coverUrl={track.artworkBlobUrl ?? track.meta.coverUrl}
            genre={Genre.POP}
            offlineSrc={track.blobUrl}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

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

import SongCard from '@/components/ui/SongCard';
import AlbumCard from '@/components/ui/AlbumCard';
import UserResultRow from '@/components/ui/UserResultRow';
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../type';

// ─── Helper ───────────────────────────────────────────────────────────────────

function waveformSeedFromId(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days   = Math.floor(diffMs / 86_400_000);
  if (days < 1)  return 'today';
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// ─── Track result — maps TrackSearchResult → SongCard props ──────────────────

function TrackResult({ track }: { track: TrackSearchResult }) {
  return (
    // Wrapper gives the card the same large-cover layout as SoundCloud search
    <div className="flex mb-8">
      <div className="flex-1">
        <SongCard
          trackId={track.id}
          isLikedInitial={false}
          artistName={track.artist}
          title={track.title}
          coverUrl={track.coverUrl ?? undefined}
          genre={track.genre as any}
          likes={track.likesCount.toString()}
          plays={track.playsCount.toString()}
          comments="0"
          reposts="0"
          timeAgo={formatTimeAgo(track.createdAt)}
          waveformSeed={waveformSeedFromId(track.id)}
        />
      </div>
    </div>
  );
}

// ─── Album / Playlist result ──────────────────────────────────────────────────

function CollectionResult({ collection }: { collection: CollectionSearchResult }) {
  // Placeholder tracks — replace with real data from GET /collections/:id/tracks
  // TODO: fetch actual tracks when the API call is integrated
  const placeholderTracks = Array.from({ length: 5 }, (_, i) => ({
    id: `${collection.id}-t${i}`,
    number: i + 1,
    title: `Track ${i + 1}`,
    artist: collection.artist,
    playsCount: 0,
  }));

  return (
    <AlbumCard
      id={collection.id}
      type={collection.type}
      title={collection.title}
      artist={collection.artist}
      coverUrl={collection.coverUrl}
      createdAt={collection.createdAt}
      tracks={placeholderTracks}
    />
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export default function SearchResultItem({ result }: { result: SearchResult }) {
  if (result.type === 'track') {
    return <TrackResult track={result as TrackSearchResult} />;
  }

  if (result.type === 'user') {
    return <UserResultRow user={result as UserSearchResult} />;
  }

  if (result.type === 'album' || result.type === 'playlist') {
    return <CollectionResult collection={result as CollectionSearchResult} />;
  }

  return null;
}
import SongCard from '@/components/ui/SongCard';
import AlbumCard from '@/components/ui/AlbumCard';
import UserResultRow from '@/components/ui/UserResultRow';
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../type';

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

function TrackResult({ track }: { track: TrackSearchResult }) {
  return (
    <div
      data-testid={`search-result-track-${track.id}`}
      className="flex mb-8"
    >
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

function CollectionResult({ collection }: { collection: CollectionSearchResult }) {
  const placeholderTracks = Array.from({ length: 5 }, (_, i) => ({
    id: `${collection.id}-t${i}`,
    number: i + 1,
    title: `Track ${i + 1}`,
    artist: collection.artist,
    playsCount: 0,
  }));

  return (
    <div data-testid={`search-result-collection-${collection.id}`}>
      <AlbumCard
        id={collection.id}
        type={collection.type}
        title={collection.title}
        artist={collection.artist}
        coverUrl={collection.coverUrl}
        createdAt={collection.createdAt}
        tracks={placeholderTracks}
      />
    </div>
  );
}

export default function SearchResultItem({ result }: { result: SearchResult }) {
  if (result.type === 'track') {
    return <TrackResult track={result as TrackSearchResult} />;
  }

  if (result.type === 'user') {
    return (
      <div data-testid={`search-result-user-${result.id}`}>
        <UserResultRow user={result as UserSearchResult} />
      </div>
    );
  }

  if (result.type === 'album' || result.type === 'playlist') {
    return <CollectionResult collection={result as CollectionSearchResult} />;
  }

  return null;
}
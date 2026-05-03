import { useEffect, useState } from 'react';
import SongCard from '@/components/ui/SongCard';
import UserResultRow from '@/components/ui/UserResultRow';
import { playlistService } from '@/features/library/libraryService';
import type { CollectionTrack } from '@/features/library/types';
import type {
  SearchResult,
  TrackSearchResult,
  UserSearchResult,
  CollectionSearchResult,
} from '../type';

function waveformSeedFromId(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function resolveImageUrl(source: Record<string, unknown>): string | null {
  const direct = source.coverUrl ?? source.artworkUrl ?? source.avatarUrl ?? source.cover;
  if (typeof direct === 'string' && direct.trim().length > 0) return direct;

  const artwork = source.artwork;
  if (artwork && typeof artwork === 'object') {
    const artworkUrl = (artwork as Record<string, unknown>).url;
    if (typeof artworkUrl === 'string' && artworkUrl.trim().length > 0) {
      return artworkUrl;
    }
  }

  return null;
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

type SearchPlaylistTrack = {
  id: string;
  number: number;
  title: string;
  artist: string;
  playsCount: number;
  avatarUrl?: string | null;
};

function extractPlaylistTracks(collection: CollectionSearchResult): SearchPlaylistTrack[] {
  const unknownCollection = collection as unknown as { tracks?: unknown[] };
  const rawTracks = Array.isArray(unknownCollection.tracks)
    ? unknownCollection.tracks
    : [];

  if (rawTracks.length > 0) {
    return rawTracks.slice(0, 5).map((raw, index) => {
      const source = (raw && typeof raw === 'object'
        ? raw
        : {}) as Record<string, unknown> & { track?: Record<string, unknown> };
      const track = source.track && typeof source.track === 'object'
        ? source.track
        : source;
      const trackUser = (
        track.user && typeof track.user === 'object'
          ? track.user
          : {}
      ) as Record<string, unknown>;

      const id = String(track.id ?? source.id ?? `${collection.id}-t${index + 1}`);
      const title = String(track.title ?? source.title ?? 'Untitled track');
      const artist = String(
        track.artist ??
        source.artist ??
        trackUser.displayName ??
        trackUser.username ??
        collection.artist,
      );
      const playsCount = Number(
        track.playsCount ??
        track.playCount ??
        source.playsCount ??
        source.playCount ??
        0,
      );
      const avatarUrl = resolveImageUrl(track) ?? resolveImageUrl(source);

      return {
        id,
        number: index + 1,
        title,
        artist,
        playsCount: Number.isFinite(playsCount) ? playsCount : 0,
        avatarUrl,
      };
    });
  }

  if (Array.isArray(collection.trackPreview) && collection.trackPreview.length > 0) {
    return collection.trackPreview.slice(0, 5).map((preview, index) => ({
      id: preview.id || `${collection.id}-preview-${index + 1}`,
      number: index + 1,
      title: preview.title || 'Untitled track',
      artist: preview.artist || collection.artist,
      playsCount: 0,
      avatarUrl: preview.coverUrl ?? collection.coverUrl ?? null,
    }));
  }

  return [];
}

function CollectionResult({ collection }: { collection: CollectionSearchResult }) {
  const [fetchedPlaylistTracks, setFetchedPlaylistTracks] = useState<SearchPlaylistTrack[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (collection.type !== 'playlist' && collection.type !== 'album') return;

    const loadTracks = async () => {
      try {
        const res = await playlistService.getPlaylistTracks(collection.id, 1, 20);
        if (!isMounted) return;

        const mapped = ((res?.data ?? []) as CollectionTrack[]).slice(0, 5).map((ct, index) => ({
          id: ct.track.id,
          number: index + 1,
          title: ct.track.title,
          artist: ct.track.user.displayName || ct.track.user.username,
          playsCount:
            (ct.track as { playCount?: number; playsCount?: number }).playCount ??
            (ct.track as { playCount?: number; playsCount?: number }).playsCount ??
            0,
          avatarUrl:
            resolveImageUrl(ct.track as unknown as Record<string, unknown>) ??
            null,
        }));
        setFetchedPlaylistTracks(mapped);
      } catch {
        if (!isMounted) return;
        setFetchedPlaylistTracks([]);
      }
    };

    void loadTracks();
    return () => {
      isMounted = false;
    };
  }, [collection.id, collection.type]);

  const playlistTracks = fetchedPlaylistTracks.length > 0
    ? fetchedPlaylistTracks
    : extractPlaylistTracks(collection);
  const totalPlays = playlistTracks.reduce((sum, t) => sum + t.playsCount, 0);
  const firstTrack = playlistTracks[0];
  const artistName = firstTrack?.artist || collection.artist;
  const trackCount =
    collection.trackCount > 0 ? collection.trackCount : playlistTracks.length;

  if (collection.type === 'playlist') {
    const firstRealTrack = playlistTracks.find((t) => !t.id.startsWith(`${collection.id}-t`));

    return (
      <div data-testid={`search-result-collection-${collection.id}`} className="mb-8">
        <SongCard
          trackId={firstRealTrack?.id ?? ''}
          entityLinkTo={`/collections/${collection.id}`}
          artistName={collection.artist}
          title={collection.title}
          coverUrl={collection.coverUrl ?? undefined}
          timeAgo={formatTimeAgo(collection.createdAt)}
          contextTag="Playlist"
          likes="0"
          reposts="0"
          comments={playlistTracks.length.toString()}
          plays={totalPlays.toString()}
          waveformSeed={waveformSeedFromId(collection.id)}
          playlistTracks={playlistTracks}
          smallCoverOnMobile
        />
      </div>
    );
  }

  return (
    <div data-testid={`search-result-collection-${collection.id}`} className="mb-8">
      <SongCard
        trackId={firstTrack?.id ?? ''}
        entityLinkTo={`/collections/${collection.id}`}
        artistName={artistName}
        title={collection.title || 'Untitled album'}
        coverUrl={collection.coverUrl ?? undefined}
        timeAgo={formatTimeAgo(collection.createdAt)}
        contextTag="Album"
        likes="0"
        reposts="0"
        comments={trackCount.toString()}
        plays={totalPlays.toString()}
        waveformSeed={waveformSeedFromId(collection.id)}
        playlistTracks={playlistTracks}
        profileTrackTextStyle="titleWhiteArtistGray"
        smallCoverOnMobile
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

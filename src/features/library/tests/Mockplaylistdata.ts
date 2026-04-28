import type { Collection, CollectionTrack, UserSummary } from "../../library/types";

interface MockUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export const MOCK_PLAYLIST_ID = "test";

export function buildMockPlaylist(currentUser: MockUser): Collection {
  const owner: UserSummary = {
    id: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    avatarUrl: currentUser.avatarUrl,
    followerCount: 1234,
  };

  return {
    id: MOCK_PLAYLIST_ID,
    title: "Sequencing Test Playlist",
    description: "Local test fixture for drag-and-drop verification",
    type: "PLAYLIST",
    privacy: "public",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    trackCount: 6,
    likeCount: 0,
    repostsCount: 0,
    isLiked: false,
    owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildMockTracks(currentUser: MockUser): CollectionTrack[] {
  const owner: UserSummary = {
    id: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    avatarUrl: currentUser.avatarUrl,
    followerCount: 1234,
  };

  const baseTime = Date.now();

  const seeds = [
    {
      id: "mock-t1",
      title: "Aghla Min Omri",
      durationSeconds: 255,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80",
    },
    {
      id: "mock-t2",
      title: "Never Ending Story",
      durationSeconds: 175,
      coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80",
    },
    {
      id: "mock-t3",
      title: "Every Breath You Take",
      durationSeconds: 254,
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80",
    },
    {
      id: "mock-t4",
      title: "Blinding Lights",
      durationSeconds: 200,
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80",
    },
    {
      id: "mock-t5",
      title: "Bohemian Rhapsody",
      durationSeconds: 354,
      coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80",
    },
    {
      id: "mock-t6",
      title: "Shape of You",
      durationSeconds: 234,
      coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80",
    },
  ];

  return seeds.map((t, i) => ({
    position: i + 1,
    addedAt: new Date(baseTime - (seeds.length - i) * 86400000).toISOString(),
    track: {
      id: t.id,
      title: t.title,
      durationSeconds: t.durationSeconds,
      coverUrl: t.coverUrl,
      genreId: null,
      isPublic: true,
      user: owner,
    },
  }));
}
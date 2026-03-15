import type { Track } from '../../../shared/types/Track';

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Sunshine',
    artistId: 'user1',
    duration: 180,
    genre: 'Electronic',
    artworkUrl: 'https://via.placeholder.com/300x300?text=Album+Art',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'A chill summer track to relax to.',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z',
    plays: 1500,
    likes: 120,
    reposts: 45,
  },
  {
    id: '2',
    title: 'Night Drive',
    artist: 'Midnight Runners',
    artistId: 'user2',
    duration: 240,
    genre: 'Pop',
    artworkUrl: 'https://via.placeholder.com/300x300?text=Album+Art+2',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Perfect for late night drives.',
    createdAt: '2023-07-15T00:00:00Z',
    updatedAt: '2023-07-15T00:00:00Z',
    plays: 2200,
    likes: 180,
    reposts: 67,
  },
];

export const getMockTrack = (id: string): Track | undefined => {
  return mockTracks.find(track => track.id === id);
};
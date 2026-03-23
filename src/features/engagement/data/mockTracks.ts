// import type { Track } from "../../../shared/types/Track";
// import { Genre } from "../../../shared/types/Genre";

// export const mockTracks: Track[] = [
//   {
//     id: 'dj-sunshine/summer-vibes',
//     title: 'Summer Vibes',
//     artist: 'DJ Sunshine',
//     genre: Genre.HIP_HOP_AND_RAP,
//     tags: ['chill', 'summer', 'relax'],
//     status: 'finished',
//     visibility: 'public',
//     audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
//     description: 'A chill summer track to relax to.',
//     waveformData: [0.2, 0.5, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4, 0.6, 0.5],
//     duration: 180,
//     date: '2023-06-01T00:00:00Z',
//     likes: 120,
//     comments: 34,
//     reposts: 45,
//     downloads: 60,
//     plays: 1500,
//     isHD: true,
//     isPrivate: false,
//     thumbnailUrl: 'https://via.placeholder.com/300x300?text=Thumbnail',
//   },
//   {
//     id: 'midnight-runners/night-drive',
//     title: 'Night Drive',
//     artist: 'Midnight Runners',
//     genre: Genre.POP,
//     tags: ['night', 'drive', 'mood'],
//     status: 'finished',
//     visibility: 'public',
//     audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
//     description: 'Perfect for late night drives.',
//     waveformData: [0.3, 0.6, 0.9, 0.7, 0.4, 0.8, 0.5, 0.6, 0.7, 0.4],
//     duration: 240,
//     date: '2023-07-15T00:00:00Z',
//     likes: 180,
//     comments: 52,
//     reposts: 67,
//     downloads: 95,
//     plays: 2200,
//     isHD: false,
//     isPrivate: false,
//     thumbnailUrl: undefined,
//   },
// ];

// export const getMockTrack = (id: string): Track | undefined => {
//   return mockTracks.find(track => track.id === id);
// };
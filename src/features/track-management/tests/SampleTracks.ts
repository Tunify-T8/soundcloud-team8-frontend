import type { Track } from "../types";
import { Genre } from "../../../shared/types/Genre";

export const SampleTracks: Track[] = [
  {
    id: "trk_001",
    title: "Midnight Echoes",
    genre: Genre.AMBIENT,
    tags: ["synthwave", "night", "ambient"],
    status: "finished",
    visibility: "public",
    audioUrl: "/audio/midnight-echoes.mp3",
    description: "A dreamy synthwave track inspired by late-night city lights.",
    waveformData: [12, 18, 22, 30, 27, 25, 33, 40, 38, 29, 21, 18],
    duration: 214,
    date: "2026-03-10",
   likes: 128,
      comments: 24,
      reposts: 8,
      downloads: 15,
      plays: 1240,
    isHD: true,
    isPrivate: false,
    thumbnailUrl: "/images/tracks/midnight-echoes.jpg"
  },
  {
    id: "trk_002",
    title: "Unreleased Horizon",
    genre: Genre.CLASSICAL,
    tags: ["lofi", "chill", "study"],
    status: "finished",
    visibility: "private",
    audioUrl: "/audio/unreleased-horizon.mp3",
    description: "A chill lo-fi beat currently in progress. Private preview.",
    waveformData: [8, 10, 14, 18, 16, 15, 20, 22, 19, 17, 13, 9],
    duration: 176,
    date: "2026-03-13",
   likes: null,
    comments: null,
      reposts: null,
      downloads: null,
      plays: 12,
    isHD: false,
    isPrivate: true,
    thumbnailUrl: "/images/tracks/unreleased-horizon.jpg"
  }
];
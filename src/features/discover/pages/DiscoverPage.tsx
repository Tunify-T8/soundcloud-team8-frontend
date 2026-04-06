"use client";
import SideBar from "@/components/layout/Sidebar";
import type { DiscoverResponse } from "@/shared/types/Discover";
import { DiscoverSection } from "../components/DiscoverSection";
const MOCK_DISCOVER_RESPONSE: DiscoverResponse = {
  items: [
    {
      id: "6e0a1fa3-dae1-4b20-aef0-8cc2a2cd7955",
      title: "Rock Revolution",
      artist: "Jazz Artist",
      coverUrl: "https://picsum.photos/seed/discover1/300/300",
      waveformUrl: "https://example.com/rock-revolution-waveform.png",
      durationSeconds: 199,
      genre: "Rock",
      createdAt: "2026-03-31T22:01:29.583Z",
    },
    {
      id: "4a6b2d9f-1a95-4c97-9b77-6c8cb4b5402d",
      title: "Midnight Current",
      artist: "Ava Mix",
      coverUrl: "https://picsum.photos/seed/discover2/300/300",
      waveformUrl: "https://example.com/midnight-current-waveform.png",
      durationSeconds: 214,
      genre: "Electronic",
      createdAt: "2026-04-01T19:20:10.000Z",
    },
    {
      id: "11d4545a-8675-4f54-8e5c-8e0dc52c2f44",
      title: "Desert Neon",
      artist: "Muhammad Magdy",
      coverUrl: "https://picsum.photos/seed/discover3/300/300",
      waveformUrl: "https://example.com/desert-neon-waveform.png",
      durationSeconds: 187,
      genre: "Pop",
      createdAt: "2026-04-01T21:45:10.000Z",
    },
    {
      id: "1aa2cfc2-cf3e-43a0-9f1a-84312fd872b2",
      title: "Velvet Prayer",
      artist: "Ibrahim M",
      coverUrl: "https://picsum.photos/seed/discover4/300/300",
      waveformUrl: "https://example.com/velvet-prayer-waveform.png",
      durationSeconds: 204,
      genre: "World",
      createdAt: "2026-04-02T10:10:00.000Z",
    },
    {
      id: "6f790a2a-c151-4a23-984e-49b1f16afb79",
      title: "Golden Echo",
      artist: "Amira Eldeeb",
      coverUrl: "https://picsum.photos/seed/discover5/300/300",
      waveformUrl: "https://example.com/golden-echo-waveform.png",
      durationSeconds: 232,
      genre: "Soul",
      createdAt: "2026-04-02T12:03:33.000Z",
    },
    {
      id: "72ce844b-cfd5-4f8c-96b9-c0e6fe9ec9de",
      title: "Northern Lights",
      artist: "Tunify Sessions",
      coverUrl: "https://picsum.photos/seed/discover6/300/300",
      waveformUrl: "https://example.com/northern-lights-waveform.png",
      durationSeconds: 176,
      genre: "Ambient",
      createdAt: "2026-04-02T14:42:18.000Z",
    },
    {
      id: "56a6c0f0-f4b8-460f-968e-363f5f410f2e",
      title: "Street Pulse",
      artist: "Cairo Beats",
      coverUrl: "https://picsum.photos/seed/discover7/300/300",
      waveformUrl: "https://example.com/street-pulse-waveform.png",
      durationSeconds: 221,
      genre: "Hip Hop",
      createdAt: "2026-04-02T18:26:40.000Z",
    },
    {
      id: "de500943-56d5-4529-b415-f251972d0fa0",
      title: "Moonlit Harbor",
      artist: "Nora Sky",
      coverUrl: "https://picsum.photos/seed/discover8/300/300",
      waveformUrl: "https://example.com/moonlit-harbor-waveform.png",
      durationSeconds: 193,
      genre: "Indie",
      createdAt: "2026-04-03T08:01:12.000Z",
    },
  ],
  page: 1,
  limit: 20,
  hasMore: false,
  personalized: false,
};

export default function DiscoverPage() {
  const tracks = MOCK_DISCOVER_RESPONSE.items;
  const discoverSections = [
    { title: "More of what you like", tracks },
    {
      title: "Recently Played",
      tracks: tracks.slice(1).concat(tracks.slice(0, 1)),
    },
    {
      title: "Albums for you",
      tracks: tracks.slice(3).concat(tracks.slice(0, 3)),
    },
    {
      title: "Made for you",
      tracks: tracks.slice(4).concat(tracks.slice(0, 4)),
    },
    {
      title: "Artists to watch out for",
      tracks: tracks.slice(6).concat(tracks.slice(0, 6)),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-340 gap-10 px-8 py-8">
        <main className="flex-1 overflow-hidden ml-6">
          {discoverSections.map((section) => (
            <DiscoverSection
              key={section.title}
              title={section.title}
              tracks={section.tracks}
            />
          ))}
        </main>

        <aside className="w-90 shrink-0">
          <SideBar />
        </aside>
      </div>
    </div>
  );
}

import SongCard from "@/components/ui/SongCard"; 
import type { TrackItem } from "../types";

export default function TrackRow({ track }: { track: TrackItem }) {
  return (
    <SongCard
      artistName={track.artist}
      title={track.title}
      coverUrl={track.coverUrl}
      timeAgo={track.timeAgo}
      likes={track.likes}
      reposts={track.reposts}
      plays={track.plays}
      comments={track.comments}
    />
  );
}
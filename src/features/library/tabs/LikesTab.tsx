import TrackRow from "../components/TrackRow";
import EmptyList from "../components/EmptyList";
import { LIKED_TRACKS } from "../tests/mockdata";

export default function LikesTab() {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-6">Here's the tracks you've liked</h2>
      {LIKED_TRACKS.length === 0
        ? <EmptyList message="You haven't liked any tracks yet" />
        : LIKED_TRACKS.map((track) => <TrackRow key={track.id} track={track} />)
      }
    </div>
  );
}

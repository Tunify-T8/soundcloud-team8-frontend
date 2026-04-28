import type { DiscoverTrack } from "@/features/discover/Discover";
import imageFallback from "@/assets/track.jpg";
import { usePlayer } from "@/features/playerUI/context/usePlayer";

export function DiscoverCard({ item }: { item: DiscoverTrack }) {
  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();
  const isThisTrack = currentTrack?.id === item.id;
  const playing = isThisTrack && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!item.id) return;

    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: item.id,
        title: item.title,
        artist: item.artist,
        thumbnailUrl: item.coverUrl || undefined,
        duration: item.durationSeconds || 0,
      });
      setIsPlaying(true);
    }
  };

  const handleCardClick = () => {
    if (!item.id) return;
    
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: item.id,
        title: item.title,
        artist: item.artist,
        thumbnailUrl: item.coverUrl || undefined,
        duration: item.durationSeconds || 0,
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="group w-30 shrink-0 cursor-pointer sm:w-34 md:w-37.5" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-sm bg-zinc-800 shadow-sm shadow-black/30">
        <img
          src={item.coverUrl || imageFallback}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageFallback;
          }}
          className="h-30 w-30 object-cover transition-transform duration-300 group-hover:scale-105 sm:h-34 sm:w-34 md:h-37.5 md:w-37.5"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="black">
                <rect x="2" y="2" width="3" height="10" />
                <rect x="9" y="2" width="3" height="10" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="black"
                aria-hidden="true"
              >
                <polygon points="2,0 16,7 2,14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <p className="mt-2 line-clamp-1 text-[14px] font-semibold leading-tight text-zinc-100">
        {item.title}
      </p>
      <p className=" line-clamp-1 text-[13px] font-semibold leading-tight text-zinc-400">
        {item.artist}
      </p>
    </div>
  );
}

import type { DiscoverArtist } from "@/features/discover/Discover";
import imageFallback from "@/assets/avatar.png";
import { Link } from "react-router-dom";

type ArtistsToWatchSectionProps = {
  title: string;
  artists: DiscoverArtist[];
};

const formatFollowers = (count: number) => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M followers`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K followers`;
  }
  return `${count} followers`;
};

function VerifiedBadge() {
  return (
    <span aria-label="Verified" title="Verified" className="inline-flex">
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="9" fill="#2297FF" />
        <path
          d="M6 10.2 8.7 13 14 7.7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ArtistsToWatchSection({
  title,
  artists,
}: ArtistsToWatchSectionProps) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <section data-testid="artists-to-watch-section" className="mb-8 sm:mb-10">
      <h2 data-testid="artists-to-watch-title" className="mb-4 text-[18px] font-bold tracking-tight text-white sm:mb-5 sm:text-[22px]">
        {title}
      </h2>

      <div data-testid="artists-to-watch-list" className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            to={`/${artist.id}`}
            data-testid={`artists-to-watch-item-${artist.id}`}
            className="flex w-24 shrink-0 flex-col items-center sm:w-36"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-800 sm:h-28 sm:w-28">
              <img
                src={artist.avatarUrl || imageFallback}
                alt={artist.name}
                data-testid={`artists-to-watch-avatar-${artist.id}`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = imageFallback;
                }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-3 flex w-full items-center justify-center gap-1.5 sm:mt-4">
              <p className="line-clamp-1 text-center text-[12px] font-semibold leading-tight text-white sm:text-[14px]">
                {artist.name}
              </p>
              {artist.isVerified ? <VerifiedBadge /> : null}
            </div>
            <p className="mt-1 w-full text-center text-[11px] text-zinc-400 sm:text-[13px]">
              {formatFollowers(artist.followersCount)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

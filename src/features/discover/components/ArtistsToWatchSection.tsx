import type { DiscoverArtist } from "@/features/discover/Discover";
import imageFallback from "@/assets/avatar.png";

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
    <section className="mb-8 sm:mb-10">
      <h2 className="mb-4 text-[18px] font-bold tracking-tight text-white sm:mb-5 sm:text-[22px]">
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
        {artists.map((artist) => (
          <article
            key={artist.id}
            className="flex w-30 shrink-0 flex-col items-center sm:w-50"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-800 sm:h-44 sm:w-44">
              <img
                src={artist.avatarUrl || imageFallback}
                alt={artist.name}
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
          </article>
        ))}
      </div>
    </section>
  );
}

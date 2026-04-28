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
    <section className="mb-10">
      <h2 className="mb-5 text-[22px] font-bold tracking-tight text-white">
        {title}
      </h2>

      <div className="flex gap-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {artists.map((artist) => (
          <article
            key={artist.id}
            className="w-50 shrink-0 flex flex-col items-center"
          >
            <div className="relative h-44 w-44 overflow-hidden rounded-full bg-zinc-800">
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

            <div className="mt-4 flex w-full items-center justify-center gap-1.5">
              <p className="line-clamp-1 text-center text-[14px] font-semibold leading-tight text-white">
                {artist.name}
              </p>
              {artist.isVerified ? <VerifiedBadge /> : null}
            </div>
            <p className="mt-1 w-full text-center text-[13px] text-zinc-400">
              {formatFollowers(artist.followersCount)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

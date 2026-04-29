import type { DiscoverTrack } from "@/features/discover/Discover";
import { DiscoverTrackCarousel } from "./DiscoverTrackCarousel";

type DiscoverSectionProps = {
  title: string;
  tracks: DiscoverTrack[];
};

export function DiscoverSection({ title, tracks }: DiscoverSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold tracking-tight text-white sm:text-[22px]">
        {title}
      </h2>
      <DiscoverTrackCarousel tracks={tracks} />
    </section>
  );
}

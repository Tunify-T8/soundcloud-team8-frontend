import type { DiscoverTrack } from "@/shared/types/Discover";
import { DiscoverTrackCarousel } from "./DiscoverTrackCarousel";

type DiscoverSectionProps = {
  title: string;
  tracks: DiscoverTrack[];
};

export function DiscoverSection({ title, tracks }: DiscoverSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-[22px] font-bold tracking-tight text-white">
        {title}
      </h2>
      <DiscoverTrackCarousel tracks={tracks} />
    </section>
  );
}
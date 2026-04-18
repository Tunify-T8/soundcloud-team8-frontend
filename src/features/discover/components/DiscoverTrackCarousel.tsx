import { useEffect, useRef, useState } from "react";
import type { DiscoverTrack } from "@/shared/types/Discover";
import { DiscoverCard } from "./discoverCard";

type DiscoverTrackCarouselProps = {
  tracks: DiscoverTrack[];
  scrollStep?: number;
};

export function DiscoverTrackCarousel({
  tracks,
  scrollStep = 340,
}: DiscoverTrackCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tracks.length]);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -scrollStep : scrollStep,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
          aria-label="Scroll left"
          title="Scroll left"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tracks.map((track) => (
          <DiscoverCard key={track.id} item={track} />
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
          aria-label="Scroll right"
          title="Scroll right"
        >
          ›
        </button>
      )}
    </div>
  );
}

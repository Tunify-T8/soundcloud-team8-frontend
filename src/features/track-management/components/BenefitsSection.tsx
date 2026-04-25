import splice from "@/assets/splice.png";
import groover from "@/assets/groover.png";
import N from "@/assets/N.png";
import arcade from "@/assets/arcade.png";

export function BenefitsSection() {
  const benefits = [
    {
      img: splice,
      title: "Get 2 free months of Splice Sounds+ royalty-free samples",
      save: "$25.98",
    },
    {
      img: groover,
      title: "Get 20% off all campaigns on Groover.co and free hype add-on",
      save: "$21",
    },
    {
      img: N,
      title: "Get 1 month free of Native Instrument's 360 Pro suite",
      save: "$50",
    },
    {
      img: arcade,
      title: "Get 3 free months of Output's Arcade plug-in and samples",
      save: "$39",
    },
  ];

  return (
    <div data-testid="benefits-section" className="mx-0 sm:mx-6 my-8 bg-[hsl(0,0%,9%)] border border-[hsl(0,0%,17%)] rounded-xl px-4 sm:px-6 py-5 sm:py-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-2 gap-3">
        <h2 className="text-white text-base sm:text-lg font-bold tracking-tight leading-snug">
          Artist Pro Membership Benefits
        </h2>
        <button data-testid="benefits-see-all-btn" className="text-white text-sm font-semibold border border-[hsl(0,0%,40%)] rounded-full px-4 sm:px-5 py-1.5 hover:bg-[hsl(0,0%,16%)] transition-colors whitespace-nowrap flex-shrink-0">
          See all
        </button>
      </div>
      <p className="text-[hsl(0,0%,55%)] text-sm mb-5 sm:mb-6 leading-relaxed">
        Jump start your music career with Artist Pro and immediately unlock $100+ in premium music tools and services.
      </p>

      {/* Cards grid — 2 cols on mobile, 4 on sm+ */}
      <div data-testid="benefits-cards-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {benefits.map(({ img, title, save }) => (
          <div data-testid={`benefit-card-${title.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`} key={title} className="flex flex-col gap-2 sm:gap-3 cursor-pointer group">
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[hsl(0,0%,15%)]">
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-white text-xs sm:text-sm font-semibold leading-snug">{title}</p>
            <div>
              <span data-testid="benefit-save-badge" className="bg-green-600 text-white text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full">
                Save {save}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
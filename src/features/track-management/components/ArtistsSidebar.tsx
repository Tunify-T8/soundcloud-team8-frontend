import { Home, Archive, BarChart2, Star } from "lucide-react";

export default function ArtistsSidebar() {
  const items = [
    { icon: Home, label: "Home" },
    { icon: Archive, label: "Library" },
    { icon: BarChart2, label: "Stats" },
    { icon: Star, label: "Featured" },
  ];
  return (
    <nav className="w-[90px] bg-black border-r border-[hsl(0,0%,15%)] flex flex-col items-center pt-4 pb-6 gap-1 shrink-0">
      {/* Logo */}
      <a href="/" className="mb-6 flex items-center justify-center">
        <svg width="34" height="17" viewBox="0 0 34 17" fill="none">
          <rect x="0" y="7" width="1.6" height="10" rx="0.8" fill="white" opacity="0.55"/>
          <rect x="3" y="5" width="1.6" height="12" rx="0.8" fill="white" opacity="0.65"/>
          <rect x="6" y="3" width="1.6" height="14" rx="0.8" fill="white" opacity="0.75"/>
          <rect x="9" y="0" width="1.6" height="17" rx="0.8" fill="white" opacity="0.85"/>
          <rect x="12" y="2" width="1.6" height="15" rx="0.8" fill="white" opacity="0.9"/>
          <rect x="15" y="4" width="1.6" height="13" rx="0.8" fill="white"/>
        </svg>
      </a>
      {items.map(({ icon: Icon, label }) => (
        <button key={label} className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,45%)] hover:text-white transition-colors w-full py-3">
          <Icon className="w-5 h-5" />
          <span className="text-[10px]">{label}</span>
        </button>
      ))}
      <div className="mt-auto">
        <button className="flex flex-col gap-[3px] items-center text-[hsl(0,0%,45%)] hover:text-white transition-colors px-3 py-2">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </button>
      </div>
    </nav>
  );
}

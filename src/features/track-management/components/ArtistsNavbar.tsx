import { Search, Upload, Bell, Mail } from "lucide-react";
export default function ArtistsNavbar() {
  return (
    <div className="bg-black border-b border-[hsl(0,0%,15%)] flex items-center justify-end gap-2 px-6 h-[52px] shrink-0">
      <button className="flex items-center gap-2 border border-[hsl(0,0%,32%)] rounded-full px-4 py-1.5 text-white text-sm font-bold tracking-tighter hover:border-white transition-colors">
        <Search className="w-3.5 h-3.5"/> Search
      </button>
      <button className="flex items-center gap-2 border border-[hsl(0,0%,32%)] rounded-full px-4 py-1.5 text-white text-sm font-bold tracking-tighter hover:border-white transition-colors">
        <Upload className="w-3.5 h-3.5"/> Upload
      </button>
      <button className="text-[hsl(0,0%,55%)] hover:text-white transition-colors p-1.5"><Bell className="w-5 h-5" /></button>
      <button className="text-[hsl(0,0%,55%)] hover:text-white transition-colors p-1.5"><Mail className="w-5 h-5" /></button>
      <button className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[hsl(0,0%,28%)]">
        {/* <img src="AVATAR IMG URL" alt="User" className="w-full h-full object-cover" /> */}
      </button>
    </div>
  );
}


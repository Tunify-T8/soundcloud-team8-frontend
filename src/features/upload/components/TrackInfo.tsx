export default function TrackInfoPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      
      {/* Page Container */}
      <div className="max-w-[1200px] mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
          <h1 className="text-lg font-semibold">Track info</h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-2 gap-16">

          {/* LEFT SIDE (Artwork) */}
          <div>
            <div className="w-[360px] h-[360px] border border-dashed border-[#333] flex flex-col items-center justify-center text-[#888] hover:border-[#555] transition">

              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>

              <p className="mt-4 text-sm">Add new artwork</p>
            </div>
          </div>

          {/* RIGHT SIDE (Form) */}
          <div className="space-y-8">

            {/* Track Title */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Track title *
              </label>
              <input
                type="text"
                defaultValue="file_example_WAV_1MG"
                className="w-full bg-transparent border-b border-[#333] py-2 focus:outline-none focus:border-white"
              />
            </div>

            {/* Track Link */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Track link
              </label>
              <input
                type="text"
                defaultValue="https://soundcloud.com/amgad-mohamed-376620236/"
                className="w-full bg-transparent border-b border-[#333] py-2 focus:outline-none focus:border-white"
              />
            </div>

            {/* Main Artists */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Main Artist(s)
              </label>

              <input
                type="text"
                defaultValue="amgad mohamed"
                className="w-full bg-transparent border-b border-[#333] py-2 focus:outline-none focus:border-white"
              />

              <p className="text-xs text-[#666] mt-2">
                Tip: Use commas to add multiple artist names.
              </p>
            </div>

            {/* Genre */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Genre
              </label>

              <input
                placeholder="Add or search for genre"
                className="w-full bg-transparent border-b border-[#333] py-2 focus:outline-none focus:border-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Tags
              </label>

              <input
                placeholder="Add styles, moods, tempo."
                className="w-full bg-transparent border-b border-[#333] py-2 focus:outline-none focus:border-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-[#aaa] block mb-2">
                Description
              </label>

              <textarea
                rows={3}
                placeholder="Tracks with descriptions tend to get more plays and engagements."
                className="w-full bg-transparent border-b border-[#333] py-2 resize-none focus:outline-none focus:border-white"
              />
            </div>

            {/* Track Privacy */}
            <div>
              <label className="text-sm text-[#aaa] block mb-3">
                Track Privacy
              </label>

              <div className="flex gap-6 text-sm text-[#ccc]">
                <label className="flex items-center gap-2">
                  <input type="radio" name="privacy" defaultChecked />
                  Public
                </label>

                <label className="flex items-center gap-2">
                  <input type="radio" name="privacy" />
                  Private
                </label>

                <label className="flex items-center gap-2">
                  <input type="radio" name="privacy" />
                  Schedule
                </label>
              </div>
            </div>

            {/* Advanced Details */}
            <div className="border-t border-[#222] pt-6">
              <button className="flex items-center justify-between w-full text-left text-sm text-[#ccc]">
                Advanced details
                <span>⌄</span>
              </button>
            </div>

            {/* Permissions */}
            <div className="border-t border-[#222] pt-6">
              <button className="flex items-center justify-between w-full text-left text-sm text-[#ccc]">
                Permissions
                <span>⌄</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Upload Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#222] bg-[#0e0e0e] px-10 py-4 flex justify-end">

        <button className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full font-medium">
          Upload
        </button>

      </div>
    </div>
  );
}
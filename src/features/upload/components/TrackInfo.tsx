

export default function TrackInfoPage ()  {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Track info</h1>
          <p className="text-gray-500 text-lg mt-1">Add new artwork</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Sections */}
          <div className="divide-y divide-gray-200">
            {/* Track Title */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value="file_example_WAV_IMG"
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Track Link */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value="https://soundcloud.com/amgad-mohamed-376620236/"
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Main Artist(s) */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Artist(s)
              </label>
              <input
                type="text"
                value="amgad mohamed"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Tip: Use commas to add multiple artist names.
              </p>
            </div>

            {/* Genre */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add or search for genre"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Add styles, moods, tempo."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Tracks with descriptions tend to get more plays and engagements."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Track Privacy */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Track Privacy
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="schedule"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Schedule</span>
                </label>
              </div>
            </div>

            {/* Advanced details */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advanced details
              </label>
              <input
                type="text"
                placeholder="Buy link, record label, release date, publisher..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Permissions */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <input
                type="text"
                placeholder="Control the visibility of engagements on your track, direct downloads, and more."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Audio clip */}
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio clip
                </label>
                <p className="text-sm text-gray-600">
                  By uploading, you confirm that your sounds comply with our Terms of Use and you don't infringe anyone else's rights.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useRef, useState } from "react";
import { profileService } from "../../profileService";

export default function Avatar({
  avatarUrl,
  displayName,
  isEditable,
}: {
  avatarUrl?: string;
  displayName?: string;
  isEditable?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setShowActions(false);
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        await profileService.updateMeProfile({
          avatarUrl: URL.createObjectURL(file),
        });
      } catch (err) {
        console.error("Failed to update avatar", err);
      }
    }
  }

  const handleOpenUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    setPreviewUrl(null);
    setShowActions(false);
    try {
      await profileService.updateMeProfile({ avatarUrl: null });
    } catch (err) {
      console.error("Failed to remove avatar", err);
    }
  };

  const src = previewUrl ?? avatarUrl;

  return (
    <div className="relative w-full h-full group overflow-visible">
      <div className="relative w-full h-full rounded-full bg-gray-300 overflow-hidden">
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
            {displayName?.charAt(0)}
          </div>
        )}
        {isEditable && (
          <div
            className={`absolute inset-0 bg-white/40 transition-opacity rounded-full ${
              showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          />
        )}
      </div>

      {isEditable && (
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 transition-opacity ${
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setShowActions((prev) => !prev)}
            className={`w-32 bg-zinc-800 font-bold text-[14px] px-3 py-1 rounded-sm transition-colors cursor-pointer ${
              showActions ? "text-orange-500" : "text-white hover:text-zinc-500"
            }`}
          >
            Update image
          </button>
          {showActions && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex w-32 flex-col rounded-sm border border-zinc-700 bg-zinc-950 shadow-lg">
              <button
                type="button"
                onClick={handleOpenUpload}
                className="w-full text-left text-white font-bold text-[14px] px-3 py-2 hover:text-gray-300 transition-colors cursor-pointer"
              >
                Replace image
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full text-left text-white font-bold text-[14px] px-3 py-2 hover:text-gray-300 transition-colors cursor-pointer"
              >
                Delete image
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload avatar image"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

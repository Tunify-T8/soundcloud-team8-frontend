import { useRef, useState } from "react";
import { profileService } from "../../profileService";

export default function HeaderImg({
  coverUrl,
  isMe,
  onProfileUpdated,
}: {
  coverUrl?: string;
  isMe?: boolean;
  onProfileUpdated?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "tunify_avatars_coverImgs");
        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dcctvg2ay/image/upload",
          { method: "POST", body: formData },
        );
        const cloudData = await cloudRes.json();
        await profileService.updateMeProfile({
          coverUrl: cloudData.secure_url,
        });
        onProfileUpdated?.();
      } catch (err) {
        console.error("Failed to update cover image", err);
      } finally {
        setIsUploading(false);
      }
    }
  }

  const handleOpenUpload = () => {
    setShowActions(false);
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    setPreviewUrl(null);
    setShowActions(false);
    try {
      await profileService.updateMeProfile({ coverUrl: null });
      onProfileUpdated?.();
    } catch (err) {
      console.error("Failed to remove cover image", err);
    }
  };

  const src = previewUrl ?? coverUrl;

  return (
    <div
      data-testid="profile-header-image"
      className={`relative header-container flex items-center w-full h-28 sm:h-44 md:h-56 lg:h-64 ${
        src
          ? "bg-[#0b0b0b]"
          : "bg-gradient-to-r from-[#86535e] via-[#9b7f88] to-[#b8b8ba]"
      }`}
    >
      {src && (
        <img
          data-testid="profile-header-image-img"
          src={src}
          alt="Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className="text-white font-bold text-sm">Uploading...</span>
        </div>
      )}
      {isMe && (
        <div className="absolute right-2 top-2 z-10 sm:right-7 sm:top-8">
          {!src ? (
            <button
              data-testid="profile-header-upload-btn"
              type="button"
              onClick={handleOpenUpload}
              className="bg-black text-white font-bold text-[14px] px-3 py-2 rounded-sm cursor-pointer hover:text-gray-400 transition-colors"
            >
              Upload header image
            </button>
          ) : (
            <>
              <button
                data-testid="profile-header-update-btn"
                type="button"
                onClick={() => setShowActions((prev) => !prev)}
                className={`w-28 rounded-sm bg-zinc-800 px-2 py-1.5 text-[12px] font-bold transition-colors cursor-pointer sm:w-36 sm:px-3 sm:py-2 sm:text-[14px] ${
                  showActions
                    ? "text-orange-500"
                    : "text-white hover:text-zinc-500"
                }`}
              >
                Update image
              </button>
              {showActions && (
                <div className="absolute top-full left-1/2 mt-2 flex w-28 -translate-x-1/2 flex-col rounded-sm border border-zinc-700 bg-zinc-950 shadow-lg sm:w-36">
                  <button
                    data-testid="profile-header-replace-btn"
                    type="button"
                    onClick={handleOpenUpload}
                    className="w-full cursor-pointer px-2 py-2 text-left text-[12px] font-bold text-white transition-colors hover:text-gray-300 sm:px-3 sm:text-[14px]"
                  >
                    Replace image
                  </button>
                  <button
                    data-testid="profile-header-delete-btn"
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full cursor-pointer px-2 py-2 text-left text-[12px] font-bold text-white transition-colors hover:text-gray-300 sm:px-3 sm:text-[14px]"
                  >
                    Delete image
                  </button>
                </div>
              )}
            </>
          )}
          <input
            data-testid="profile-header-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}

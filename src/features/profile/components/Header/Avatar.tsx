import { useRef, useState } from "react";
import { profileService } from "../../profileService";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionBadge from "@/features/premium/components/SubscriptionBadge";

export default function Avatar({
  avatarUrl,
  displayName,
  isMe,
  onProfileUpdated,
}: {
  avatarUrl?: string;
  displayName?: string;
  isMe?: boolean;
  onProfileUpdated?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { tier } = useSubscription();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setShowActions(false);
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
          avatarUrl: cloudData.secure_url,
        });
        onProfileUpdated?.();
      } catch (err) {
        console.error("Failed to update avatar", err);
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
      await profileService.updateMeProfile({ avatarUrl: null });
      onProfileUpdated?.();
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
        {isMe && (
          <div
            className={`absolute inset-0 bg-white/40 transition-opacity rounded-full ${
              showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">Uploading...</span>
          </div>
        )}
      </div>
      {isMe && tier !== "free" && (
        <div className="pointer-events-none absolute -right-1 top-0 z-10 -translate-y-[12%] translate-x-[12%]">
          <SubscriptionBadge tier={tier} size={34} />
        </div>
      )}

      {isMe && (
        <div
          className={`absolute bottom-0 left-1/2 z-20 mt-1 -translate-x-1/2 translate-y-full transition-opacity sm:bottom-10 sm:mt-0 sm:translate-y-0 ${
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={src ? () => setShowActions((prev) => !prev) : handleOpenUpload}
            className={`w-24 rounded-sm bg-zinc-800 px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer sm:w-32 sm:text-[14px] ${
              showActions ? "text-orange-500" : "text-white hover:text-zinc-500"
            }`}
          >
            {isUploading ? "Uploading..." : src ? "Update image" : "Upload image"}
          </button>
          {src && showActions && (
            <div className="absolute top-full left-1/2 mt-2 flex w-24 -translate-x-1/2 flex-col rounded-sm border border-zinc-700 bg-zinc-950 shadow-lg sm:w-32">
              <button
                type="button"
                onClick={handleOpenUpload}
                className="w-full cursor-pointer px-2 py-2 text-left text-[11px] font-bold text-white transition-colors hover:text-gray-300 sm:px-3 sm:text-[14px]"
              >
                Replace image
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full cursor-pointer px-2 py-2 text-left text-[11px] font-bold text-white transition-colors hover:text-gray-300 sm:px-3 sm:text-[14px]"
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

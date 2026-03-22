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
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    setPreviewUrl(null);
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
      className="relative header-container flex items-center w-full h-32 sm:h-44 md:h-56 lg:h-64
                  bg-[linear-gradient(315deg,rgb(186,191,190)_0%,rgb(125,74,80)_100%)]"
    >
      {src && (
        <img
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
        <div className="absolute top-8 right-7 z-10 flex gap-2">
          <button
            type="button"
            onClick={handleOpenUpload}
            className="bg-black text-white font-bold text-[14px] px-2 py-1 rounded-sm cursor-pointer hover:text-gray-400 transition-colors"
          >
            Upload header image
          </button>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="bg-black text-white font-bold text-[14px] px-2 py-1 rounded-sm cursor-pointer hover:text-gray-400 transition-colors"
          >
            Delete header image
          </button>
          <input
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

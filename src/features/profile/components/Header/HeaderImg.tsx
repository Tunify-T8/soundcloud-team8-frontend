import { useState } from "react";
import { profileService } from "../../profileService";

export default function HeaderImg({
  coverUrl,
  isEditable,
}: {
  coverUrl?: string;
  isEditable?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      try {
        await profileService.updateMeProfile({
          coverUrl: URL.createObjectURL(file),
        });
      } catch (err) {
        console.error("Failed to update cover image", err);
      }
    }
  }

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
      {isEditable && (
        <label className="absolute top-8 right-7 z-10 bg-black text-white font-bold text-[14px] px-2 py-1 rounded-sm cursor-pointer hover:text-gray-400 transition-colors">
          Upload header image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  );
}

import { useState } from "react";

export default function Avatar() {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="relative w-full h-full rounded-full bg-gray-300 overflow-hidden group">
      {preview ? (
        <img
          src={preview}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
          AB
        </div>
      )}
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
        <span className="bg-black text-white font-bold text-[14px] px-2 py-1 rounded-sm hover:text-gray-400 transition-colors">
          Update image
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}

import { useState } from "react";
import { profileService } from "../../profileService";
import { useEffect } from "react";
import type { User } from "../../../../shared/types/User";

export default function Avatar() {
  // const [preview, setPreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (file) setPreview(URL.createObjectURL(file));
  // }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await profileService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="relative w-full h-full rounded-full bg-gray-300 overflow-hidden group">
      {user?.avatarUrl ? (
        <img
          src={user?.avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
          {user?.displayName?.charAt(0)}
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
          onChange={() => {}}
        />
      </label>
    </div>
  );
}

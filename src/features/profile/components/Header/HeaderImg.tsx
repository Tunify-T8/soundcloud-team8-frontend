import { useState } from "react";
import { profileService } from "../../profileService";
import { useEffect } from "react";
import type { User } from "../../../../shared/types/User";

export default function HeaderImg() {
  // const [src, setSrc] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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


  // function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (file) setSrc(URL.createObjectURL(file));
  // }

  return (
    <div
      className="relative header-container flex items-center w-full h-32 sm:h-44 md:h-56 lg:h-64
                    bg-[linear-gradient(315deg,rgb(186,191,190)_0%,rgb(125,74,80)_100%)]"
    >
      {user?.coverUrl && (
        <img
          src={user?.coverUrl}
          alt="Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <label className="absolute top-8 right-7 z-10 bg-black text-white font-bold text-[14px] px-2 py-1 rounded-sm cursor-pointer hover:text-gray-400 transition-colors">
        Upload header image
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

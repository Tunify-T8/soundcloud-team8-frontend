import { MdVerified } from "react-icons/md";
export default function UserDetails({
  displayName,
  username,
  country,
  city,
  isCertified,
}: {
  displayName?: string;
  username?: string;
  country?: string;
  city?: string;
  isCertified?: boolean;
}) {
  return (
    <div className="ml-6">
      <div>
        {displayName && (
          <span className="inline-flex items-center bg-black text-white font-bold text-2xl md:text-3xl lg:text-3xl px-2">
            {displayName}
            {isCertified && (
              <MdVerified
                className="inline-block text-blue-500 ml-2"
                size={20}
              />
            )}
          </span>
        )}
      </div>
      <div>
        {username && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-[16px] px-2 py-1">
            {username}
          </span>
        )}
      </div>
      <div className="mt-3">
        {country && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-[16px] pl-2 py-1">
            {country},
          </span>
        )}
        {city && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-[16px] pr-2 pl-1 py-1">
            {city}
          </span>
        )}
      </div>
    </div>
  );
}

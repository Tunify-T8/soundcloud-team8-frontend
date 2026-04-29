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
    <div className="min-w-0 max-w-[calc(100vw-7rem)] sm:max-w-[calc(100vw-10rem)] lg:max-w-none">
      <div>
        {displayName && (
          <span className="inline-flex max-w-full items-center truncate bg-black px-2 text-sm font-bold text-white sm:text-xl md:text-3xl lg:text-3xl">
            {displayName}
            {isCertified && (
              <MdVerified
                className="inline-block text-blue-500 ml-2"
                size={16}
              />
            )}
          </span>
        )}
      </div>
      <div>
        {username && (
          <span className="inline-block max-w-full truncate bg-black px-2 py-1 text-xs font-bold text-gray-400 sm:text-sm md:text-[16px]">
            {username}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap">
        {country && (
          <span className="bg-black py-1 pl-2 text-xs font-bold text-gray-400 sm:text-sm md:text-[16px]">
            {country},
          </span>
        )}
        {city && (
          <span className="bg-black py-1 pl-1 pr-2 text-xs font-bold text-gray-400 sm:text-sm md:text-[16px]">
            {city}
          </span>
        )}
      </div>
    </div>
  );
}

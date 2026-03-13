export default function UserName({
  displayName,
  username,
  country,
  city,
}: {
  displayName?: string;
  username?: string;
  country?: string;
  city?: string;
}) {
  return (
    <div className="ml-6">
      <div>
        {displayName && (
          <span className="bg-black text-white font-bold text-2xl md:text-3xl lg:text-4xl px-2">
            {displayName}
          </span>
        )}
      </div>
      <div>
        {username && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-lg px-2 py-1">
            {username}
          </span>
        )}
      </div>
      <div className="mt-3">
        {country && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-lg pl-2 py-1">
            {country},
          </span>
        )}
        {city && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-lg pr-2 pl-1 py-1">
            {city}
          </span>
        )}
      </div>
    </div>
  );
}

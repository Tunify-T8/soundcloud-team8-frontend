export default function UserName({
  name,
  username,
  location,
}: {
  name?: string;
  username?: string;
  location?: string;
}) {
  return (
    <div className="ml-6">
      <div>
        {name && (
          <span className="bg-black text-white font-bold text-2xl md:text-3xl lg:text-4xl px-2">
            {name}
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
        {location && (
          <span className="bg-black font-bold text-gray-400 text-base md:text-lg px-2 py-1">
            {location}
          </span>
        )}
      </div>
    </div>
  );
}

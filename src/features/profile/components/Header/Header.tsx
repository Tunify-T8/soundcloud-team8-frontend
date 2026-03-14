import Avatar from "./Avatar";
import UserDetails from "./UserDetails";
import HeaderImg from "./HeaderImg";

export default function Header({
  displayName,
  username,
  country,
  city,
  isVerified,
}: {
  displayName?: string;
  username?: string;
  country?: string;
  city?: string;
  isVerified?: boolean;
}) {
  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative w-10/12">
        <HeaderImg />
        <div className="absolute bottom-0 left-4 md:left-6 flex items-center h-full">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300">
            <Avatar />
          </div>
          <UserDetails displayName={displayName} username={username} country={country} city={city} isVerified={isVerified} />
        </div>
      </div>
    </div>
  );
}

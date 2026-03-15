import Avatar from "./Avatar";
import UserDetails from "./UserDetails";
import HeaderImg from "./HeaderImg";

export default function Header({
  displayName,
  username,
  country,
  city,
  isVerified,
  avatarUrl,
  coverUrl,
  isEditable,
}: {
  displayName?: string;
  username?: string;
  country?: string;
  city?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  isEditable?: boolean;
}) {
  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative w-10/12">
        <HeaderImg coverUrl={coverUrl} isEditable={isEditable} />
        <div className="absolute bottom-0 left-4 md:left-6 flex items-center h-full">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300">
            <Avatar avatarUrl={avatarUrl} displayName={displayName} isEditable={isEditable} />
          </div>
          <UserDetails
            displayName={displayName}
            username={username}
            country={country}
            city={city}
            isVerified={isVerified}
          />
        </div>
      </div>
    </div>
  );
}

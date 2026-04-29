import Avatar from "./Avatar";
import UserDetails from "./UserDetails";
import HeaderImg from "./HeaderImg";

export default function Header({
  displayName,
  username,
  country,
  city,
  isCertified,
  avatarUrl,
  coverUrl,
  isMe,
  onProfileUpdated,
}: {
  displayName?: string;
  username?: string;
  country?: string;
  city?: string;
  isCertified?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  isMe?: boolean;
  onProfileUpdated?: () => void;
}) {
  return (
    <div className="item-center flex w-full justify-center">
      <div className="relative w-full">
        <HeaderImg
          coverUrl={coverUrl}
          isMe={isMe}
          onProfileUpdated={onProfileUpdated}
        />
        <div className="absolute left-3 right-3 top-1/2 flex -translate-y-1/2 items-center gap-3 sm:left-4 sm:right-6 sm:gap-4 md:left-6 md:right-10">
          <div className="h-16 w-16 shrink-0 rounded-full bg-gray-300 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40">
            <Avatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              isMe={isMe}
              onProfileUpdated={onProfileUpdated}
            />
          </div>
          <UserDetails
            displayName={displayName}
            username={username}
            country={country}
            city={city}
            isCertified={isCertified}
          />
        </div>
      </div>
    </div>
  );
}

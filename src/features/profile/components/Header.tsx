import Avatar from "./Avatar";
import UserName from "./UserName";
import HeaderImg from "./HeaderImg";

export default function Header({
  name,
  username,
}: {
  name?: string;
  username?: string;
}) {
  return (
    <div className="item-center flex justify-center w-full">
      <div className="relative w-10/12">
        <HeaderImg />
        <div className="absolute bottom-0 left-4 md:left-6 flex items-center h-full">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300">
            <Avatar />
          </div>
          <UserName name={name} username={username} />
        </div>
      </div>
    </div>
  );
}

import Header from "../components/Header/Header";
import UserInfoBar from "../components/UserInfo/UserInfoBar";
import UserInfo from "../components/UserInfo/UserInfo";
import { Outlet } from "react-router-dom";
export default function ProfilePage() {
  return (
    <div className="min-h-screen text-white">
      <Header displayName="John Doe" username="johndoe" country="Egypt" city="Cairo" />
      <div className="relative">
        <UserInfoBar displayName="John Doe" country="Egypt" city="Cairo" bio="In a dark kitchen in the middle of a sweaty night in Las Vegas, all 6’4” of Dan Reynolds is hunched over a laptop, slapping beats on the table and crooning lyrics into a tiny microphone. Before long, he and the other three members of indie rock band Imagine Dragons" />
        <div className="absolute right-[8.333333%] top-full mt-4">
          <UserInfo
            followers={2}
            following={1}
            tracks={0}
            bio="In a dark kitchen in the middle of a sweaty night in Las Vegas, all 6’4” of Dan Reynolds is hunched over a laptop, slapping beats on the table and crooning lyrics into a tiny microphone. Before long, he and the other three members of indie rock band Imagine Dragons"
            socialAccounts={{
              facebook: "https://facebook.com/johndoe",
              instagram: "https://instagram.com/johndoe",
              twitter: "https://twitter.com/johndoe",
              youtube: "https://youtube.com/johndoe",
            }}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}

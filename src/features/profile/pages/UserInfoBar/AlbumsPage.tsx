import { useParams } from "react-router-dom";
import { useMe } from "@/features/profile/context/useMe";
import ProfileAlbumsSection from "@/features/profile/components/UserInfo/ProfileAlbumsSection";

export default function AlbumsPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const isMeView = !username || username === me?.username;

  return (
    <div data-testid="profile-albums-page" className="w-full min-h-screen bg-[#0b0b0b] text-white">
      <div data-testid="profile-albums-page-content" className="w-full">
        <ProfileAlbumsSection
          username={username}
          isMeView={isMeView}
          meDisplayName={me?.displayName}
          meUsername={me?.username}
        />
      </div>
    </div>
  );
}

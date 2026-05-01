import Spotlight from "@/features/premium/components/Spotlight";
import { useParams } from "react-router-dom";
import { useMe } from "@/features/profile/context/useMe";
import ProfilePlaylistsSection from "@/features/profile/components/UserInfo/ProfilePlaylistsSection";
import ProfileAlbumsSection from "@/features/profile/components/UserInfo/ProfileAlbumsSection";
import ProfileTracksSection from "@/features/profile/components/UserInfo/ProfileTracksSection";
import ProfileRepostsSection from "@/features/profile/components/UserInfo/ProfileRepostsSection";

export default function AllTabPage() {
  const { username } = useParams<{ username: string }>();
  const { me } = useMe();
  const isMeView = !username || username === me?.username;

  return (
    <div data-testid="profile-all-tab-page" className="w-full">
      <div data-testid="profile-all-tab-content" className="w-full">
        <Spotlight isMe={true} />
        <ProfileTracksSection
          username={username}
          isMeView={isMeView}
          meDisplayName={me?.displayName}
          meUsername={me?.username}
          hideEmptyState
        />
        <ProfileAlbumsSection
          username={username}
          isMeView={isMeView}
          meDisplayName={me?.displayName}
          meUsername={me?.username}
          sortOrder="asc"
          className="mt-8"
          hideEmptyState
        />
        <ProfilePlaylistsSection
          username={username}
          isMeView={isMeView}
          meDisplayName={me?.displayName}
          meUsername={me?.username}
          className=""
          hideEmptyState
        />
        <ProfileRepostsSection
          isMeView={isMeView}
          meDisplayName={me?.displayName}
          meUsername={me?.username}
          hideEmptyState
        />
      </div>
    </div>
  );
}

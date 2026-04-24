import NavBar from "./components/layout/Navbar";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import UploadPage from "./features/upload/pages/UploadPage";
import ArtistsPage from "./features/track-management/pages/ArtistsPage";
import ProfilePage from "./features/profile/pages/ProfilePage";
import PopularTracksPage from "./features/profile/pages/UserInfoBar/PopularTracksPage";
import TracksPage from "./features/profile/pages/UserInfoBar/TracksPage";
import AlbumsPage from "./features/profile/pages/UserInfoBar/AlbumsPage";
import PlaylistsPage from "./features/profile/pages/UserInfoBar/PlaylistsPage";
import ProfileRepostsPage from "./features/profile/pages/UserInfoBar/RepostsPage";
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import MessagesPage from "./features/conversation/pages/MessagesPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import { ProfileProvider } from "./features/profile/context/ProfileContext";
import useRestoreSession from "./hooks/useRestoreSession";
import { PlayerProvider } from "./features/playerUI/context/PlayerProvider";
import PlayerBar from "./features/playerUI/components/PlayerBar";
import { usePlayer } from "./features/playerUI/context/usePlayer";

import FeedPage from "./features/feed/pages/FeedPage";
import FollowersPage from "./features/following/pages/FollowersPage";
import FollowingPage from "./features/following/pages/FollowingPage";
import WhoToFollowPage from "./features/following/pages/WhoToFollowPage";
import DiscoverPage from "./features/discover/pages/DiscoverPage";
import SearchPage from "./features/feed/pages/SearchPage";
import LibraryPage from "./features/library/pages/LibraryPage";

import PlansPage from "./features/premium/pages/PlansPage";
import AllTabPage from  "./features/profile/pages/UserInfoBar/AllTabPage";
import InsightsOverviewPage from "./features/insights/components/InsightsOverviewPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/discover" replace />,
  },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  {
    path: "/signin",
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/create-account",
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ProfileProvider>
          <NavBar />
        </ProfileProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/discover",
        element: <DiscoverPage />,
      },
      {
        path: "/messages",
        element: <MessagesPage />,
      },
      {
        path: "/feed",
        element: <FeedPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: '/library',
        element: <LibraryPage />
      },
      {
        path: '/me/likes',
        element: <LibraryPage />
      },
      {
        path: '/me/albums',
        element: <LibraryPage />
      },
      {
        path: '/me/sets',
        element: <LibraryPage />
      },
      {
        path: '/me/stations',
        element: <LibraryPage />
      },
       {
        path: '/me/following',
        element: <LibraryPage />
      },
      {
        path: '/me/history',
        element: <LibraryPage />
      },
      {
        path: "/me",
        element: <ProfilePage />,
        children: [
          { path: "", element: <AllTabPage /> },
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <TracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "reposts", element: <ProfileRepostsPage /> },
        ],
      },
      { path: "/me/insights/overview", element: <InsightsOverviewPage /> },
      { path: "/me/insights/all-platforms", element: <InsightsOverviewPage /> },
      { path: "/me/insights/fanz", element: <InsightsOverviewPage /> },
      {
        path: "/:username",
        element: <ProfilePage />,
        children: [
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <TracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "reposts", element: <ProfileRepostsPage /> },
        ],
      },
      {
        path: "/me/followers",
        element: <FollowersPage />,
      },
      {
        path: "/me/following",
        element: <FollowingPage />,
      },
      {
        path: "/who-to-follow",
        element: <WhoToFollowPage />,
      },
      {
        path: "/:username/followers",
        element: <FollowersPage />,
      },
      {
        path: "/:username/following",
        element: <FollowingPage />,
      },
      
    ],
  },
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <UploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/artists",
    element: (
      <ProtectedRoute>
        <ProfileProvider>
          <ArtistsPage />
        </ProfileProvider>
      </ProtectedRoute>
    ),
  },
  {
        path: "/plans",
        element: (
          <ProfileProvider>
            <PlansPage />
          </ProfileProvider>
        )
      }
]);

function App() {
  useRestoreSession();
  return (
    <PlayerProvider>
      <RouterProvider router={router} />
      <PlayerBarWrapper />
    </PlayerProvider>
  );
}

// Reads from context — only renders when a track is selected
function PlayerBarWrapper() {
  const { currentTrack } = usePlayer();
  if (!currentTrack) return null;

  return (
    <PlayerBar/>
  );
}
export default App;
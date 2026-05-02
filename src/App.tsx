import NavBar from "./components/layout/Navbar";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import LikesPage from "./features/engagement/pages/LikesPage";
import RepostsPage from "./features/engagement/pages/RepostsPage";
import TrackPage from "./features/engagement/pages/TrackPage";
import UploadPage from "./features/upload/pages/UploadPage";
import ArtistsPage from "./features/track-management/pages/ArtistsPage";
import ProfilePage from "./features/profile/pages/ProfilePage";
import PopularTracksPage from "./features/profile/pages/UserInfoBar/PopularTracksPage";
import ProfileTracksPage from "./features/profile/pages/UserInfoBar/ProfileTracksPage";
import AlbumsPage from "./features/profile/pages/UserInfoBar/AlbumsPage";
import PlaylistsPage from "./features/profile/pages/UserInfoBar/PlaylistsPage";
import ProfileRepostsPage from "./features/profile/pages/UserInfoBar/RepostsPage";
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import SignedOutPage from "./features/auth/pages/SignedOutPage";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import MessagesPage from "./features/conversation/pages/MessagesPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import { ProfileProvider } from "./features/profile/context/ProfileContext";
import useRestoreSession from "./hooks/useRestoreSession";
import { PlayerProvider } from "./features/playerUI/context/PlayerProvider";
import PlayerBar from "./features/playerUI/components/PlayerBar";
import { usePlayer } from "./features/playerUI/context/usePlayer";
import PlaylistPage from "./features/library/tabs/playlists/pages/PlaylistPage";
import FeedPage from "./features/feed/pages/FeedPage";
import FollowersPage from "./features/following/pages/FollowersPage";
import FollowingPage from "./features/following/pages/FollowingPage";
import WhoToFollowPage from "./features/following/pages/WhoToFollowPage";
import UserLikesPage from "./features/following/pages/UserLikesPage";
import DiscoverPage from "./features/discover/pages/DiscoverPage";
import SearchPage from "./features/feed/pages/SearchPage";
import LibraryPage from "./features/library/pages/LibraryPage";
import NotificationsPage from "./features/notifications/pages/NotificationPage";
import InsightsOverviewPage from "./features/insights/components/InsightsOverviewPage";
import PlansPage from "./features/premium/pages/PlansPage";
import AllTabPage from "./features/profile/pages/UserInfoBar/AllTabPage";
import { AdPopup } from "./features/premium/components/AdPopUp";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AdminReportsPage from "./features/admin/pages/AdminReportsPage";
import AdminContentPage from "./features/admin/pages/AdminContentPage";
import AdminUsersPage from "./features/admin/pages/AdminUsersPage";
import SettingsPage from "./features/settings/SettingsPage";
import VerificationPage from "./features/settings/VerificationPage";
import SoundCloudLanding from "./features/landing/pages/landingPage";
import PlanCard from "./features/premium/pages/PlanCard";

const router = createBrowserRouter([
  // 1. PUBLIC ROUTES (Guests only)
  // These handle the "/" path correctly for users who aren't logged in.
  {
    path: "/",
    element: (
      <PublicOnlyRoute>
        <SoundCloudLanding />
      </PublicOnlyRoute>
    ),
  },
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
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  // 2. MAIN APP SHELL (Authenticated users)
  {
    path: "/signed-out",
    element: (
      <PublicOnlyRoute>
        <SignedOutPage />
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
          <AdPopup />
          <Outlet />
        </ProfileProvider>
      </ProtectedRoute>
    ),
    children: [
      // This index route ensures that if a logged-in user hits "/", 
      // they are instantly moved to /discover.
      {
        
        element: <Navigate to="/discover" replace />,
      },
      { path: "/discover", element: <DiscoverPage /> },
      { path: "/feed", element: <FeedPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      {
        path: "/settings",
        element: <SettingsPage />,
        children: [
          { path: "content", element: <SettingsPage /> },
          { path: "notifications", element: <SettingsPage /> },
          { path: "privacy", element: <SettingsPage /> },
          { path: "advertising", element: <SettingsPage /> },
          { path: "security", element: <SettingsPage /> },
        ]
      },
      { path: "/settings/verification", element: <VerificationPage /> },
      { path: "/messages", element: <MessagesPage /> },
      { path: "/messages/:conversationId", element: <MessagesPage /> },
      
      { path: "/tracks/:trackId", element: <TrackPage /> },
      { path: "/tracks/:trackId/likes", element: <LikesPage /> },
      { path: "/tracks/:trackId/reposts", element: <RepostsPage /> },
      { path: "/search", element: <SearchPage /> },
      {
        path: "/library",
        element: <LibraryPage />,
        children: [{ path: "albums", element: <LibraryPage /> }]
      },
      { path: "/me/likes", element: <LibraryPage /> },
      { path: "/me/sets", element: <LibraryPage /> },
      { path: "/me/stations", element: <LibraryPage /> },
      { path: "/me/following", element: <LibraryPage /> },
      { path: "/me/history", element: <LibraryPage /> },
      { path: "/me/downloads", element: <LibraryPage /> },
      { path: "/collections/:id", element: <PlaylistPage /> },
      { path: "/playlist/:id", element: <PlaylistPage /> },
      { path: "/collections/token/:token", element: <PlaylistPage /> },
      { path: "/subscriptions", element: <PlanCard /> },
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/reports",
        element: (
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/content",
        element: (
          <AdminRoute>
            <AdminContentPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        ),
      },
      {
        path: "/me",
        element: <ProfilePage />,
        children: [
          { path: "", element: <AllTabPage /> },
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <ProfileTracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> }, // Update this if import path was wrong
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
          { path: "", element: <AllTabPage /> },
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <ProfileTracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "reposts", element: <ProfileRepostsPage /> },
        ],
      },
      { path: "/who-to-follow", element: <WhoToFollowPage /> },
      { path: "/:username/likes", element: <UserLikesPage /> },
      { path: "/:username/followers", element: <FollowersPage /> },
      { path: "/:username/following", element: <FollowingPage /> },
    ],
  },

  // 3. SPECIAL INDEPENDENT ROUTES
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <ProfileProvider>
          <UploadPage />
        </ProfileProvider>
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

function PlayerBarWrapper() {
  const { currentTrack } = usePlayer();
  if (!currentTrack) return null;
  return <PlayerBar />;
}

export default App;

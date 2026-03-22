import NavBar from "./components/layout/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SideBar from "./components/layout/Sidebar";
import LikesPage from "./features/engagement/pages/LikesPage"
import RepostsPage from "./features/engagement/pages/RepostsPage"
import UploadPage from "./features/upload/pages/UploadPage";
import ArtistsPage from "./features/track-management/pages/ArtistsPage";
import ProfilePage from "./features/profile/pages/ProfilePage"
import PopularTracksPage from "./features/profile/pages/UserInfoBar/PopularTracksPage"
import TracksPage from "./features/profile/pages/UserInfoBar/TracksPage"
import AlbumsPage from "./features/profile/pages/UserInfoBar/AlbumsPage"
import PlaylistsPage from "./features/profile/pages/UserInfoBar/PlaylistsPage"
import ProfileRepostsPage from "./features/profile/pages/UserInfoBar/RepostsPage"
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";

import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage"
import MessagesPage from "./features/conversation/pages/MessagesPage"
import ProtectedRoute from "./routes/ProtectedRoute"
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage"

const router = createBrowserRouter([
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    path: '/signin',
    element: <SignInPage key={Math.random()} />,
  },
  {
    path: "/create-account",
    element: <SignUpPage key={Math.random()} />,
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
        <NavBar />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <SideBar />,
      },
      {
        path: '/messages',
        element: <MessagesPage />
      },
      // {
      //   path: '/:artist/:songName',
      //   element: <TrackPage />
      // },
      {
        path: '/:artist/:songName/likes',
        element: <LikesPage />
      },
      {
        path: '/:artist/:songName/reposts',
        element: <RepostsPage />
      },
      {
        path: "/me",
        element: <ProfilePage />,
        children: [
          { index: true },
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <TracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "reposts", element: <ProfileRepostsPage /> },
        ],
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
        <ArtistsPage />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
<<<<<<< feature/user-profile
import NavBar from "./components/layout/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SideBar from "./components/layout/Sidebar";
import ProfilePage from "./features/profile/pages/ProfilePage";
import PopularTracksPage from "./features/profile/pages/UserInfoBar/PopularTracksPage";
import TracksPage from "./features/profile/pages/UserInfoBar/TracksPage";
import AlbumsPage from "./features/profile/pages/UserInfoBar/AlbumsPage";
import PlaylistsPage from "./features/profile/pages/UserInfoBar/PlaylistsPage";
import RepostsPage from "./features/profile/pages/UserInfoBar/RepostsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <SideBar />,
      },
      {
        path: "/:username",
        element: <ProfilePage />,
        children: [
          { index: true },
          { path: "popular-tracks", element: <PopularTracksPage /> },
          { path: "tracks", element: <TracksPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "reposts", element: <RepostsPage /> },
        ],
      },
    ],
  },
]);
=======
import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import UploadPage from "./features/upload/pages/UploadPage"
import ArtistsPage from "./features/track-management/pages/ArtistsPage"

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavBar />,
    children: [
      {
        path: '/',
        element: <SideBar />
      }
    ]
  },
  {
    path: '/upload',
    element: <UploadPage />
  },
  {
    path: '/artists',
    element: <ArtistsPage />
  }
])

>>>>>>> dev
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

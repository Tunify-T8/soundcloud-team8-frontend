import NavBar from "./components/layout/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SideBar from "./components/layout/Sidebar";
import ProfilePage from "./features/profile/pages/ProfilePage";
import PopularTracksPage from "./features/profile/pages/Menu/PopularTracksPage";
import TracksPage from "./features/profile/pages/Menu/TracksPage";
import AlbumsPage from "./features/profile/pages/Menu/AlbumsPage";
import PlaylistsPage from "./features/profile/pages/Menu/PlaylistsPage";
import RepostsPage from "./features/profile/pages/Menu/RepostsPage";

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
        path: "/username",
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
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

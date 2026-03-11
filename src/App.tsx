import NavBar from "./components/layout/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SideBar from "./components/layout/Sidebar";
import ProfilePage from "./features/profile/pages/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <SideBar />,
      },
      { path: "/profile/:userId", element: <ProfilePage /> },
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

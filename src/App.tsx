import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import TrackPage from "./features/engagement/pages/TrackPage"
import LikesPage from "./features/engagement/pages/LikesPage"
import RepostsPage from "./features/engagement/pages/RepostsPage"

const router = createBrowserRouter([
  {
    path:'/',
    element:<NavBar/>,
    children:[
      {
        path:'/',
        element:<SideBar/>
      },
      {
        path: '/:artist/:songName',
        element: <TrackPage />
      },
      {
        path: '/:artist/:songName/likes',
        element: <LikesPage />
      },
      {
        path: '/:artist/:songName/reposts',
        element: <RepostsPage />
      }
    ]
  }
])

function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App

import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import ArtistsPage from "./features/track-management/pages/ArtistsPage"

const router = createBrowserRouter([{
  path:'/',
  element:<NavBar/>,
  children:[{
    path:'/',
    element:<SideBar/>
  } , 
{
  path:'/artists'
,element:<ArtistsPage/>
}]
}])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

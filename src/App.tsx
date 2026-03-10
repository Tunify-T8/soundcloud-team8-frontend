import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"

const router = createBrowserRouter([{
  path:'/',
  element:<NavBar/>,
  children:[{
    path:'/',
    element:<SideBar/>
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

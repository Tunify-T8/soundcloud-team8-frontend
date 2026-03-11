import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import UploadPage from "./features/upload/pages/UploadPage"

const router = createBrowserRouter([{
  path:'/',
  element:<NavBar/>,
  children:[{
    path:'/',
    element:<SideBar/>
  }]
} , 
{
  path:'/upload'
,element:<UploadPage/>
}])
function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App

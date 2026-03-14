import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import MessagesPage from "./features/conversation/pages/MessagesPage"

const router = createBrowserRouter([{
  path:'/',
  element:<NavBar/>,
  children:[{
    path:'/',
    element:<SideBar/>
  }, {
    path:'/messages',
    element:<MessagesPage/>
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

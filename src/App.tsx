import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"

const router = createBrowserRouter([{
  path:'/',
  element:<NavBar/>,
}])
function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App

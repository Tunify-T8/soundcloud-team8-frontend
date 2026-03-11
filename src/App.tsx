import NavBar from "./components/layout/Navbar"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"

const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignInPage key={Math.random()} />,
  },
   {
    path: '/create-account',
    element: <SignUpPage key={Math.random()} />,
  },
  {
    path: '/',
    element: <NavBar />,
    children: [
      {
        path: '/',
        element: <SideBar />
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
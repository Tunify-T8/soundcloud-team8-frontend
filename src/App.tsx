import NavBar from "./components/layout/Navbar"
import { createBrowserRouter , RouterProvider } from "react-router-dom"
import SideBar from "./components/layout/Sidebar"
import TrackCard from "./features/track-management/components/TrackCard"
import { Genre } from "./shared/types/Genre"

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
    <TrackCard
  track={{
    id: "1",
    title: "testUpload",
   // artist: "Nada Serag",
    duration: 2,
    date: "Mar 10, 2026",
    isHD: true,
    isPrivate: true,
    engagements: { likes: null, comments: null, reposts: null, downloads: null, plays: 0 },
    genre: Genre.ROCK,
    visibility: 'public',
    status: 'finished',
    audioUrl: '',
    description: '',
    tags: [],
  }}
/>
    </>
  )
}

export default App

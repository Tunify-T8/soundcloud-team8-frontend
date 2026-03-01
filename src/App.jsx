import { useState } from 'react'
import {  RouterProvider,createBrowserRouter } from "react-router";
import './App.css'
import MainHome from './Componats/MainHome';
import Home from './Componats/Home';


let router = createBrowserRouter([
  {path:"/",
    element: <MainHome/>, 
    children:[{
      path:"/home",
      element:<Home/>

    }]
  }
])

function App() {
  const [count, setCount] = useState(0)

  return (
   
   <RouterProvider router={router} />
  )
}

export default App

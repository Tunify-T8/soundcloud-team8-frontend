import { Link } from "react-router-dom"
import { SiSoundcloud } from "react-icons/si"
import { Bell, Mail, Upload, Search } from "lucide-react"
import NewLink from './NewLink'

export default function NavBar() {
  return (
    <nav className="h-12 bg-black border-b border-zinc-800">
      <div className="max-w-350 mx-auto px-6 flex items-center  h-full">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <SiSoundcloud className="text-[#ff5500] text-2xl" />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 text-sm">
            <NewLink to="/home">Home</NewLink>
            <NewLink to="/feed">Feed</NewLink>
            <NewLink to="/library">Library</NewLink>
          </div>

          {/* Search */}
          <div className="relative ml-6">
            <input
              type="text"
              placeholder="Search"
              className="w-100 bg-[#121212] text-white text-sm px-4 mr-6 py-1 rounded-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
            <Search
              size={16}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 text-sm">

          <Link
            to="/pro"
            className="text-[#ff5500] font-medium hover:opacity-80 transition"
          >
            Try Artist Pro
          </Link>

          <Link
            to="/artists"
            className="text-zinc-400 hover:text-white transition"
          >
            For Artists
          </Link>

          <Link
            to="/upload"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
          >
            <Upload size={16} />
            Upload
          </Link>

          <button className="text-zinc-400 hover:text-white transition">
            <Bell size={18} />
          </button>

          <button className="text-zinc-400 hover:text-white transition">
            <Mail size={18} />
          </button>

          {/* Profile */}
          <div className="w-7 h-7 rounded-full bg-zinc-600 hover:opacity-80 cursor-pointer transition" />
        </div>
      </div>
    </nav>
  )
}


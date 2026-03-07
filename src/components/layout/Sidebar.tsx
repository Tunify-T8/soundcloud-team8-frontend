import { useState } from "react"
import { HiOutlineSpeakerphone } from "react-icons/hi"
import { FiRefreshCcw } from "react-icons/fi"
import { TbWorld } from "react-icons/tb"
import { MdOutlineAutoFixHigh } from "react-icons/md"
import { IoAddCircle } from "react-icons/io5"
import { IoChevronDown } from "react-icons/io5"
export default function SideBar(){
    const [open, setOpen] = useState(true)

    return( 
<header className=" flex flex-col justify-end mt-2">
    <div className="ml-auto flex flex-col w-1xl mr-25 ">

     <div className="w-full">

      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between
        cursor-pointer text-xs text-zinc-400
        font-semibold tracking-wide mb-3"
      >
        <span>ARTIST TOOLS</span>

        <IoChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* DEFAULT TOOLS */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Tool icon={<HiOutlineSpeakerphone size={20} />} label="Amplify" />
        <Tool icon={<FiRefreshCcw size={20} />} label="Replace" />
        <Tool icon={<TbWorld size={20} />} label="Distribute" />
        <Tool icon={<MdOutlineAutoFixHigh size={20} />} label="Master" />
      </div>

      {/* DROPDOWN TOOLS */}
      {open && (
        <div className="grid grid-cols-4 gap-3">
          <Tool icon={<HiOutlineSpeakerphone size={20} />} label="Promote" />
          <Tool icon={<FiRefreshCcw size={20} />} label="Insights" />
          <Tool icon={<TbWorld size={20} />} label="Monetize" />
          <Tool icon={<MdOutlineAutoFixHigh size={20} />} label="Pro Tools" />
        </div>
      )}
    </div>


    </div>

 </header>
    )
}
type ToolProps = {
  icon: React.ReactNode
  label: string
}

function Tool({ icon, label }: ToolProps) {
  return (
    <div
      className="
      relative
      flex flex-col items-center justify-center
      w-[70px] h-[70px]
      bg-zinc-950
      border border-zinc-800
      rounded-lg
      hover:bg-zinc-900
      hover:border-zinc-700
      cursor-pointer
      transition
      "
    >
      {/* purple add badge */}
      <IoAddCircle
        size={14}
        className="absolute top-1 right-1 text-purple-500"
      />

      <div className="text-zinc-300">{icon}</div>

      <span className="text-[11px] mt-1 text-zinc-400">
        {label}
      </span>
    </div>
  )
}
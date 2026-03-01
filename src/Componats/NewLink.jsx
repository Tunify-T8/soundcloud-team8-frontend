import { NavLink } from "react-router"
export default function RouteLink({to , children}){
    return <NavLink 
  to={to}
  className={({ isActive }) =>
    `relative font-medium text-sm transition-colors duration-200c  ${
      isActive
        ? "text-white after:absolute after:left-0 after:-bottom-4 after:h-0.5 after:w-full after:bg-white"
        : "text-zinc-400 hover:text-white"
    }`
  }
>
  {children}
</NavLink>
}
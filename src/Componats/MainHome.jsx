import NavBar from "./NavBar";
import { Outlet } from "react-router";

export default function MainHome(){
    return(
        <div>
            <NavBar />
            <Outlet />

        </div>
    )

}
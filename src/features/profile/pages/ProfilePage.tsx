import Header from "../components/Header/Header";
import Menu from "../components/Menu/Menu";
import { Outlet } from "react-router-dom";
export default function ProfilePage() {
  return (
    <div className="min-h-screen text-white">
      <Header name="John Doe" username="johndoe" location="Egypt"/>
      <section>
        <Menu />
      </section>
      <Outlet />
    </div>
  );
}

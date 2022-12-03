import { useNavigate } from "react-router-dom";
import { RegisteredUserNav } from "./RegisteredUserNav";
import { GuestUserNav } from "./GuestUserNav";
import "./NavBar.css";

export const NavBar = () => {
  const navigate = useNavigate();
  const appUser = JSON.parse(localStorage.getItem("app_user"));

  if (appUser.isRegisteredUser) {
    return <RegisteredUserNav />;
  } else {
    return <GuestUserNav />;
  }
};

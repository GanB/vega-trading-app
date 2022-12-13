import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

export const GuestUserNav = () => {
  const navigate = useNavigate();
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));

  return (
    <ul className="navbar">
      <li className="navbar__item active">
        <Link className="navbar__link" to="/guest-home">
          Home
        </Link>
      </li>
      {/* <li className="navbar__item active">
        <Link className="navbar__link" to="/profile">
          Profile
        </Link>
      </li> */}
      {sessionStorage.getItem("app_user") ? (
        <li className="navbar__item navbar__logout">
          <Link
            className="navbar__link"
            to=""
            onClick={() => {
              sessionStorage.removeItem("app_user");
              navigate("/", { replace: true });
            }}
          >
            Logout
          </Link>
        </li>
      ) : (
        ""
      )}
    </ul>
  );
};

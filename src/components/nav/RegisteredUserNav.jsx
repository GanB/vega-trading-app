import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

export const RegisteredUserNav = () => {
  const navigate = useNavigate();
  const appUser = JSON.parse(localStorage.getItem("app_user"));

  return (
    <ul className="navbar">
      <li className="navbar__item active">
        <Link className="navbar__link" to="/account-home">
          Home
        </Link>
      </li>
      <li className="navbar__item active">
        <Link className="navbar__link" to="/trade">
          Trade
        </Link>
      </li>
      <li className="navbar__item active">
        <Link className="navbar__link" to="/watchlist">
          Watchlist
        </Link>
      </li>
      <li className="navbar__item active">
        <Link className="navbar__link" to="/profile">
          Profile
        </Link>
      </li>
      {appUser ? (
        <li className="navbar__item navbar__logout">
          <Link
            className="navbar__link"
            to=""
            onClick={() => {
              localStorage.removeItem("app_user");
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

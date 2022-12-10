import { Outlet, Route, Routes } from "react-router-dom";
import { Logout } from "../auth/Logout";
import { RegisteredUserHome } from "../home/RegisteredUserHome";
import { Profile } from "../profiles/Profile";
import { Trade } from "../trades/Trade";
import { Watchlist } from "../watchlists/Watchlist";

export const RegisteredUserViews = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <h1>Welcome, Registered User</h1>

            <Outlet />
          </>
        }
      >
        <Route path="home" element={<RegisteredUserHome />} />
        <Route path="trade" element={<Trade />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="profile" element={<Profile />} />
        {/* <Route path="logout" element={<Logout />} /> */}
      </Route>
    </Routes>
  );
};

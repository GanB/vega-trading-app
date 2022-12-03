import { Outlet, Route, Routes } from "react-router-dom";
import { GuestUserHome } from "../home/GuestUserHome";

export const GuestUserViews = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <h1>Welcome, Guest User</h1>

            <Outlet />
          </>
        }
      >
        <Route path="guest-home" element={<GuestUserHome />} />
      </Route>
    </Routes>
  );
};

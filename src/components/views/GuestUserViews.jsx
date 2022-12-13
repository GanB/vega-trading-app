import { Outlet, Route, Routes } from "react-router-dom";
import { GuestUserHome } from "../home/GuestUserHome";

export const GuestUserViews = (props) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <h1>Welcome,</h1>

            <Outlet />
          </>
        }
      >
        <Route path="guest-home" element={<GuestUserHome />} />
      </Route>
    </Routes>
  );
};

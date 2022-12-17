import { Outlet, Route, Routes } from "react-router-dom";
import { RegisteredUserHome } from "../home/RegisteredUserHome";
import { Profile } from "../profiles/Profile";
import { SearchResults } from "../search/SearchResults";
import { Trade } from "../trades/StockQuote";
import { Watchlist } from "../watchlists/Watchlist";
import AppBar from "@mui/material/AppBar";
import { TradeContainer } from "../trades/TradeContainer";
import { EditTrade } from "../trades/EditTrade";

export const RegisteredUserViews = (props) => {
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Outlet />
            <AppBar
              position="fixed"
              color="primary"
              sx={{ top: "auto", bottom: 0 }}
            ></AppBar>
          </>
        }
      >
        <Route path="home" element={<RegisteredUserHome />} />
        <Route path="trade" element={<TradeContainer />} />
        <Route path="trade/edit/:tradeId" element={<EditTrade />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search-result" element={<SearchResults />} />
      </Route>
    </Routes>
  );
};

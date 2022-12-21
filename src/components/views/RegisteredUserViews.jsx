import { Outlet, Route, Routes } from "react-router-dom";
import { RegisteredUserHome } from "../home/RegisteredUserHome";
import { Profile } from "../profiles/Profile";
import { SearchResults } from "../search/SearchResults";
import { Trade } from "../trades/StockQuote";
import { Watchlist } from "../watchlists/Watchlist";
import AppBar from "@mui/material/AppBar";
import { TradeContainer } from "../trades/TradeContainer";
import { EditTrade } from "../trades/EditTrade";
import { Footer } from "../nav/Footer";
import Drawer from "@mui/material/Drawer";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Box from "@mui/material/Box";

export const RegisteredUserViews = (props) => {
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Box sx={{ width: "100%", height: "100vh" }}>
              {/* <AppBar
                position="fixed"
                color="primary"
                sx={{ top: "auto", bottom: 0 }}
              ></AppBar> */}
              {/* <AppBar
                position="fixed"
                color="primary"
                sx={{ top: "auto", bottom: 0 }}
              /> */}
              <Outlet />
              <Footer />
            </Box>
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

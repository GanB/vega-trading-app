import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Drawer from "@mui/material/Drawer";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Typography from "@mui/material/Typography";

export const Footer = () => {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          // height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      >
        <List
          sx={{
            marginLeft: "80%",
            height: "2vh",
            width: "2vw",
          }}
        >
          <ListItem>
            <FacebookOutlinedIcon />
          </ListItem>
          <ListItem>
            <TwitterIcon />
          </ListItem>
          <ListItem>
            <LinkedInIcon />
          </ListItem>
        </List>

        {/* <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
      </BottomNavigation>
      <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      >
        <Typography
          variant="body2"
          sx={{ textAlign: "center", padding: "1rem", fontWeight: "bold" }}
          gutterBottom
        >
          {`Copyright © 2022 Vega Trade`}
        </Typography>

        {/* <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
      </BottomNavigation>
      {/* <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      ></BottomNavigation> */}
    </Box>
  );
};

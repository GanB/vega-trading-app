import React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#edf2fb",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary,
  fontWeight: "900",
}));

export const Profile = () => {
  const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

  return (
    <Box sx={{ width: "100%", height: "90vh", background: "#f9f9f9" }}>
      <Typography sx={{ textAlign: "center" }} variant="h3" gutterBottom>
        User Profile
      </Typography>
      <Box sx={{ width: "50%", marginLeft: "25%" }}>
        <Grid
          container
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ textAlign: "center" }}
        >
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Full Name</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.fullName}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Address</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{`123 Main St, Nashville, TN 37212`}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Email</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.email}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Phone</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{`615.999.3304`}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>SSN/TIN</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{`***-**-9999`}</Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

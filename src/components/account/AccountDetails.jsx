import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config.json";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  fontWeight: "900",
}));

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const AccountDetails = () => {
  const navigate = useNavigate();
  // const { state } = useLocation();
  const [dailyQuote, setDailyQuote] = useState({});

  return (
    <Box sx={{ width: "100%", padding: "2rem", marginLeft: "10%" }}>
      <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid
          container
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ padding: "0.5rem" }}
        >
          <Grid item xs={2}>
            <Item>Account Number</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>112220309303</Item>
          </Grid>
        </Grid>
        <Grid
          container
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ padding: "0.5rem" }}
        >
          <Grid item xs={2}>
            <Item>Net Account Value</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>
              {currencyFormatter.format(isNaN(100000) ? 0.0 : 100000)}
            </Item>
          </Grid>
          <Grid item xs={3}>
            <Item>Total Cash Purchasing Power</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>{currencyFormatter.format(isNaN(1000) ? 0.0 : 1000)}</Item>
          </Grid>
        </Grid>
        <Grid
          container
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ padding: "0.5rem" }}
        >
          <Grid item xs={2}>
            <Item>Settled</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>{currencyFormatter.format(isNaN(100) ? 0.0 : 100)}</Item>
          </Grid>
          <Grid item xs={3}>
            <Item>UnSettled</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>{currencyFormatter.format(isNaN(0) ? 0.0 : 0)}</Item>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

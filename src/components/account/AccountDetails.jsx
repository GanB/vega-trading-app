import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config.json";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#edf2fb",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary,
  fontWeight: "900",
}));

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

export const AccountDetails = () => {
  const navigate = useNavigate();
  // const { state } = useLocation();
  const [dailyQuote, setDailyQuote] = useState({});
  const [accountDetails, setAccountDetails] = useState([]);

  useEffect(() => {
    const getAccountDetails = async () => {
      const response = await fetch(
        `${api.JS_ACCOUNT}?customerId=${appuserObj.id}`
      );

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const accountDetailsFromApi = await response.json();
        console.log(accountDetailsFromApi);
        setAccountDetails(accountDetailsFromApi[0]);
      }
    };
    getAccountDetails();
  }, []);

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
            <Item>{accountDetails.accountNumber}</Item>
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
              {currencyFormatter.format(
                isNaN(accountDetails.netAccountValue)
                  ? 0.0
                  : accountDetails.netAccountValue
              )}
            </Item>
          </Grid>
          <Grid item xs={3}>
            <Item>Total Cash Purchasing Power</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>
              {currencyFormatter.format(
                isNaN(accountDetails.totalCashPurchasingPower)
                  ? 0.0
                  : accountDetails.totalCashPurchasingPower
              )}
            </Item>
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
            <Item>
              {currencyFormatter.format(
                isNaN(accountDetails.settled) ? 0.0 : accountDetails.settled
              )}
            </Item>
          </Grid>
          <Grid item xs={3}>
            <Item>UnSettled</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>
              {currencyFormatter.format(
                isNaN(accountDetails.unSettled) ? 0.0 : accountDetails.unSettled
              )}
            </Item>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

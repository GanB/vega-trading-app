import { useNavigate } from "react-router-dom";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const BalanceSheet = ({ balanceSheet }) => {
  const navigate = useNavigate();

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const financialsLoop = () => {
    for (const key in balanceSheet) {
      return (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1" gutterBottom>
                {`${balanceSheet[key].label} `}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" gutterBottom>
                {`${currencyFormatter.format(
                  isNaN(balanceSheet[key].value) ? 0.0 : balanceSheet[key].value
                )} `}
              </Typography>
            </Grid>
          </Grid>
        </>
      );
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {financialsLoop()}
          <Grid item xs={6}>
            <Typography variant="body1" gutterBottom>
              {`${balanceSheet?.fixed_assets?.label} `}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" gutterBottom>
              {`${balanceSheet?.fixed_assets?.value} `}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

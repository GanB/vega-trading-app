import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
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

export const Financials = ({ balanceSheet }) => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState([]);

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  useEffect(() => {
    const dataMap = [];

    for (const key in balanceSheet) {
      dataMap.push(
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1" gutterBottom>
                {`${balanceSheet[key].label} `}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                {`${currencyFormatter.format(
                  isNaN(balanceSheet[key].value) ? 0.0 : balanceSheet[key].value
                )} `}
              </Typography>
            </Grid>
          </Grid>
        </>
      );
    }
    setFinancialData(dataMap);
  }, [balanceSheet]);

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          padding: "1rem",
          borderStyle: "solid",
          borderSpacing: "1rem",
          borderColor: "#03045e",
          borderRadius: "15px",
          marginTop: "0.5rem",
          borderWidth: "0.10rem",
          background: "#dbe9ee",
        }}
      >
        {financialData.map((item) => item)}
      </Box>
    </>
  );
};

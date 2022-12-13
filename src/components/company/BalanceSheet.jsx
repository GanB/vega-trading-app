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

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              {`${balanceSheet?.fixed_assets?.label} `}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${balanceSheet?.fixed_assets?.value} `}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

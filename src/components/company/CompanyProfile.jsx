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

export const CompanyProfile = ({ searchResult }) => {
  const navigate = useNavigate();

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
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Description
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.description} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Company URL
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography
              variant="body1"
              component="a"
              target="_blank"
              href={`${searchResult?.results?.homepage_url}`}
              gutterBottom
            >
              {`${searchResult?.results?.homepage_url}`}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Tooltip
              title="Standard Industrial Classification Code"
              placement="top"
            >
              <Typography variant="body1" gutterBottom>
                SIC Code
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.sic_code} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              SIC Description
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.sic_description} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Total Employees
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.total_employees} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              List Date
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.list_date} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Phone Number
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.phone_number} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Address
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  {`${searchResult?.results?.address?.address1} `}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  {`${searchResult?.results?.address?.city} `}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  {`${searchResult?.results?.address?.state} `}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  {`${searchResult?.results?.address?.postal_code} `}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Exchange
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.primary_exchange} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Tooltip title="Central Index Key" placement="top">
              <Typography variant="body1" gutterBottom>
                CIK
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.cik} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Tooltip
              title=" Financial Instrument Global Identifier"
              placement="top"
            >
              <Typography variant="body1" gutterBottom>
                Share Class FIGI
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.share_class_figi} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Shares Outstanding
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.share_class_shares_outstanding} `}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" gutterBottom>
              Weighted Shares Outstanding
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" gutterBottom>
              {`${searchResult?.results?.weighted_shares_outstanding} `}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { CompanyProfile } from "./CompanyProfile";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CompanyFinancials } from "./CompanyFinancials";
import { CompanyNews } from "./CompanyNews";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import api from "../../config.json";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const CompanyDetails = ({ searchResult }) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const [ticker, setTicker] = useState("");
  const [isTickerInWatchlist, setIsTickerInWatchlist] = useState(false);
  const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

  // handler
  const addToWatchlistHandler = (e) => {
    e.preventDefault();

    const portfolioWatchlistObj = {};

    portfolioWatchlistObj.customerId = appuserObj.id;
    portfolioWatchlistObj.ticker = ticker;

    console.log(portfolioWatchlistObj);

    const sendDataToApi = async () => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioWatchlistObj),
      };

      const response = await fetch(`${api.JS_PORTFOLIO_WATCHLIST}`, options);

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const watchlistResponseFromApi = await response.json();
        console.log(watchlistResponseFromApi);
        console.log(`Stock added to watchlist`);
        navigate("/watchlist");
      }
    };
    sendDataToApi();
  };

  useEffect(() => {
    setTicker(`${searchResult?.results?.ticker}`);
  }, [searchResult]);

  useEffect(() => {
    const getWatchList = async () => {
      const response = await fetch(
        `${api.JS_PORTFOLIO_WATCHLIST}?ticker=${ticker}&customerId=${appuserObj.id}`
      );

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const watchlistResponseFromApi = await response.json();
        console.log(watchlistResponseFromApi);
        setIsTickerInWatchlist(false);
        watchlistResponseFromApi.map((watchlist) => {
          if (watchlist?.ticker === ticker) setIsTickerInWatchlist(true);
        });
      }
    };
    if (ticker) getWatchList();
  }, [ticker]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Typography
        variant="h3"
        sx={{ textAlign: "center", padding: "1rem" }}
        gutterBottom
      >
        {`${searchResult?.results?.name} (${searchResult?.results?.ticker})`}
      </Typography>
      <Box sx={{ width: "100%", textAlign: "center" }}>
        <Stack direction="row" spacing={2} sx={{ marginLeft: "40%" }}>
          {!isTickerInWatchlist && (
            <Tooltip title="Add to Watchlist" placement="top">
              <Button variant="contained" onClick={addToWatchlistHandler}>
                <AddOutlinedIcon />{" "}
              </Button>
            </Tooltip>
          )}

          <Button
            variant="contained"
            onClick={() => {
              navigate(`/trade`, { state: { ticker } });
            }}
          >
            Trade
          </Button>
        </Stack>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Company Profile" {...a11yProps(0)} />
            <Tab label="Financials" {...a11yProps(1)} />
            <Tab label="News" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <CompanyProfile searchResult={searchResult} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CompanyFinancials ticker={searchResult?.results?.ticker} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CompanyNews ticker={searchResult?.results?.ticker} />
        </TabPanel>
      </Box>
    </>
  );
};

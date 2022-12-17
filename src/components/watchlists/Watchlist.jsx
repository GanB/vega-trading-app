import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import { AccountDetails } from "../account/AccountDetails";
import api from "../../config.json";
import { DataGrid } from "@mui/x-data-grid";

export const Watchlist = () => {
  const navigate = useNavigate();
  const [portfolioWatchlist, setPortfolioWatchlist] = useState([]);
  const [dataGridFormattted, setDataGridFormattted] = useState([]);
  const [rowsToDisplay, setRowsToDisplay] = useState([]);
  const [emergency, setEmergency] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const previousDay = () => {
    const previousDate = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24);
    console.log(previousDate.getDay());
    const previousDay = previousDate.getDay();

    if (previousDay === 0 || previousDay === 6) {
      return new Date(
        previousDate.valueOf() - 1000 * 60 * 60 * 24 * 2
      ).toLocaleDateString("en-CA");
    }
    return previousDate.toLocaleDateString("en-CA");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "trade",
      headerName: "",
      width: 110,
      renderCell: (params) => {
        return (
          <Button
            variant="outlined"
            onClick={() => {
              console.log("Trade button clicked", params.row);
              const ticker = params.row.ticker;
              navigate(`/trade`, { state: { ticker } });
            }}
          >
            Trade
          </Button>
        );
      },
    },
    {
      field: "ticker",
      headerName: "Symbol",
      width: 110,
    },
    {
      field: "open",
      headerName: "Open",
      width: 110,
    },
    {
      field: "close",
      headerName: "Close",
      width: 110,
    },
    {
      field: "high",
      headerName: "High",
      width: 110,
    },
    {
      field: "low",
      headerName: "Low",
      width: 110,
    },
    {
      field: "volume",
      headerName: "Volume",
      width: 110,
    },
    {
      field: "afterHours",
      headerName: "After Hours",
      width: 110,
    },
    {
      field: "preMarket",
      headerName: "Pre Market",
      width: 110,
    },
    {
      field: "delete",
      headerName: "",
      width: 110,
      renderCell: (params) => {
        return (
          <Button
            variant="outlined"
            onClick={() => {
              console.log("delete button clicked", params.row);
              // navigate(`/trade/edit/${params.row.id}`);
              const sendDataToApi = async () => {
                const options = {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                };

                const response = await fetch(
                  `${api.JS_PORTFOLIO_WATCHLIST}/${params.row.id}`,
                  options
                );

                if (!response.ok) {
                  console.log(response.status, response.statusText);
                } else {
                  console.log(`watchlist deleted`);
                  const deleteWatchlistResponseFromApi = await response.json();
                  console.log(deleteWatchlistResponseFromApi);
                  setIsDeleted(true);
                }
              };
              sendDataToApi();
            }}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

  useEffect(() => {
    const getPortfolioWatchList = async () => {
      const response = await fetch(
        `${api.JS_PORTFOLIO_WATCHLIST}?customerId=${appuserObj.id}`
      );

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const portfolioWatchlistFromApi = await response.json();
        console.log(portfolioWatchlistFromApi);
        setPortfolioWatchlist(portfolioWatchlistFromApi);
      }
    };
    getPortfolioWatchList();
  }, []);

  useEffect(() => {
    const getPortfolioWatchList = async () => {
      const response = await fetch(
        `${api.JS_PORTFOLIO_WATCHLIST}?customerId=${appuserObj.id}`
      );

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const portfolioWatchlistFromApi = await response.json();
        console.log(portfolioWatchlistFromApi);
        setPortfolioWatchlist(portfolioWatchlistFromApi);
      }
    };
    getPortfolioWatchList();
  }, [isDeleted]);

  useEffect(() => {
    const dataGridRows = portfolioWatchlist.map((watchlist) => {
      console.log(watchlist);

      return {
        id: watchlist.id,
        ticker: watchlist.ticker,
        open: currencyFormatter.format(
          isNaN(watchlist.open) ? 0.0 : watchlist.open
        ),
        close: currencyFormatter.format(
          isNaN(watchlist.close) ? 0.0 : watchlist.close
        ),
        high: currencyFormatter.format(
          isNaN(watchlist.high) ? 0.0 : watchlist.high
        ),
        low: currencyFormatter.format(
          isNaN(watchlist.low) ? 0.0 : watchlist.low
        ),
        volume: watchlist.volume,
        afterHours: currencyFormatter.format(
          isNaN(watchlist.afterHours) ? 0.0 : watchlist.afterHours
        ),
        preMarket: currencyFormatter.format(
          isNaN(watchlist.preMarket) ? 0.0 : watchlist.preMarket
        ),
      };
    });

    console.log(dataGridRows);
    setDataGridFormattted(dataGridRows);
  }, [portfolioWatchlist]);

  // useEffect(() => {
  //   const dataGridRows = dataGridFormattted.map((watchlist) => {
  //     const DAILY_OPEN_CLOSE_API = `${
  //       api.DAILY_OPEN_CLOSE
  //     }${watchlist.ticker.toUpperCase()}/${previousDay()}?adjusted=true&apiKey=${
  //       process.env.REACT_APP_PG_API_KEY
  //     }`;

  //     const response = fetch(DAILY_OPEN_CLOSE_API);
  //     if (!response.ok) {
  //       console.log(response.status, response.statusText);
  //     } else {
  //       const tickerResultFromApi = response.json();
  //       console.log("tickerResultFromApi", tickerResultFromApi);

  //       watchlist.open = tickerResultFromApi?.open;
  //       watchlist.close = tickerResultFromApi?.close;
  //       watchlist.high = tickerResultFromApi?.high;
  //       watchlist.low = tickerResultFromApi?.low;
  //       watchlist.volume = tickerResultFromApi?.volume;
  //       watchlist.afterHours = tickerResultFromApi?.afterHours;
  //       watchlist.preMarket = tickerResultFromApi?.preMarket;
  //     }
  //   });
  //   console.log(dataGridRows);
  //   // setDataGridFormattted(dataGridRows);
  // }, [dataGridFormattted]);

  // useEffect(() => {
  //   const previousDay = () => {
  //     const previousDate = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24);
  //     console.log(previousDate.getDay());
  //     const previousDay = previousDate.getDay();

  //     if (previousDay === 0 || previousDay === 6) {
  //       return new Date(
  //         previousDate.valueOf() - 1000 * 60 * 60 * 24 * 2
  //       ).toLocaleDateString("en-CA");
  //     }
  //     return previousDate.toLocaleDateString("en-CA");
  //   };
  //   const dataGridRows = async () => {
  //     const temp = portfolioWatchlist.map((watchlist) => {
  //       const DAILY_OPEN_CLOSE_API = `${
  //         api.DAILY_OPEN_CLOSE
  //       }${watchlist.ticker.toUpperCase()}/${previousDay()}?adjusted=true&apiKey=${
  //         process.env.REACT_APP_PG_API_KEY
  //       }`;

  //       const fetchData = async () => {
  //         console.log(DAILY_OPEN_CLOSE_API);
  //         const response = await fetch(DAILY_OPEN_CLOSE_API);
  //         if (!response.ok) {
  //           console.log(response.status, response.statusText);
  //         } else {
  //           const tickerResultFromApi = await response.json();
  //           console.log("tickerResultFromApi", tickerResultFromApi);

  //           return await {
  //             id: watchlist.id,
  //             ticker: watchlist.ticker,
  //             open: tickerResultFromApi?.open,
  //             close: tickerResultFromApi?.close,
  //             high: tickerResultFromApi?.high,
  //             low: tickerResultFromApi?.low,
  //             volume: tickerResultFromApi?.volume,
  //             afterHours: tickerResultFromApi?.afterHours,
  //             preMarket: tickerResultFromApi?.preMarket,
  //           };
  //         }
  //       };

  //       fetchData();
  //     });

  //     await console.log(`datagrid formatted`, temp);
  //     await setDataGridFormattted(temp);
  //   };

  //   dataGridRows();
  // }, [portfolioWatchlist]);

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, marginLeft: "10%" },
      }}
      noValidate
      autoComplete="off"
    >
      <Typography
        variant="h3"
        sx={{ textAlign: "center", padding: "1rem" }}
        gutterBottom
      >
        {`Portfolio Watchlist`}
      </Typography>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={dataGridFormattted}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

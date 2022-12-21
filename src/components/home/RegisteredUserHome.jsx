import { useState, useEffect } from "react";
import api from "../../config.json";
import "./Home.css";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { rows, columns } from "../data/DailyMovers";
import Typography from "@mui/material/Typography";
import { AccountDetails } from "../account/AccountDetails";


export const RegisteredUserHome = () => {
  const [stocksList, setStocksList] = useState([]);
  const [dataGridFormattted, setDataGridFormattted] = useState([]);

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

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  console.log(previousDay());
  const STOCK_SYMBOL_API = `${
    api.STOCK_SYMBOLS
  }${previousDay()}?adjusted=true&apiKey=${process.env.REACT_APP_PG_API_KEY}`;

  useEffect(() => {
    const fetchStocksList = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch(STOCK_SYMBOL_API, options);
      const stocksList = await response.json();
      console.log(stocksList.results.slice(0, 100));
      setStocksList(stocksList.results.slice(0, 100));
    };
    fetchStocksList();
  }, []);

  useEffect(() => {
    const dataGridRows = stocksList?.map((stock) => {
      return {
        id: stock.T,
        closePrice: stock.c,
        openPrice: stock.o,
        high: stock.h,
        low: stock.l,
        numberOfTransactions: stock.n,
        volume: stock.v.toLocaleString(),
        volumeWeightedAveragePrice: stock.vw,
      };
    });

    console.log(dataGridRows);
    setDataGridFormattted(dataGridRows);
  }, [stocksList]);

  return (
    <Box>
      <Box sx={{ height: 400, width: "100%", marginTop: "2rem" }}>
        <Typography variant="h3" gutterBottom>
          Daily Movers
        </Typography>
        <DataGrid
          rows={dataGridFormattted}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          sx={{
            borderColor: "#06101f",
            border: 2,
            boxShadow: 2,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f7f7ff",
              fontSize: "1rem",
            },
            bgcolor: "background.paper",
            overflow: "auto",
          }}
        />
      </Box>
      <Box sx={{ marginTop: "8rem" }}>
        <Typography variant="h4">Account Details</Typography>
        <AccountDetails />
      </Box>
    </Box>
  );
};

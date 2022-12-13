import { useState, useEffect } from "react";
import api from "../../config.json";
import "./Home.css";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { rows, columns } from "../data/DailyMovers";
import Typography from "@mui/material/Typography";

export const RegisteredUserHome = () => {
  const [stocksList, setStocksList] = useState([]);
  const previousDay = new Date(
    new Date().valueOf() - 1000 * 60 * 60 * 24
  ).toLocaleDateString("en-CA");
  const STOCK_SYMBOL_API = `${api.STOCK_SYMBOLS}
  ${previousDay}?adjusted=true&apiKey=${process.env.REACT_APP_PG_API_KEY}`;

  useEffect(() => {
    const fetchStocksList = async () => {
      // console.log(STOCK_SYMBOL_API);
      // console.log(previousDay);
      // console.log(process.env.REACT_APP_PG_API_KEY);
      // const options = {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // };
      const response = await fetch(STOCK_SYMBOL_API);
      const stocksList = await response.json();
      setStocksList(stocksList.results);
    };
    fetchStocksList();
  }, []);

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Typography variant="h3" gutterBottom>
        Daily Movers
      </Typography>
      <DataGrid
        rows={rows}
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
    // <>
    //   <article className="stocks__list">
    //     {console.log(stocksList)}
    //     {stocksList.map((stockSymbol) => (
    //       <section key={stockSymbol.T}>
    //         Ticker:{stockSymbol.T}-- Open Price: {stockSymbol.o}-- Close Price:
    //         {stockSymbol.c}-- Highest Price: {stockSymbol.h}-- Lowest Price:{" "}
    //         {stockSymbol.l}-- Volume: {stockSymbol.v}-- Volume Weighted Average:{" "}
    //         {stockSymbol.vw}-- Number Of Transctions: {stockSymbol.n}--
    //       </section>
    //     ))}
    //   </article>
    // </>
  );
};

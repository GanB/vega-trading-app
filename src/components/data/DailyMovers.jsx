import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const columns = [
  {
    field: "id",
    headerName: "Symbol",
    headerAlign: "center",
    type: "string",
    align: "center",
    width: 100,
    // renderHeader: () => <strong>{"Symbol "}</strong>,
  },
  {
    field: "closePrice",
    headerName: "Close",
    headerAlign: "center",
    type: "number",
    width: 150,
    valueGetter: (params) => {
      return currencyFormatter.format(
        isNaN(params.row.closePrice) ? 0.0 : params.row.closePrice
      );
    },
  },
  {
    field: "openPrice",
    headerName: "Open",
    headerAlign: "center",
    type: "number",
    width: 150,
    valueGetter: (params) => {
      return currencyFormatter.format(
        isNaN(params.row.openPrice) ? 0.0 : params.row.openPrice
      );
    },
  },
  {
    field: "volume",
    headerName: "Volume",
    headerAlign: "center",
    type: "number",
    width: 150,
  },
];

export const rows = [
  { id: "AAPL", closePrice: 141.2, openPrice: 143.34, volume: 35 },
  { id: "MSFT", closePrice: 142.2, openPrice: 144.34, volume: 33 },
  { id: "GOOGL", closePrice: 143.2, openPrice: 145.34, volume: 34 },
  { id: "TSLA", closePrice: 144.2, openPrice: 146.34, volume: 31 },
  { id: "AMZN", closePrice: 145.2, openPrice: 149.34, volume: 37 },
];

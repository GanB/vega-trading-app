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
import { StockQuote } from "./StockQuote";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import { AccountDetails } from "../account/AccountDetails";
import api from "../../config.json";
import { DataGrid } from "@mui/x-data-grid";

export const OrderHistory = () => {
  const navigate = useNavigate();
  const [tradeOrderHistory, setTradeOrderHistory] = useState([]);
  const [dataGridFormattted, setDataGridFormattted] = useState([]);
  const [emergency, setEmergency] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "tradeDate",
      headerName: "Trade Date",
      width: 150,
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
    },
    {
      field: "orderType",
      headerName: "Order Type",
      width: 110,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 110,
    },
    {
      field: "symbol",
      headerName: "Symbol",
      width: 110,
    },
    {
      field: "priceType",
      headerName: "Price Type",
      width: 110,
    },
    {
      field: "term",
      headerName: "Term",
      width: 110,
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
    },
    {
      field: "edit",
      headerName: "",
      width: 110,
      renderCell: (params) => {
        return params.row.priceType !== "Market" &&
          params.row.status === "Submitted" ? (
          <Button
            variant="outlined"
            onClick={() => {
              console.log("edit button clicked", params.row);
              navigate(`/trade/edit/${params.row.id}`);
            }}
          >
            Edit
          </Button>
        ) : (
          ""
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
    const getTradeOrderHistory = async () => {
      const response = await fetch(
        `${api.JS_TRADE_ORDER}?customerId=${appuserObj.id}`
      );

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const tradeOrderHistoryFromApi = await response.json();
        console.log(tradeOrderHistoryFromApi);
        setTradeOrderHistory(tradeOrderHistoryFromApi);
      }
    };
    getTradeOrderHistory();
  }, []);

  useEffect(() => {
    const dataGridRows = tradeOrderHistory.map((order) => {
      return {
        id: order.id,
        tradeDate: order.tradeDate,
        type: order.type,
        orderType: order.action,
        quantity: order.quantity,
        symbol: order.ticker,
        priceType: order.priceType,
        term: order.duration,
        price:
          order.priceType === "Market"
            ? "Mkt"
            : currencyFormatter.format(
                isNaN(order.limitPrice) ? 0.0 : order.limitPrice
              ),
        status: order.status,
      };
    });

    console.log(dataGridRows);
    setDataGridFormattted(dataGridRows);
  }, [tradeOrderHistory]);

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
        {`Order History`}
      </Typography>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={dataGridFormattted}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          initialState={{
            columns: { columnVisibilityModel: { id: false } },
          }}
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
    </Box>
  );
};

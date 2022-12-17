import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const action = [
  {
    value: "Buy",
    label: "Buy",
  },
  {
    value: "Sell",
    label: "Sell",
  },
  {
    value: "BuyToCover",
    label: "Buy To Cover",
  },
];

const priceTypes = [
  {
    value: "Market",
    label: "Market",
  },
  {
    value: "MarketOnClose",
    label: "Market On Close",
  },
  {
    value: "Limit",
    label: "Limit",
  },
  {
    value: "StopOnQuote",
    label: "Stop On Quote",
  },
  {
    value: "StopLimitOnQuote",
    label: "Stop Limit On Quote",
  },
];

const durations = [
  {
    value: "GoodForDay",
    label: "Good For Day",
  },
  {
    value: "GoodFor60Days",
    label: "Good For 60 Days",
  },
  {
    value: "ImmediateOrCancel",
    label: "Immediate Or Cancel",
  },
  {
    value: "FillOrKill",
    label: "Fill Or Kill",
  },
  {
    value: "StopLimitOnQuote",
    label: "Stop Limit On Quote",
  },
];

export const EditTrade = ({ ticker }) => {
  const navigate = useNavigate();
  const { tradeId } = useParams();
  const [tradeOrder, setTradeOrder] = useState({});
  const [tradeOrderDetails, setTradeOrderDetails] = useState({});

  const [tickerForQuote, setTickerForQuote] = useState("");

  // state for form fields
  const [enteredTicker, setEnteredTicker] = useState("");
  const [enteredQuantity, setEnteredQuantity] = useState("");
  const [enteredAction, setEnteredAction] = useState("");
  const [enteredPriceType, setEnteredPriceType] = useState("");
  const [enteredLimitPrice, setEnteredLimitPrice] = useState("");
  const [enteredStopPrice, setEnteredStopPrice] = useState("");
  const [enteredDuration, setEnteredDuration] = useState("");
  const [enteredAllOrNone, setEnteredAllOrNone] = useState(false);

  //handlers
  const editHandler = (e) => {
    e.preventDefault();

    const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

    const tradeOrderObj = {};
    const tradeDateObj = new Date().toLocaleDateString("en-CA");
    const settlementDateObj = new Date(
      new Date().valueOf() + 1000 * 60 * 60 * 24 * 3
    ).toLocaleDateString("en-CA");

    tradeOrderObj.customerId = appuserObj.id;
    tradeOrderObj.accountId = 1;
    tradeOrderObj.ticker = enteredTicker;
    tradeOrderObj.quantity = parseFloat(enteredQuantity);
    tradeOrderObj.type = "Stock/ETF";
    tradeOrderObj.action = enteredAction;
    tradeOrderObj.priceType = enteredPriceType;
    tradeOrderObj.limitPrice =
      enteredPriceType === "Market" ? 0.0 : parseFloat(enteredLimitPrice);
    tradeOrderObj.stopPrice =
      enteredPriceType === "Market" ? 0.0 : parseFloat(enteredStopPrice);
    tradeOrderObj.duration = enteredDuration;
    tradeOrderObj.allOrNone = enteredAllOrNone;
    tradeOrderObj.tradeDate = tradeDateObj;
    tradeOrderObj.settlementDate = settlementDateObj;
    tradeOrderObj.status =
      enteredPriceType === "Market" ? "Completed" : "Submitted";

    console.log(tradeOrderObj);

    const sendDataToApi = async () => {
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeOrderObj),
      };

      const response = await fetch(`${api.JS_TRADE_ORDER}/${tradeId}`, options);

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        console.log(`Trade Order Submitted`);
        const tradeOrderResponseFromApi = await response.json();
        console.log(tradeOrderResponseFromApi);
        navigate("/home");
      }
    };
    sendDataToApi();
  };

  const cancelHandler = (e) => {
    e.preventDefault();

    const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));

    const tradeOrderObj = {};
    const tradeDateObj = new Date().toLocaleDateString("en-CA");
    const settlementDateObj = new Date(
      new Date().valueOf() + 1000 * 60 * 60 * 24 * 3
    ).toLocaleDateString("en-CA");

    tradeOrderObj.customerId = appuserObj.id;
    tradeOrderObj.accountId = 1;
    tradeOrderObj.ticker = enteredTicker;
    tradeOrderObj.quantity = parseFloat(enteredQuantity);
    tradeOrderObj.type = "Stock/ETF";
    tradeOrderObj.action = enteredAction;
    tradeOrderObj.priceType = enteredPriceType;
    tradeOrderObj.limitPrice =
      enteredPriceType === "Market" ? 0.0 : parseFloat(enteredLimitPrice);
    tradeOrderObj.stopPrice =
      enteredPriceType === "Market" ? 0.0 : parseFloat(enteredStopPrice);
    tradeOrderObj.duration = enteredDuration;
    tradeOrderObj.allOrNone = enteredAllOrNone;
    tradeOrderObj.tradeDate = tradeDateObj;
    tradeOrderObj.settlementDate = settlementDateObj;
    tradeOrderObj.status = "Cancelled";

    console.log(tradeOrderObj);

    const sendDataToApi = async () => {
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeOrderObj),
      };

      const response = await fetch(`${api.JS_TRADE_ORDER}/${tradeId}`, options);

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        console.log(`Trade Order Submitted`);
        const tradeOrderResponseFromApi = await response.json();
        console.log(tradeOrderResponseFromApi);
        navigate("/home");
      }
    };
    sendDataToApi();
  };

  useEffect(() => {
    const getTradeDetails = async () => {
      const response = await fetch(`${api.JS_TRADE_ORDER}${tradeId}`);

      if (!response.ok) {
        console.log(response.status, response.statusText);
      } else {
        const tradeOrderDetailsFromApi = await response.json();
        console.log(tradeOrderDetailsFromApi);
        setTradeOrderDetails(tradeOrderDetailsFromApi);
      }
    };
    getTradeDetails();
  }, []);

  useEffect(() => {
    //state vars
    setEnteredTicker(tradeOrderDetails.ticker);
    setEnteredQuantity(tradeOrderDetails.quantity);
    setEnteredAction(tradeOrderDetails.action);
    setEnteredPriceType(tradeOrderDetails.priceType);
    setEnteredLimitPrice(tradeOrderDetails.limitPrice);
    setEnteredStopPrice(tradeOrderDetails.stopPrice);
    setEnteredDuration(tradeOrderDetails.duration);
    setEnteredAllOrNone(tradeOrderDetails.allOrNone);
  }, [tradeOrderDetails]);

  useEffect(() => {
    setEnteredTicker(ticker?.toUpperCase());
    setTickerForQuote(ticker?.toUpperCase());
  }, [ticker]);

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
        {`Edit Trade Order`}
      </Typography>
      <AccountDetails />
      <StockQuote ticker={enteredTicker} />
      <Box sx={{ paddingTop: "1rem" }}>
        <TextField
          select
          id="filled-required"
          label="Action"
          disabled
          variant="filled"
          sx={{ width: "30ch" }}
          value={enteredAction}
          onChange={(e) => {
            setEnteredAction(e.target.value);
          }}
        >
          {action.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="filled-required"
          label="Quantity"
          variant="filled"
          sx={{ width: "30ch" }}
          value={enteredQuantity}
          onChange={(e) => {
            setEnteredQuantity(e.target.value);
          }}
        />
        <TextField
          select
          id="filled-required"
          label="Price Type"
          variant="filled"
          sx={{ width: "30ch" }}
          value={enteredPriceType}
          onChange={(e) => {
            setEnteredPriceType(e.target.value);
          }}
        >
          {priceTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {enteredPriceType === "Limit" ? (
          <TextField
            id="filled-required"
            label="Limit Price"
            variant="filled"
            sx={{ width: "30ch" }}
            value={enteredLimitPrice}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            onChange={(e) => {
              setEnteredLimitPrice(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {enteredPriceType === "StopOnQuote" ? (
          <TextField
            id="filled-required"
            label="Stop Price"
            variant="filled"
            sx={{ width: "30ch" }}
            value={enteredStopPrice}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            onChange={(e) => {
              setEnteredStopPrice(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {enteredPriceType === "StopLimitOnQuote" ? (
          <>
            <TextField
              id="filled-required"
              label="Limit Price"
              variant="filled"
              sx={{ width: "30ch" }}
              value={enteredLimitPrice}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              onChange={(e) => {
                setEnteredLimitPrice(e.target.value);
              }}
            />
            <TextField
              id="filled-required"
              label="Stop Price"
              variant="filled"
              sx={{ width: "30ch" }}
              value={enteredStopPrice}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              onChange={(e) => {
                setEnteredStopPrice(e.target.value);
              }}
            />
          </>
        ) : (
          ""
        )}
        <TextField
          select
          id="filled-required"
          label="Duration"
          variant="filled"
          sx={{ width: "30ch" }}
          value={enteredDuration}
          onChange={(e) => {
            setEnteredDuration(e.target.value);
          }}
        >
          {durations.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          sx={{
            marginLeft: "10%",
            "& .MuiSvgIcon-root": { fontSize: 28 },
            marginTop: "1rem",
          }}
          control={<Switch />}
          label="All or None"
          value={enteredAllOrNone}
          onChange={(e) => {
            setEnteredAllOrNone(e.target.checked);
          }}
        />
      </Box>
      <Box sx={{ width: "100%", textAlign: "center", marginTop: "3%" }}>
        <Stack direction="row" spacing={2} sx={{ marginLeft: "40%" }}>
          <Button
            variant="contained"
            onClick={editHandler}
            disabled={
              !enteredAction ||
              !enteredQuantity ||
              !enteredPriceType ||
              !enteredTicker ||
              !enteredDuration
            }
          >
            Submit Changes
          </Button>

          <Button variant="outlined" onClick={cancelHandler}>
            Cancel Order
          </Button>
        </Stack>
      </Box>
      <Box sx={{ width: "100%", textAlign: "center", marginTop: "3%" }}>
        <Stack direction="row" spacing={2} sx={{ marginLeft: "40%" }}>
          <Button
            variant="outlined"
            onClick={() => {
              navigate(`/trade`);
            }}
          >
            Cancel changes and Exit
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

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
  {
    value: "Limit",
    label: "Limit",
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
  {
    value: "Limit",
    label: "Limit",
  },
];

export const TradeForm = () => {
  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "50ch", marginLeft: "10%" },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="filled-required"
        label="Symbol"
        variant="filled"
        defaultValue="AAPL"
      />
      <TextField select id="filled-required" label="Action" variant="filled">
        {action.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField id="filled-required" label="Quantity" variant="filled" />
      <TextField
        select
        id="filled-required"
        label="Price Type"
        variant="filled"
      >
        {priceTypes.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField select id="filled-required" label="Duration" variant="filled">
        {durations.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <FormGroup>
        <FormControlLabel control={<Checkbox />} label="All or None" />
      </FormGroup>
    </Box>
  );
};

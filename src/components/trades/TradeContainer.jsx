import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { TradeForm } from "./TradeForm";

export const TradeContainer = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <>
      <TradeForm ticker={state?.ticker} />
    </>
  );
};

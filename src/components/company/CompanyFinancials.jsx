import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../../config.json";
import { BalanceSheet } from "./BalanceSheet";

export const CompanyFinancials = ({ ticker }) => {
  const [financialsFromApi, setFinancialsFromApi] = useState({});
  const STOCK_FINANCIALS_API = `${
    api.STOCK_FINANCIALS
  }?ticker=${ticker.toUpperCase()}&timeframe=annual&filing_date.gte=2022-01-01&apiKey=${
    process.env.REACT_APP_PG_API_KEY
  }`;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(STOCK_FINANCIALS_API);
      const financialsResultFromApi = await response.json();
      setFinancialsFromApi(financialsResultFromApi.results[0]);
    };
    fetchData();
  }, []);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Balance Sheet</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BalanceSheet
            balanceSheet={financialsFromApi?.financials?.balance_sheet}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Cash Flow Statement</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Comprehensive Income</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Income Statement</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

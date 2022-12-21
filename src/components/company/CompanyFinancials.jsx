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
  const [balanceSheetInfo, setBalanceSheetInfo] = useState({});
  const [cashFlowInfo, setCashFlowInfo] = useState({});
  const [comprehensiveIncomeInfo, setComprehensiveIncomeInfo] = useState({});
  const [incomeStatementInfo, setIncomeeStatementInfo] = useState({});

  const STOCK_FINANCIALS_API = `${
    api.STOCK_FINANCIALS
  }?ticker=${ticker.toUpperCase()}&timeframe=annual&filing_date.gte=2022-01-01&apiKey=${
    process.env.REACT_APP_PG_API_KEY
  }`;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(STOCK_FINANCIALS_API);
      const financialsResultFromApi = await response.json();
      console.log(financialsResultFromApi.results[0].financials.balance_sheet);
      setFinancialsFromApi(financialsResultFromApi.results[0]);
      setBalanceSheetInfo(
        financialsResultFromApi.results[0].financials.balance_sheet
      );
      setCashFlowInfo(
        financialsResultFromApi.results[0].financials.cash_flow_statement
      );
      setComprehensiveIncomeInfo(
        financialsResultFromApi.results[0].financials.comprehensive_income
      );
      setIncomeeStatementInfo(
        financialsResultFromApi.results[0].financials.income_statement
      );
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
          <BalanceSheet balanceSheet={balanceSheetInfo} />
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
          <BalanceSheet balanceSheet={cashFlowInfo} />
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
          <BalanceSheet balanceSheet={comprehensiveIncomeInfo} />
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
          <AccordionDetails>
            <BalanceSheet balanceSheet={incomeStatementInfo} />
          </AccordionDetails>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

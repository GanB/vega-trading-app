import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../../config.json";
import Typography from "@mui/material/Typography";
import { CompanyDetails } from "../company/CompanyDetails";

export const SearchResults = () => {
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState({});
  const { state } = useLocation();

  const TICKER_SEARCH_API = `${
    api.TICKER_SEARCH
  }${state.searchTerm.toUpperCase()}?apiKey=${
    process.env.REACT_APP_PG_API_KEY
  }`;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(TICKER_SEARCH_API);
      const tickerResultFromApi = await response.json();
      setSearchResult(tickerResultFromApi);
    };
    fetchData();
  }, [state.searchTerm]);

  return (
    <>
      <CompanyDetails searchResult={searchResult} />
    </>
  );
};

import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../../config.json";
import { BalanceSheet } from "./BalanceSheet";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

export const CompanyNews = ({ ticker }) => {
  const [tickerNews, setTickerNews] = useState([]);

  const NEWS_API = `${api.NEWS_API}?ticker=${ticker.toUpperCase()}&apiKey=${
    process.env.REACT_APP_PG_API_KEY
  }`;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(NEWS_API);
      const newsResultFromApi = await response.json();
      console.log(newsResultFromApi.results);
      setTickerNews(newsResultFromApi.results);
    };
    fetchData();
  }, []);

  return (
    <div>
      {" "}
      <Box sx={{ flexGrow: 1 }}>
        {tickerNews.map((item) => {
          return (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body1" gutterBottom>
                  {item.description}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography
                  variant="body1"
                  component="a"
                  target="_blank"
                  href={item.article_url}
                  gutterBottom
                >
                  {item.article_url}
                </Typography>
              </Grid>
            </Grid>
          );
        })}
      </Box>
    </div>
  );
};

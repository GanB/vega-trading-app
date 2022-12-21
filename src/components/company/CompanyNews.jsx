import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../../config.json";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MediaCard from "./MediaCard";

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
      <Box
        sx={{
          flexGrow: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        {tickerNews.map((item) => {
          return (
            // <Grid
            //   container
            //   spacing={2}
            //   sx={{
            //     padding: "1rem",
            //     borderStyle: "solid",
            //     borderSpacing: "1rem",
            //     borderColor: "#03045e",
            //     borderRadius: "15px",
            //     marginTop: "0.5rem",
            //     borderWidth: "0.10rem",
            //   }}
            // >
            //   <Grid item xs={6}>
            //     <Typography variant="body2" gutterBottom>
            //       {item.description}
            //     </Typography>
            //   </Grid>
            //   <Grid item xs={6}>
            //     <Typography
            //       variant="body1"
            //       component="a"
            //       target="_blank"
            //       href={item.article_url}
            //       gutterBottom
            //     >
            //       {item.title}
            //     </Typography>
            //   </Grid>
            // </Grid>
            <MediaCard data={item} />
          );
        })}
      </Box>
    </div>
  );
};
